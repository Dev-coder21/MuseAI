# MuseAI — AI Music Composer 🎵🤖

MuseAI is an end-to-end Generative AI application that empowers users to compose original musical compositions from natural-language descriptions and structured musical preferences. 

Powered by **Meta's MusicGen-small** model via **Hugging Face Transformers** and accelerated locally on **Apple Silicon GPU (MPS)**, MuseAI generates WAV audio compositions, analyzes audio properties, and visualizes waveforms and frequency spectrograms in a web app that works on desktop and phone.

**Live site:** https://dev-coder21.github.io/MuseAI/ (composing needs the backend running locally, see below)

---

## 🏗️ System Architecture

```text
Web Frontend (React · web/)
       │
       ▼ (REST HTTP / JSON)
FastAPI Backend (Python 3.11)
       │
       ├──► Prompt Processor (Combines text + controls)
       │
       ├──► MusicGen Generator (Meta facebook/musicgen-small on Apple MPS GPU)
       │
       ├──► Audio Processor (Librosa / SoundFile WAV Analysis)
       │
       └──► Visualizer (Matplotlib Waveform & Spectrogram PNGs)
```

---

## 🛠️ Technology Stack

* **AI Model**: Meta `facebook/musicgen-small` (Hugging Face Transformers)
* **Backend Framework**: Python 3.11, FastAPI, Uvicorn, Pydantic
* **AI & Acceleration**: PyTorch 2.14.0 (MPS / Metal Performance Shaders for Apple Silicon)
* **Audio Analysis & Visualization**: Librosa, SoundFile, NumPy, SciPy, Matplotlib
* **Frontend**: Vite, React, TypeScript, Motion (Framer Motion), deployed to GitHub Pages
* **Audio Playback & Analysis**: Web Audio API (decoding, FFT, live scope)

---

## 📁 Repository Structure

```text
MuseAI/
├── backend/
│   ├── app.py                # FastAPI REST API endpoints
│   ├── config.py             # System paths, hardware device & model settings
│   ├── schemas.py            # Pydantic request/response models
│   ├── prompt_processor.py   # Natural language & control prompt compiler
│   ├── music_generator.py    # Singleton MusicGen-small inference engine
│   ├── audio_processor.py    # Audio analysis & waveform data extractor
│   ├── visualizer.py         # Waveform & Spectrogram PNG plot renderer
│   ├── history.py            # JSON metadata history manager
│   └── requirements.txt      # Backend dependencies
├── web/                      # Website (Vite + React + TypeScript), see web/README.md
│   ├── src/components/       # Intro, Hero, Composer, Presets, Library, ...
│   └── src/lib/              # API client, audio player + analysis, motion
├── design/reference.html     # Approved design the website is built from
├── outputs/
│   ├── audio/                # Generated .wav audio compositions
│   ├── waveforms/            # Rendered waveform .png images
│   ├── spectrograms/        # Rendered spectrogram .png images
│   └── metadata/             # Generation metadata .json records
├── tests/
│   ├── test_prompt_processor.py
│   ├── test_audio_processor.py
│   ├── test_api.py
│   └── test_generation.py
├── data/
│   └── evaluation/           # Human evaluation framework & records
├── PROJECT_SPEC.md           # Authoritative Project Specification
├── BUILD_STATUS.md           # Build Tracker & Test Verification Results
└── README.md
```

---

## 🚀 Getting Started & Running MuseAI

### 1. Prerequisites
* macOS with Apple Silicon M1 (or compatible PyTorch environment)
* Python 3.11 (installed in `./.venv`)
* Node.js 20+ and npm

### 2. Running the FastAPI Backend

Activate the Python 3.11 environment and start the server:

```bash
# Activate virtual environment
source /Users/devtrivedi/miniconda3/bin/activate /Users/devtrivedi/MuseAI/.venv

# Launch FastAPI with Uvicorn
PYTHONPATH=. uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

Alternatively, run uvicorn directly from `.venv`:

```bash
PYTHONPATH=. .venv/bin/uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

The API will be live at `http://127.0.0.1:8000`. You can test the health endpoint at:
`http://127.0.0.1:8000/health`

### 3. Running the Web Frontend

Open a new terminal window:

```bash
cd web
npm install
npm run dev -- --port 5180
```

Then open http://localhost:5180. The backend address is set by `VITE_API_URL` in `web/.env` (defaults to `http://127.0.0.1:8000`). More detail in [web/README.md](web/README.md).

### Run 5-Prompt Manual Verification Test Suite

```bash
.venv/bin/python test_manual_prompts.py
```

---

## 📊 Human Evaluation Framework

Evaluation records are stored in `data/evaluation/evaluation_template.json` covering:
1. **Prompt Match** (1–5)
2. **Mood Match** (1–5)
3. **Instrument/Style Match** (1–5)
4. **Musical Quality** (1–5)
5. **Overall Satisfaction** (1–5)

---

## ⚠️ Known Limitations & Future Work

* **Duration**: Baseline generation produces 1–15 seconds of audio per request. Longer compositions can be explored via audio continuation techniques in future updates.
* **Format**: Output is generated natively in 32 kHz WAV. MP3 encoding can be added via system FFmpeg as an optional download format.
