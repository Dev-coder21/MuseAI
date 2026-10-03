# MuseAI web redesign — build brief for Claude Code

## Goal
Replace the Flutter frontend with a new web frontend that matches `design/reference.html` exactly
(look, layout, copy, intro animation, scroll motion). The FastAPI backend stays as it is.

`design/reference.html` is the approved design. Open it in a browser and treat it as the spec.
Everything in it that is simulated (browser-synth audio, fake history rows) must be replaced
with real data from the backend.

## Stack
- Vite + React + TypeScript in a new folder `web/`
- `motion` (Framer Motion) — `import { motion, animate, AnimatePresence } from "motion/react"`
- Plain CSS (port the CSS tokens and rules from the reference; keep the same fonts:
  Archivo + IBM Plex Mono from Google Fonts)
- Web Audio API for playback, the analyser (CRT scope, speaker grille) and the disc
- Leave `flutter_app/` untouched for now

## Backend (already running at http://127.0.0.1:8000, CORS allows all origins)
- `GET /health` → status, device, model id
- `POST /generate` body: `{prompt, mood, genre, instrument, intensity, tempo, purpose, duration}` (duration 1–30)
  → `{generation_id, original_prompt, final_prompt, controls, duration_seconds, sampling_rate,
     audio_url, waveform_url, spectrogram_url, waveform_points, generation_time_seconds, device, created_at}`
- `POST /regenerate` body: `{generation_id, prompt_override?}`
- `GET /audio/{id}` (WAV), `GET /waveform/{id}` (PNG), `GET /spectrogram/{id}` (PNG)
- `GET /history?limit=20`
Put the base URL in `VITE_API_URL`.

## Component map (reference section → React)
1. `Intro` — the Framer Motion intro, ported as is: tilted close-up → top view → exploded →
   assembled → dive into the red disc → circle reveal onto the hero disc. Skip button,
   "Replay intro" link, skipped entirely with prefers-reduced-motion.
2. `Hero` — disc (canvas), arm, CRT scope, ring switches, knobs, volume, speaker grille.
   The disc plays the **latest take** from the backend: one turn = the whole track,
   rings = 4 frequency bands of that take, dots = loud moments (compute from the decoded WAV
   with an FFT, same as `analyze()` in the reference). Knobs stay in sync with composer controls.
3. `Ticker`, `WordsToSound` (pinned scroll morph), `HowItWorks` (pinned horizontal six stages).
4. `Composer` — description, control chips, duration, "Your brief" live preview
   (port `processPrompt` from the reference; it mirrors `backend/prompt_processor.py`),
   settings card, Compose → `POST /generate`. Show the five stages while waiting
   (the request is one call, so animate the stages on a timer and finish when it returns).
   Result: fetch `/audio/{id}`, decode it, draw waveform + spectrogram from the real audio,
   play/seek, Regenerate → `POST /regenerate`. Show errors in plain words if the backend is down.
5. `Presets` (cartridges), `Library` (real `/history`, newest first, play any row),
   `SpecSheet`, `Footer` with "Made by Dev Trivedi".
6. Global: scroll progress bar, custom cursor, magnetic buttons, note burst on Compose.

## Rules
- No code, file names, endpoints or model jargon anywhere in the UI (the reference already follows this).
- Match the reference's spacing, type scale, colors and motion timings; don't redesign.
- Works at phone width with no horizontal scroll.
- Add a `web/README.md` with how to run backend + frontend together.

## Suggested order
1. Scaffold `web/`, port CSS tokens and static layout of every section.
2. Hero + composer wired to the real backend (generate, play, disc from real audio).
3. Library from `/history`.
4. Intro (Framer Motion) and the scroll animations.
5. Compare side by side with `design/reference.html` at desktop and phone width; fix differences.
