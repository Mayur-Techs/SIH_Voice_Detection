"""
SHRAV — FastAPI Backend v2
Session-based voice deepfake detection API.
No raw audio is ever persisted — everything lives in memory per session TTL.
"""
import os
import uuid
import asyncio
import logging
import time
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from dotenv import load_dotenv

from schemas import HealthResponse, UploadResponse, ReportResponse
import model as detector
import pdf_report as pdf_gen

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s \u2014 %(message)s",
)
logger = logging.getLogger(__name__)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,https://shrav.vercel.app",
).split(",")

MAX_AUDIO_BYTES = 25 * 1024 * 1024  # 25 MB
SESSION_TTL = 600  # 10 minutes

# In-memory session store
# { session_id: { audio_bytes, duration_sec, report, created_at, filename } }
SESSION_STORE: dict[str, dict] = {}


def _cleanup_sessions() -> None:
    now = time.time()
    expired = [sid for sid, s in SESSION_STORE.items() if now - s["created_at"] > SESSION_TTL]
    for sid in expired:
        del SESSION_STORE[sid]
        logger.info(f"Session {sid[:8]} expired and cleaned up.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("SHRAV v2 backend starting \u2014 loading detection model...")
    detector.load_model()
    yield
    logger.info("SHRAV v2 backend shutting down.")


app = FastAPI(
    title="SHRAV Voice Deepfake Detection API",
    description=(
        "Marathi-first voice impersonation detection. "
        "Session-based, in-memory only \u2014 no raw audio persistence."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ─────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["Monitoring"])
async def health_check():
    return HealthResponse(
        status="ok",
        model=detector.MODEL_DISPLAY_NAME,
        model_loaded=detector.is_model_loaded(),
    )


# ── Upload ─────────────────────────────────────────────────────────────────

@app.post("/session/upload", response_model=UploadResponse, tags=["Session"])
async def upload_audio(
    audio: Annotated[UploadFile, File(description="Audio file (WAV, MP3, OGG, WEBM)")],
):
    """
    Accept an audio file, store it in memory, return a session_id.
    The audio is NEVER written to disk.
    """
    _cleanup_sessions()

    content_type = audio.content_type or ""
    if not any(ct in content_type for ct in ["audio", "video", "octet-stream"]):
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type: {content_type}. Upload audio/wav, mp3, ogg, or webm.",
        )

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file.")
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 25 MB limit.")

    # Estimate duration
    try:
        import librosa, io
        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=None, mono=True)
        duration_sec = round(float(len(y)) / sr, 2)
    except Exception:
        duration_sec = 0.0

    session_id = str(uuid.uuid4())
    SESSION_STORE[session_id] = {
        "audio_bytes": audio_bytes,
        "duration_sec": duration_sec,
        "report": None,
        "created_at": time.time(),
        "filename": audio.filename or "audio.wav",
    }

    logger.info(
        f"Session {session_id[:8]} created — "
        f"{audio.filename}, {duration_sec:.1f}s, {len(audio_bytes) / 1024:.1f} KB"
    )
    return UploadResponse(session_id=session_id, duration_sec=duration_sec)


# ── WebSocket stream ────────────────────────────────────────────────────────

@app.websocket("/session/{session_id}/stream")
async def stream_analysis(websocket: WebSocket, session_id: str):
    """
    Stream audio analysis results over WebSocket.
    Emits: stage events + risk_update events, closes with stage:complete.
    """
    await websocket.accept()

    if session_id not in SESSION_STORE:
        await websocket.send_json({"type": "error", "message": "Session not found."})
        await websocket.close(code=4004)
        return

    session = SESSION_STORE[session_id]
    audio_bytes: bytes = session["audio_bytes"]

    try:
        # 1. Preprocessing stage
        await websocket.send_json({"type": "stage", "stage": "preprocessing"})
        audio_array = await asyncio.get_event_loop().run_in_executor(
            None, detector.preprocess_audio, audio_bytes
        )
        await asyncio.sleep(0.05)

        # 2. Representation stage
        await websocket.send_json({"type": "stage", "stage": "representation"})
        await asyncio.sleep(0.05)

        # 3. Anti-spoof model stage — rolling windows
        await websocket.send_json({"type": "stage", "stage": "anti_spoof_model"})

        timeline: list[dict] = []
        final_score = 0.0
        final_state = "LOW_RISK"
        final_confidence = 0.0

        async for window_idx, risk_score, state, confidence in detector.analyze_windows_async(audio_array):
            t_sec = round(window_idx * detector.WINDOW_SEC, 2)
            timeline.append({"t": t_sec, "score": round(risk_score / 100.0, 4)})
            final_score = risk_score / 100.0
            final_state = state
            final_confidence = confidence

            await websocket.send_json({
                "type": "risk_update",
                "window_index": window_idx,
                "risk_score": round(risk_score / 100.0, 4),
                "state": state,
            })

        # Store final report
        report = {
            "final_state": final_state,
            "final_score": round(final_score, 4),
            "confidence": round(final_confidence, 4),
            "timeline": timeline,
            "model_used": detector.MODEL_DISPLAY_NAME,
            "recommendation": (
                "This does not prove who you were speaking to. "
                "Verify using a second channel before acting."
            ),
        }
        SESSION_STORE[session_id]["report"] = report

        # 4. Complete
        await websocket.send_json({"type": "stage", "stage": "complete"})
        logger.info(f"Session {session_id[:8]} analysis complete — {final_state}, score={final_score:.3f}")

    except WebSocketDisconnect:
        logger.info(f"WebSocket {session_id[:8]} disconnected by client.")
    except Exception as e:
        logger.exception(f"Error during streaming for session {session_id[:8]}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


# ── Report REST ─────────────────────────────────────────────────────────────

@app.get("/session/{session_id}/report", response_model=ReportResponse, tags=["Session"])
async def get_report(session_id: str):
    session = SESSION_STORE.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired.")
    report = session.get("report")
    if not report:
        raise HTTPException(status_code=425, detail="Analysis not yet complete. Connect via WebSocket first.")
    return ReportResponse(**report)


@app.get("/session/{session_id}/report.pdf", tags=["Session"])
async def get_report_pdf(session_id: str):
    session = SESSION_STORE.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired.")
    report = session.get("report")
    if not report:
        raise HTTPException(status_code=425, detail="Analysis not yet complete.")

    pdf_bytes = await asyncio.get_event_loop().run_in_executor(
        None,
        lambda: pdf_gen.generate(
            report,
            filename=session.get("filename", "audio.wav"),
            duration_sec=session.get("duration_sec", 0.0),
        ),
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="shrav-report-{session_id[:8]}.pdf"'
        },
    )