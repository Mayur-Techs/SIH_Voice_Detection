# SHRAV — श्रव

> **Marathi-first voice impersonation detection system.** Protects users from AI-generated / deepfake voice fraud.

[![CI/CD](https://github.com/YOUR_USERNAME/SIH_Voice_Detection/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/SIH_Voice_Detection/actions)

---

## What it does

SHRAV analyzes uploaded or recorded speech for deepfake / AI-generated voice signals and returns a **risk score (0–100%)** with actionable verification guidance.

| Risk Level | Score | Meaning |
|------------|-------|---------|
| ✅ Low | < 40% | Voice appears genuine |
| ⚠️ Caution | 40–70% | Suspicious — verify the caller |
| 🚨 High | > 70% | Likely AI-generated — do not proceed |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + Chakra UI + Framer Motion |
| Waveform | Wavesurfer.js 7 |
| i18n | next-i18next (Marathi · Hindi · English) |
| Backend | FastAPI + Uvicorn (Python 3.11) |
| AI Model | `mo-thecreator/Deepfake-audio-detection` (wav2vec2) |
| Audio preprocessing | librosa + soundfile |
| Frontend deploy | Vercel (free tier) |
| Backend deploy | Railway.app (free tier) |
| CI/CD | GitHub Actions |

---

## Project Structure

```
SIH_Voice_Detection/
├── frontend/          # Next.js app → deployed to Vercel
│   ├── pages/
│   │   ├── index.tsx         # Main dashboard
│   │   └── api/analyze.ts    # Proxy to FastAPI backend
│   ├── components/
│   │   ├── AudioInput.tsx    # File upload + mic recording
│   │   ├── Waveform.tsx      # Wavesurfer.js waveform display
│   │   ├── RiskMeter.tsx     # Animated circular risk gauge
│   │   ├── PipelineViz.tsx   # Animated analysis pipeline
│   │   ├── ActionPanel.tsx   # Actionable buttons (Call Back, MFA)
│   │   └── LanguageSelector.tsx
│   ├── public/locales/
│   │   ├── mr/common.json   # Marathi strings
│   │   ├── hi/common.json   # Hindi strings
│   │   └── en/common.json   # English strings
│   └── styles/theme.ts      # Chakra custom theme (dark navy)
│
├── backend/           # FastAPI app → deployed to Railway
│   ├── main.py        # FastAPI app, CORS, /api/analyze endpoint
│   ├── model.py       # HuggingFace model loader + inference
│   ├── schemas.py     # Pydantic request/response models
│   ├── test_main.py   # pytest integration tests
│   ├── Procfile       # Railway process definition
│   └── requirements.txt
│
└── .github/workflows/
    └── deploy.yml     # CI lint + test + deploy pipeline
```

---

## Local Development

### Prerequisites
- Node.js 20+
- Python 3.11+
- pip

### 1. Backend

```powershell
cd backend

# Create and activate the virtual environment (one-time)
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env config
copy .env.example .env

# Run dev server (model downloads ~1.5GB on first run, cached after that)
python -m uvicorn main:app --reload --port 8000
```

> **Important:** Always use `python -m uvicorn` (not bare `uvicorn`). The bare command may resolve a stale launcher from a previously uninstalled Python version.

> **First run** downloads the `mo-thecreator/Deepfake-audio-detection` model. This is cached to `~/.cache/huggingface/` and is not re-downloaded on subsequent runs.

---

## API Reference

### `GET /health`

```json
{ "status": "ok", "model_loaded": true }
```

### `POST /api/analyze`

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `audio` | file | WAV / MP3 / OGG / WEBM (max 25MB) |
| `language` | string | `"Marathi"` / `"Hindi"` / `"English"` |

**Response:**
```json
{
  "risk_score": 78.3,
  "level": "High",
  "action": "VERIFY IDENTITY",
  "confidence": 0.91,
  "language": "Marathi",
  "message_mr": "उच्च धोका! AI-निर्मित आवाजाची शक्यता. ओळख पडताळा.",
  "message_en": "HIGH RISK! Likely AI-generated voice. Verify identity immediately."
}
```

---

## Deployment

### Frontend → Vercel

1. Import the repo into [Vercel](https://vercel.com) → set **Root Directory** to `frontend`
2. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app`
3. Deploy

### Backend → Railway

1. Create a new project at [Railway.app](https://railway.app)
2. Connect GitHub repo → set **Root Directory** to `backend`
3. Set environment variables:
   ```
   MODEL_NAME=mo-thecreator/Deepfake-audio-detection
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```
4. Deploy (Railway will use `Procfile` automatically)

### GitHub Secrets (for CI/CD)

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Found in Vercel project settings |
| `VERCEL_PROJECT_ID` | Found in Vercel project settings |
| `RAILWAY_DEPLOY_WEBHOOK` | Railway project deploy webhook URL |

---

## Running Tests

```bash
cd backend
pytest test_main.py -v
```

---

## Privacy

- **No audio is stored.** All processing is in-memory only.
- No user accounts, no cookies, no tracking.
- HTTPS enforced on both Vercel and Railway.

---

## Roadmap

- [ ] WebSocket streaming for live recording analysis
- [ ] React Three Fiber 3D pipeline visualization
- [ ] Improved Marathi-specific model (fine-tuned on IndicSynth/ASVspoof)
- [ ] PWA support for mobile use
- [ ] Admin dashboard for aggregate risk analytics (opt-in)

---

## License

MIT © 2024 SHRAV Project
