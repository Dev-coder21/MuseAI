# MUSEAI — AI MUSIC COMPOSER
## Complete Project Specification

Version: 1.0
Project Type: Generative AI Application
Frontend: Flutter + Dart
Backend: Python + FastAPI
AI Model: Meta MusicGen-small
Model ID: facebook/musicgen-small

---

# 1. PROJECT OVERVIEW

## 1.1 Project Name

MuseAI — AI Music Composer

## 1.2 Project Description

MuseAI is an end-to-end Generative AI application that allows users to create short musical compositions from natural-language descriptions.

The application uses the pretrained Meta MusicGen-small model through Hugging Face Transformers.

Users can describe the music they want and optionally control musical characteristics such as:

- Mood
- Genre
- Instrument
- Intensity
- Tempo
- Duration

The application processes these inputs into a suitable music-generation prompt, sends the prompt to MusicGen-small, generates an audio composition, analyzes the generated audio, and presents the result through a polished Flutter application.

The generated result should include:

- Audio playback
- Waveform visualization
- Spectrogram visualization
- Generation information
- Download functionality
- Regeneration functionality

The project should feel like a real AI music product rather than a basic college-project dashboard.

---

# 2. PROJECT OBJECTIVE

The main objective is to develop a complete Generative AI music-composition application that demonstrates the complete lifecycle of an AI-powered application:

User Input
→ Prompt Processing
→ Generative AI Model
→ Generated Audio
→ Audio Analysis
→ Visualization
→ User Interaction

The project should demonstrate practical integration of:

- Generative AI
- Natural-language prompting
- Pretrained transformer models
- Audio processing
- REST APIs
- Flutter application development
- Data visualization
- Software testing
- Human evaluation

---

# 3. VERIFIED DEVELOPMENT ENVIRONMENT

The environment has already been created and verified.

Do NOT unnecessarily recreate or replace it.

## Hardware

- Apple MacBook Air
- Apple M1
- Apple Silicon GPU

## Python

Python:

3.11.16

Virtual environment:

~/MuseAI/.venv

## PyTorch

Version:

2.14.0

## Transformers

Version:

5.17.0

## Hardware acceleration

PyTorch MPS is available and has already been successfully tested.

Use:

mps

when supported.

If a specific operation is unsupported by MPS, safe CPU fallback may be used.

Do NOT replace the current PyTorch installation with a CPU-only installation.

Do NOT downgrade packages unless an actual compatibility problem is demonstrated.

---

# 4. VERIFIED MUSICGEN MODEL

The actual model has already been tested successfully.

Model:

facebook/musicgen-small

The verification test successfully demonstrated:

- Model loading
- Text conditioning
- MPS execution
- Music generation
- WAV output
- Audio reading

Verified test:

Prompt:

"calm peaceful piano music for studying"

Verified output:

outputs/audio/musicgen_test.wav

Verified sampling rate:

32000 Hz

Verified test duration:

approximately 5.06 seconds

Verified generation time:

approximately 19.20 seconds

The model is therefore considered READY for application development.

Do NOT replace MusicGen-small with another model.

Do NOT retrain the model.

Do NOT build a training pipeline.

MuseAI uses the pretrained MusicGen-small model for inference.

---

# 5. CORE USER WORKFLOW

The intended workflow is:

1. User opens MuseAI.
2. User enters a natural-language music description.
3. User optionally selects musical preferences.
4. MuseAI processes the input.
5. MuseAI creates a final optimized natural-language generation prompt.
6. MusicGen-small generates audio.
7. Backend saves the generated audio.
8. Backend analyzes the audio.
9. Backend generates waveform information/visualization.
10. Backend generates spectrogram visualization.
11. Flutter displays the generated result.
12. User listens to the music.
13. User can regenerate.
14. User can download the result.

Architecture:

Flutter
↓
FastAPI
↓
Prompt Processing
↓
MusicGen-small
↓
Generated Audio
↓
Audio Analysis
↓
Waveform + Spectrogram
↓
Flutter Result Screen

---

# 6. HIGH-LEVEL ARCHITECTURE

The system consists of two major applications.

## Frontend

Flutter + Dart

Responsibilities:

- User interface
- Prompt input
- Musical controls
- Loading/generation state
- API communication
- Audio playback
- Waveform display
- Spectrogram display
- Download interaction
- Regeneration interaction
- Error display

## Backend

Python + FastAPI

Responsibilities:

- API endpoints
- Request validation
- Prompt processing
- MusicGen inference
- Audio file management
- Audio analysis
- Waveform generation
- Spectrogram generation
- Metadata generation
- History management where implemented

---

# 7. TECHNOLOGY STACK

Use the following technologies.

## Backend

Python 3.11

FastAPI

Uvicorn

PyTorch

Hugging Face Transformers

MusicGen-small

NumPy

SciPy

Librosa

SoundFile

Matplotlib where required for visualization generation

## Frontend

Flutter

Dart

Use stable Flutter-compatible packages where appropriate.

Possible packages may include:

- HTTP client
- Audio playback package
- File/path handling
- Image display
- State management only if genuinely useful

Do not add unnecessary frameworks.

---

# 8. PROJECT DIRECTORY STRUCTURE

Create and maintain a clean structure similar to:

museai/

├── backend/
│   ├── app.py
│   ├── config.py
│   ├── schemas.py
│   ├── prompt_processor.py
│   ├── music_generator.py
│   ├── audio_processor.py
│   ├── visualizer.py
│   ├── history.py
│   └── requirements.txt
│
├── models/
│   └── README.md
│
├── data/
│   ├── prompts/
│   ├── generated/
│   └── evaluation/
│
├── outputs/
│   ├── audio/
│   ├── waveforms/
│   ├── spectrograms/
│   └── metadata/
│
├── flutter_app/
│   ├── lib/
│   │   ├── main.dart
│   │   ├── models/
│   │   ├── screens/
│   │   ├── widgets/
│   │   ├── services/
│   │   └── theme/
│   ├── assets/
│   └── pubspec.yaml
│
├── tests/
│   ├── test_prompt_processor.py
│   ├── test_audio_processor.py
│   ├── test_api.py
│   └── test_generation.py
│
├── notebooks/
│   ├── 01_model_test.ipynb
│   ├── 02_audio_analysis.ipynb
│   └── 03_evaluation.ipynb
│
├── PROJECT_SPEC.md
├── README.md
└── .gitignore

The exact structure may be adjusted if implementation requires it, but maintain clear separation between frontend, backend, outputs, tests, and documentation.

---

# 9. PROMPT PROCESSING

MuseAI should support both:

## Natural-language prompt

Example:

"Create calm piano music for studying."

## Structured controls

Example:

Mood:
Calm

Genre:
Ambient

Instrument:
Piano

Intensity:
Low

Tempo:
Slow

Purpose:
Study

Duration:
Short

The backend should combine the user's free-form description and selected controls into a coherent final prompt.

Example final prompt:

"A calm, slow, peaceful ambient piano composition suitable for studying, with low intensity."

The final prompt sent to MusicGen should remain natural language.

Do not simply concatenate values in an awkward format.

The final prompt should be stored as metadata so the generated result can be reproduced or inspected.

---

# 10. MUSICAL CONTROLS

The initial application should support:

## Mood

Examples:

- Calm
- Happy
- Sad
- Energetic
- Relaxing
- Emotional
- Dark
- Peaceful

## Genre

Examples:

- Ambient
- Classical
- Jazz
- Electronic
- Cinematic
- Lo-fi
- Acoustic

## Instrument

Examples:

- Piano
- Guitar
- Violin
- Strings
- Synth
- Drums
- Flute

## Intensity

- Low
- Medium
- High

## Tempo

- Slow
- Medium
- Fast

## Purpose

Examples:

- Study
- Meditation
- Workout
- Sleep
- Gaming
- Cinematic
- Background

## Duration

Provide practical short-duration options initially.

The implementation should be designed so longer generation can be added later.

---

# 11. DURATION STRATEGY

The first implementation must prioritize reliable generation.

The verified MusicGen test generated approximately 5 seconds of audio.

Start with short generation.

Do NOT attempt to solve long-form music generation before the basic generation pipeline is stable.

The application may initially expose short duration options.

After the complete short-duration pipeline works, investigate longer-duration generation through controlled generation/continuation and audio joining.

Long-duration generation must not be presented as seamless unless it has actually been tested.

Do not make unsupported claims about audio quality or seamless continuation.

---

# 12. MUSIC GENERATION

The backend should contain a dedicated music-generation module.

Example responsibility:

music_generator.py

Responsibilities:

- Load MusicGen-small
- Select MPS when available
- Handle CPU fallback when required
- Accept final text prompt
- Generate audio
- Convert output into a suitable audio representation
- Save WAV output
- Return metadata

The model should preferably be loaded once and reused rather than reloaded for every request.

Do not load the model repeatedly for each API call unless there is a specific technical reason.

---

# 13. FASTAPI BACKEND

Create a clean FastAPI backend.

The backend should expose at minimum:

GET /health

POST /generate

GET /audio/{generation_id}

GET /waveform/{generation_id}

GET /spectrogram/{generation_id}

POST /regenerate

Optional:

GET /history

---

# 14. HEALTH ENDPOINT

GET /health

Expected purpose:

Confirm that the backend is running.

Example response:

{
  "status": "ok",
  "service": "MuseAI backend"
}

The response can contain additional useful information such as model/device status.

---

# 15. GENERATION API

POST /generate

Expected request concept:

{
  "prompt": "calm piano music for studying",
  "mood": "Calm",
  "genre": "Ambient",
  "instrument": "Piano",
  "intensity": "Low",
  "tempo": "Slow",
  "purpose": "Study",
  "duration": 5
}

The exact schema may be implemented using Pydantic.

The backend should:

1. Validate input.
2. Process prompt.
3. Generate final prompt.
4. Run MusicGen.
5. Save audio.
6. Analyze audio.
7. Generate visualization assets.
8. Save metadata.
9. Return generation information.

Example response:

{
  "generation_id": "abc123",
  "final_prompt": "A calm, slow...",
  "audio_url": "/audio/abc123",
  "waveform_url": "/waveform/abc123",
  "spectrogram_url": "/spectrogram/abc123",
  "duration_seconds": 5
}

---

# 16. AUDIO PROCESSING

Use SoundFile and Librosa where appropriate.

The backend should be able to:

- Read generated WAV
- Determine sampling rate
- Determine duration
- Determine number of samples
- Analyze waveform
- Generate spectrogram data/image

Audio should remain valid and playable.

Handle audio processing errors cleanly.

---

# 17. WAVEFORM

MuseAI should provide a waveform visualization for generated audio.

The waveform should visually represent amplitude over time.

The visualization may be generated by the backend and displayed in Flutter.

Do not create meaningless placeholder graphics.

The waveform must correspond to the actual generated audio.

---

# 18. SPECTROGRAM

MuseAI should provide a spectrogram visualization.

The spectrogram should be calculated from the actual generated audio.

It should represent:

- Time
- Frequency
- Audio energy/intensity

Use Librosa or an equivalent appropriate audio-analysis library.

Do not generate a fake or decorative spectrogram.

---

# 19. RESULT SCREEN

The result screen should include:

- Generated music title or description
- Audio player
- Playback controls
- Duration
- Waveform
- Spectrogram
- Final generation prompt
- Musical settings
- Regenerate button
- Download button

The result should clearly communicate that the audio was generated by MuseAI.

---

# 20. FLUTTER APPLICATION

Create a polished Flutter application.

Do NOT create a basic Streamlit dashboard.

Flutter is the official frontend.

Recommended screens:

1. Splash
2. Home
3. Customize
4. Generating
5. Result
6. History (optional)
7. Settings (optional)

The minimum required working screens are:

Home
Generating
Result

---

# 21. HOME SCREEN

The Home screen should include:

- MuseAI branding
- Project title
- Short description
- Natural-language prompt field
- Quick presets
- Musical customization controls
- Generate Music button

Suggested presets:

- Study
- Meditation
- Workout
- Sleep
- Cinematic
- Gaming

Presets should simply populate useful settings/prompt values.

---

# 22. CUSTOMIZATION UI

Use appropriate Flutter widgets such as:

- Text fields
- Dropdowns
- Chips
- Segmented controls
- Sliders
- Cards

The interface should remain simple and visually clean.

Do not overload the screen with unnecessary controls.

---

# 23. GENERATING SCREEN

Music generation can take noticeable time.

Therefore provide a proper generation state.

The UI should communicate:

"Creating your music..."

Possible supporting information:

- Selected mood
- Selected genre
- Selected instrument
- Generation status

Include an animated loading/progress presentation where practical.

Do not display fake percentage progress unless it represents real progress.

An indeterminate progress indicator is preferable when actual generation progress is unavailable.

---

# 24. RESULT UI

The result screen should feel like a finished product.

Include:

- Audio player
- Waveform
- Spectrogram
- Generation metadata
- Prompt
- Regenerate
- Download

Use cards and clear visual hierarchy.

Maintain consistent spacing, typography, icons, and theme.

---

# 25. AUDIO PLAYBACK

Flutter must be able to play the generated audio.

The implementation should:

- Load audio from backend
- Start playback
- Pause playback
- Resume playback
- Stop playback
- Show playback position where practical
- Show duration

Handle playback errors.

---

# 26. DOWNLOAD

Provide a download/save action for generated music.

The implementation should use an appropriate Flutter-compatible file mechanism.

Do not claim the file was downloaded unless the operation succeeds.

Handle permission/platform issues appropriately.

---

# 27. REGENERATE

The user should be able to regenerate music using the same or modified settings.

Regeneration should trigger a new backend generation request.

The UI should show the generation state again.

A new generation ID should be created for a new generated result.

---

# 28. HISTORY

History is optional for the first MVP but should be designed so it can be added cleanly.

If implemented, store:

- Generation ID
- Prompt
- Final prompt
- Settings
- Date/time
- Audio path
- Duration

Avoid adding a complex database unless required.

A simple JSON/local-storage implementation is acceptable for the MVP.

SQLite may be introduced if genuinely useful.

---

# 29. ERROR HANDLING

The system must handle:

- Empty prompt
- Invalid input
- Backend unavailable
- Model loading failure
- Generation failure
- Audio processing failure
- Missing audio file
- Visualization failure
- Flutter network errors
- Playback errors
- Download errors

Errors should be presented clearly to the user.

Do not expose raw Python stack traces to normal users.

Detailed errors should still be available in backend logs for debugging.

---

# 30. SECURITY / CONFIGURATION

Do not hard-code secrets.

The application currently does not require an external paid music-generation API.

Avoid introducing unnecessary API keys.

Use environment variables for future configuration where appropriate.

---

# 31. PERFORMANCE

Important considerations:

- Load MusicGen model once.
- Reuse the loaded model.
- Use MPS when available.
- Avoid unnecessary model reloads.
- Avoid unnecessarily large audio generation.
- Keep visualization processing efficient.
- Avoid blocking the Flutter UI.
- Handle backend generation asynchronously from the UI perspective.

The application should remain usable while music generation is running.

---

# 32. TESTING

Create automated tests where practical.

At minimum test:

## Prompt processing

- Basic prompt
- Prompt with settings
- Empty prompt
- Missing optional settings

## Audio processing

- Valid WAV
- Sampling rate detection
- Duration detection
- Waveform generation
- Spectrogram generation

## API

- /health
- Valid /generate request
- Invalid /generate request
- Missing required values

## Generation

Verify that MusicGen can generate an actual playable file.

Do not mock the core MusicGen generation test if the purpose of the test is to verify the real model.

---

# 33. MANUAL TEST CASES

Test at least these prompts:

1.

"Calm piano music for studying."

2.

"Energetic electronic music for a workout."

3.

"Emotional cinematic music with strings."

4.

"Peaceful ambient music for meditation."

5.

"Fast upbeat jazz music with piano and drums."

For each test verify:

- Request succeeds
- Audio file exists
- Audio is playable
- Duration is valid
- Waveform is generated
- Spectrogram is generated
- UI displays the result

---

# 34. GENERATIVE AI EVALUATION

Do NOT use classification accuracy as the primary evaluation metric.

MuseAI should use functional and human evaluation.

Human evaluation dimensions:

Prompt Match:
1–5

Mood Match:
1–5

Instrument/Style Match:
1–5

Musical Quality:
1–5

Overall Satisfaction:
1–5

Technical measurements:

- Generation success rate
- Generation time
- Audio validity
- Actual duration
- Failed generation count

Do not invent evaluation results.

If an evaluation result has not actually been measured, label it as pending.

---

# 35. OPTIONAL FUTURE IMPROVEMENTS

The architecture should leave room for:

- Longer music generation
- Music continuation
- Generation history
- Favorites
- Multiple generated variations
- Better prompt enhancement
- User accounts
- Cloud deployment
- More advanced musical controls
- MIDI-related functionality
- Improved evaluation
- Additional generative music models

Do not implement these unnecessarily in the first working version.

---

# 36. DEVELOPMENT PHASES

Work through the project in this order.

## Phase 1 — Project Foundation

- Inspect existing environment
- Preserve verified environment
- Create project structure
- Create backend/frontend directories
- Configure Git ignore
- Create README foundation

## Phase 2 — MusicGen Integration

- Integrate existing verified MusicGen-small setup
- Move generation logic into a clean module
- Ensure MPS usage
- Ensure audio output
- Ensure reusable model loading

## Phase 3 — Prompt Processing

- Implement prompt processor
- Combine free-form prompt and settings
- Generate final natural-language prompt
- Store final prompt

## Phase 4 — Audio Processing

- Audio metadata
- Duration
- Waveform
- Spectrogram

## Phase 5 — FastAPI

- Health endpoint
- Generation endpoint
- Audio endpoint
- Visualization endpoints
- Regeneration endpoint

## Phase 6 — Backend Testing

- API tests
- Generation tests
- Audio tests
- Error handling

## Phase 7 — Flutter Foundation

- Create Flutter app
- Theme
- Navigation
- Home screen
- Result screen
- Generating screen

## Phase 8 — Flutter Integration

- Connect Flutter to FastAPI
- Send prompts/settings
- Receive generation response
- Display generated content

## Phase 9 — Audio Experience

- Audio playback
- Waveform
- Spectrogram
- Download
- Regeneration

## Phase 10 — UX Polish

- Loading states
- Error states
- Empty states
- Animations where useful
- Responsive layout
- Consistent design

## Phase 11 — Evaluation

- Run test prompts
- Measure generation performance
- Perform human evaluation
- Record results

## Phase 12 — Documentation

Create:

- README
- Setup instructions
- Architecture explanation
- API documentation
- Testing documentation
- Evaluation documentation
- Project limitations
- Future work

---

# 37. DEVELOPMENT RULE

The implementation agent should work autonomously through the phases.

Do not repeatedly ask the user for confirmation for ordinary coding decisions.

However:

- Do not make destructive changes.
- Do not delete working components without reason.
- Do not replace verified technologies unnecessarily.
- Do not change the core model.
- Do not introduce unnecessary dependencies.
- Do not fabricate test results.
- Do not claim functionality is complete until it has been tested.

If an implementation decision is ambiguous, choose the simplest solution consistent with this specification.

---

# 38. IMPORTANT MODEL RULE

The project's primary model is:

facebook/musicgen-small

This is a deliberate project decision.

Do not switch to:

- MusicGen-medium
- MusicGen-large
- MAGNeT
- Stable Audio
- MusicLM
- another generative model

unless the current model becomes technically unusable and the change is explicitly justified.

---

# 39. IMPORTANT FRONTEND RULE

The final frontend must be Flutter.

Do not replace Flutter with:

- Streamlit
- Gradio
- React
- plain HTML dashboard
- another frontend framework

Flutter is part of the project's intended architecture.

---

# 40. IMPORTANT BACKEND RULE

The backend must use Python/FastAPI.

Do not replace the backend architecture with another server framework unless technically necessary.

---

# 41. IMPORTANT MVP RULE

Prioritize:

RELIABILITY > COMPLEXITY

The first complete version should reliably:

1. Accept a prompt.
2. Apply settings.
3. Generate music.
4. Save audio.
5. Display audio.
6. Display waveform.
7. Display spectrogram.
8. Allow download.
9. Allow regeneration.

Only after these work should optional advanced features be implemented.

---

# 42. DOCUMENTATION REQUIREMENTS

README.md should eventually contain:

- Project overview
- Features
- Architecture
- Technology stack
- Requirements
- Environment setup
- Backend setup
- Flutter setup
- How to run backend
- How to run Flutter
- API overview
- Example prompts
- Testing
- Evaluation
- Limitations
- Future improvements

The README should be understandable to another student who needs to run the project.

---

# 43. PROJECT DEMONSTRATION REQUIREMENTS

The finished application should support a clear demonstration:

1. Launch MuseAI.
2. Show the home screen.
3. Enter a natural-language prompt.
4. Select musical preferences.
5. Click Generate.
6. Show generation/loading state.
7. Display generated music.
8. Play the music.
9. Show waveform.
10. Show spectrogram.
11. Show generated prompt/settings.
12. Regenerate.
13. Download the audio.

This workflow should be reliable enough for a project demonstration.

---

# 44. DEFINITION OF DONE

MuseAI is considered complete only when the following are working:

## AI

[ ] MusicGen-small loads successfully.

[ ] Music generation works.

[ ] MPS is used where supported.

[ ] Generated audio is valid.

## Prompt Processing

[ ] Natural-language prompt works.

[ ] Musical controls work.

[ ] Final prompt is generated.

[ ] Final prompt is stored/displayed.

## Backend

[ ] FastAPI starts.

[ ] /health works.

[ ] /generate works.

[ ] Audio endpoint works.

[ ] Waveform endpoint works.

[ ] Spectrogram endpoint works.

[ ] Regeneration works.

## Audio

[ ] WAV output is valid.

[ ] Duration is detected.

[ ] Waveform corresponds to actual audio.

[ ] Spectrogram corresponds to actual audio.

## Flutter

[ ] App launches.

[ ] Home screen works.

[ ] Prompt entry works.

[ ] Musical controls work.

[ ] Generate button works.

[ ] Generating state works.

[ ] Result screen works.

[ ] Audio playback works.

[ ] Waveform displays.

[ ] Spectrogram displays.

[ ] Download works.

[ ] Regenerate works.

## Reliability

[ ] Invalid input is handled.

[ ] Backend errors are handled.

[ ] Generation errors are handled.

[ ] Playback errors are handled.

[ ] Missing files are handled.

## Testing

[ ] Backend tests pass.

[ ] Prompt tests pass.

[ ] Audio tests pass.

[ ] Generation test passes.

[ ] Manual prompts tested.

## Documentation

[ ] README complete.

[ ] Architecture documented.

[ ] Setup documented.

[ ] Testing documented.

[ ] Evaluation documented.

[ ] Limitations documented.

[ ] Future work documented.

---

# 45. FINAL PRINCIPLE

Build MuseAI as a real, polished, maintainable Generative AI application.

The application should demonstrate:

Natural Language
→ Prompt Engineering
→ Generative AI
→ Audio Generation
→ Audio Analysis
→ Visualization
→ Interactive Application

Keep the implementation understandable, modular, testable, and suitable for a college Generative AI project demonstration.

Do not over-engineer the system.

Make the simplest robust implementation that satisfies the requirements above.