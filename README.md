# MuseAI — AI Music Composer 🎵🤖

MuseAI is an end-to-end Generative AI application that empowers users to compose original musical compositions from natural-language descriptions and structured musical preferences. 

Powered by **Meta's MusicGen-small** model via **Hugging Face Transformers** and accelerated locally on **Apple Silicon GPU (MPS)**, MuseAI generates WAV audio compositions, analyzes audio properties, and visualizes waveforms and frequency spectrograms in a Flutter application.

---

## 🏗️ System Architecture

```text
Flutter Frontend
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
* **Frontend Application**: Flutter 3.41.6, Dart 3.11.4
* **Audio Playback**: `audioplayers` package

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
├── flutter_app/
│   ├── lib/
│   │   ├── main.dart         # Flutter entry point & theme configuration
│   │   ├── theme/            # Dark glassmorphic theme tokens
│   │   ├── models/           # Data models (MusicRequest, MusicResult)
│   │   ├── services/         # ApiService & AudioPlayerService
│   │   ├── widgets/          # GlassCard & Custom WaveformPainter
│   │   └── screens/          # HomeScreen, GeneratingScreen, ResultScreen, HistoryScreen
│   └── pubspec.yaml          # Flutter dependencies
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
* Flutter SDK (v3.41.6+)

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

### 3. Running the Flutter Frontend

Open a new terminal window:

```bash
cd flutter_app

# Fetch Flutter dependencies
flutter pub get

# Launch the Flutter app (macOS Desktop, iOS Simulator, or Chrome)
flutter run -d macos
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Check backend health, device (`mps`), and model ID |
| `POST` | `/generate` | Generate music composition from prompt & controls |
| `GET` | `/audio/{id}` | Serve generated WAV audio file |
| `GET` | `/waveform/{id}` | Serve rendered waveform PNG image |
| `GET` | `/spectrogram/{id}` | Serve rendered spectrogram PNG image |
| `POST` | `/regenerate` | Re-trigger generation for a previous composition |
| `GET` | `/history` | Fetch history of past generation records |

---

## 🧪 Testing & Verification

### Run Automated Backend Unit & Integration Tests

```bash
PYTHONPATH=. .venv/bin/pytest -v
```

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
