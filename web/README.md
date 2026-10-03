# MuseAI web

The website for MuseAI: Vite + React + TypeScript, with Motion for the intro and the Web Audio API for playback and analysis. It talks to the FastAPI backend in `../backend`.

## Run backend + frontend together

Two terminals, both from the repo root (`MuseAI/`).

**1. Backend** (port 8000; the first start downloads and warms up the model):

```bash
PYTHONPATH=. .venv/bin/uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

**2. Frontend** (port 5180):

```bash
cd web && npm install && npm run dev -- --port 5180
```

Open http://localhost:5180.

To open it on a phone on the same Wi-Fi, start both servers with `--host 0.0.0.0` and set `VITE_API_URL` to your computer's LAN address (for example `http://192.168.1.20:8000`).

## Configuration

`web/.env` (copy from `.env.example`):

```
VITE_API_URL=http://127.0.0.1:8000
```

## Build

```bash
cd web && npm run build    # output in web/dist
npm run preview            # serve the build locally
```

## Where things live

| Section | File |
| --- | --- |
| Intro (Motion) | `src/components/Intro.tsx` |
| Hero: disc, arm, scope, knobs, speaker | `src/components/Hero.tsx`, `Knob.tsx` |
| Ticker, words → sound, how it works | `Ticker.tsx`, `WordsToSound.tsx`, `HowItWorks.tsx` |
| Composer + result | `Composer.tsx`, `Brief.tsx` |
| Presets, library, spec sheet, footer | `Presets.tsx`, `Library.tsx`, `SpecSheet.tsx`, `Footer.tsx` |
| Audio decode, FFT analysis, playback | `src/lib/player.ts` |
| Backend calls | `src/lib/api.ts` |
| Scroll motion, cursor, note burst | `src/lib/motion.ts` |
| Prompt preview (mirrors `backend/prompt_processor.py`) | `src/lib/data.ts` |

`src/styles.css` is the CSS from `design/reference.html`, unchanged. Phone and touch additions are in `src/mobile.css`.
