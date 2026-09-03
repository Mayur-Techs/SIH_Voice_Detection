"""
SHRAV — Voice Deepfake Detection Model v2
Loads a HuggingFace audio-classification pipeline at startup.
All inference is CPU-only and stateless.
Swap MODEL_REPO env var to plug in the Marathi-validated model when ready.
"""
import os
import io
import asyncio
import logging
import numpy as np
import librosa
import soundfile as sf
from typing import Tuple, AsyncGenerator

logger = logging.getLogger(__name__)

MODEL_REPO = os.getenv("MODEL_REPO", "garystafford/wav2vec2-deepfake-voice-detector")
MODEL_DISPLAY_NAME = os.getenv("MODEL_DISPLAY_NAME", "baseline-wav2vec2-antispoof-v1")
TARGET_SR = 16_000  # 16 kHz required by wav2vec2
WINDOW_SEC = 1.5   # rolling window size for streaming analysis

# Risk thresholds (score 0-100)
LOW_THRESHOLD = 40.0
HIGH_THRESHOLD = 70.0

_pipeline = None


def load_model():
    """Load model once at startup. Called by FastAPI lifespan."""
    global _pipeline
    if _pipeline is not None:
        return
    try:
        from transformers import pipeline as hf_pipeline
        hf_token = os.getenv("HF_TOKEN", None)
        logger.info(f"Loading model: {MODEL_REPO}")
        _pipeline = hf_pipeline(
            "audio-classification",
            model=MODEL_REPO,
            device=-1,  # CPU
            token=hf_token,
        )
        logger.info(f"Model loaded: {MODEL_DISPLAY_NAME}")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        _pipeline = None


def is_model_loaded() -> bool:
    return _pipeline is not None


def preprocess_audio(audio_bytes: bytes) -> np.ndarray:
    """
    Decode audio bytes (WAV/MP3/OGG/WEBM), resample to 16 kHz mono.
    Returns float32 numpy array.
    """
    buf = io.BytesIO(audio_bytes)
    try:
        audio, _ = librosa.load(buf, sr=TARGET_SR, mono=True)
    except Exception:
        buf.seek(0)
        data, sr = sf.read(buf, dtype="float32", always_2d=False)
        if data.ndim > 1:
            data = data.mean(axis=1)
        audio = librosa.resample(data, orig_sr=sr, target_sr=TARGET_SR)
    return audio.astype(np.float32)


def _score_from_labels(results: list) -> Tuple[float, float]:
    """
    Parse HuggingFace classification output.
    Returns (risk_score_0_to_100, confidence_0_to_1).
    """
    fake_score = 0.0
    real_score = 0.0
    for item in results:
        label = item["label"].lower()
        score = float(item["score"])
        if "fake" in label or "spoof" in label or "label_0" in label:
            fake_score = score
        else:
            real_score = score

    if fake_score == 0.0 and real_score == 0.0:
        fake_score = float(results[0]["score"])

    total = fake_score + real_score
    fake_fraction = fake_score / total if total > 0 else 0.5

    risk_score = round(fake_fraction * 100, 1)
    confidence = round(max(fake_score, real_score), 4)
    return risk_score, confidence


def _classify_state(risk_score: float) -> str:
    """Map risk score to exactly one of the three canonical state labels."""
    if risk_score < LOW_THRESHOLD:
        return "LOW_RISK"
    elif risk_score < HIGH_THRESHOLD:
        return "SUSPICIOUS"
    else:
        return "HIGH_RISK"


def _infer_window(audio_window: np.ndarray) -> Tuple[float, float]:
    """Run model inference on a single audio window."""
    if _pipeline is None:
        return 50.0, 0.0
    results = _pipeline(
        {"array": audio_window, "sampling_rate": TARGET_SR},
        top_k=None,
    )
    return _score_from_labels(results)


async def analyze_windows_async(
    audio_array: np.ndarray,
) -> AsyncGenerator[Tuple[int, float, str, float], None]:
    """
    Async generator: yields (window_index, risk_score_0_100, state_str, confidence)
    per rolling WINDOW_SEC window. Yields to event loop between windows so
    the WebSocket can stay alive.
    """
    window_samples = int(WINDOW_SEC * TARGET_SR)
    total_samples = len(audio_array)

    if total_samples == 0:
        # No audio — yield a single inconclusive result
        yield (0, 50.0, "LOW_RISK", 0.0)
        return

    # Ensure at least one full window
    if total_samples < window_samples:
        audio_array = np.pad(audio_array, (0, window_samples - total_samples))
        total_samples = window_samples

    running_scores: list[float] = []
    window_idx = 0

    for start in range(0, total_samples, window_samples):
        end = min(start + window_samples, total_samples)
        window = audio_array[start:end]

        if len(window) < window_samples:
            window = np.pad(window, (0, window_samples - len(window)))

        # Run inference in a thread so we don't block the event loop
        risk_score, confidence = await asyncio.get_event_loop().run_in_executor(
            None, _infer_window, window
        )

        running_scores.append(risk_score)
        smoothed = float(np.mean(running_scores))
        state = _classify_state(smoothed)

        yield (window_idx, round(smoothed, 1), state, confidence)
        window_idx += 1
        await asyncio.sleep(0)  # yield to event loop