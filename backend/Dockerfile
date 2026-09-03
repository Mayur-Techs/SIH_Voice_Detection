# SHRAV Backend — HuggingFace Spaces / Render Dockerfile
# Plan A (HF Spaces): expose port 7860
# Plan B (Render): expose port 10000 (set PORT env var)

FROM python:3.11-slim

WORKDIR /app

# System deps for librosa (libsndfile) and weasyprint
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download model weights at build time → no cold-start download delay
# HF_TOKEN is passed as a build arg (set in HF Spaces secrets, never hardcoded)
ARG HF_TOKEN=""
ARG MODEL_REPO="garystafford/wav2vec2-deepfake-voice-detector"
RUN python -c "
import os
from huggingface_hub import snapshot_download
tok = os.environ.get('HF_TOKEN', '') or '${HF_TOKEN}'
repo = os.environ.get('MODEL_REPO', '${MODEL_REPO}')
if repo:
    kw = dict(token=tok) if tok else {}
    snapshot_download(repo, **kw)
    print(f'Model {repo} pre-downloaded.')
"

COPY . .

# HF Spaces default port is 7860; Render uses PORT env var
ENV PORT=7860
EXPOSE 7860

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]
