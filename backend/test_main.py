"""
SHRAV v2 — Backend Tests
Tests the new session-based API: upload + health.
WebSocket streaming is not testable via TestClient synchronously,
so we test the upload endpoint and session store directly.
"""
import io
import struct
import wave

import pytest
from fastapi.testclient import TestClient

from main import app, SESSION_STORE

client = TestClient(app)


def _make_wav(duration_sec: float = 1.0, sample_rate: int = 16000) -> bytes:
    """Generate a minimal silent WAV file in memory."""
    n_samples = int(duration_sec * sample_rate)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(b"\x00\x00" * n_samples)
    return buf.getvalue()


# ── Health ──────────────────────────────────────────────────────────────────

def test_health_returns_200():
    resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert "model" in body
    assert "model_loaded" in body


def test_health_model_field_is_string():
    resp = client.get("/health")
    assert isinstance(resp.json()["model"], str)
    assert len(resp.json()["model"]) > 0


# ── Upload ───────────────────────────────────────────────────────────────────

def test_upload_valid_wav_returns_session_id():
    wav = _make_wav()
    resp = client.post(
        "/session/upload",
        files={"audio": ("test.wav", wav, "audio/wav")},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "session_id" in body
    assert isinstance(body["session_id"], str)
    assert len(body["session_id"]) == 36  # UUID
    assert "duration_sec" in body
    assert body["duration_sec"] >= 0


def test_upload_empty_file_returns_400():
    resp = client.post(
        "/session/upload",
        files={"audio": ("empty.wav", b"", "audio/wav")},
    )
    assert resp.status_code == 400


def test_upload_creates_session_in_store():
    SESSION_STORE.clear()
    wav = _make_wav()
    resp = client.post(
        "/session/upload",
        files={"audio": ("test.wav", wav, "audio/wav")},
    )
    assert resp.status_code == 200
    sid = resp.json()["session_id"]
    assert sid in SESSION_STORE
    assert SESSION_STORE[sid]["audio_bytes"] == wav


def test_report_before_analysis_returns_425():
    SESSION_STORE.clear()
    wav = _make_wav()
    resp = client.post(
        "/session/upload",
        files={"audio": ("test.wav", wav, "audio/wav")},
    )
    sid = resp.json()["session_id"]
    report_resp = client.get(f"/session/{sid}/report")
    assert report_resp.status_code == 425


def test_report_unknown_session_returns_404():
    resp = client.get("/session/nonexistent-id/report")
    assert resp.status_code == 404