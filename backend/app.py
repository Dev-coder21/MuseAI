import logging
import uuid
from pathlib import Path
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from backend.config import (
    MODEL_ID,
    DEVICE,
    AUDIO_DIR,
    WAVEFORMS_DIR,
    SPECTROGRAMS_DIR,
)
from backend.schemas import (
    GenerateRequest,
    RegenerateRequest,
    GenerateResponse,
    HealthResponse,
)
from backend.prompt_processor import PromptProcessor
from backend.music_generator import music_generator
from backend.audio_processor import AudioProcessor
from backend.visualizer import Visualizer
from backend.history import HistoryManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("museai.app")

app = FastAPI(
    title="MuseAI Backend API",
    description="Generative AI Music Composer API powered by Meta MusicGen-small & Apple MPS",
    version="1.0.0",
)

# Enable CORS for Flutter app (desktop, web, mobile)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Pre-warm model during app startup asynchronously."""
    logger.info("MuseAI API starting up. Pre-warming MusicGen-small model...")
    try:
        music_generator.load_model()
    except Exception as e:
        logger.warning(f"Model pre-warm warning: {e}")


@app.get("/health", response_model=HealthResponse)
def health_check():
    """Returns backend system status and active hardware device."""
    return HealthResponse(
        status="ok",
        service="MuseAI Backend API",
        device=DEVICE,
        model_id=MODEL_ID,
    )


@app.post("/generate", response_model=GenerateResponse)
def generate_music(req: GenerateRequest):
    """
    Main Endpoint: Accepts natural language prompt and musical controls,
    runs MusicGen-small, computes waveforms/spectrograms, and returns metadata.
    """
    try:
        gen_id = uuid.uuid4().hex[:12]

        # 1. Process prompt
        processed = PromptProcessor.process(
            prompt=req.prompt,
            mood=req.mood,
            genre=req.genre,
            instrument=req.instrument,
            intensity=req.intensity,
            tempo=req.tempo,
            purpose=req.purpose,
        )

        final_prompt = processed["final_prompt"]

        # 2. Generate MusicGen audio
        gen_result = music_generator.generate(
            prompt=final_prompt,
            duration_seconds=req.duration,
            generation_id=gen_id,
        )

        audio_path = gen_result["audio_filepath"]

        # 3. Analyze Audio & extract waveform points
        analysis = AudioProcessor.analyze_audio(audio_path)

        # 4. Generate Visualizations (Waveform & Spectrogram PNGs)
        waveform_png = WAVEFORMS_DIR / f"{gen_id}.png"
        spectrogram_png = SPECTROGRAMS_DIR / f"{gen_id}.png"

        Visualizer.generate_waveform(audio_path, str(waveform_png))
        Visualizer.generate_spectrogram(audio_path, str(spectrogram_png))

        # 5. Build response object
        response_data = {
            "generation_id": gen_id,
            "original_prompt": processed["original_prompt"],
            "final_prompt": final_prompt,
            "controls": processed["controls"],
            "duration_seconds": gen_result["duration_seconds"],
            "sampling_rate": gen_result["sampling_rate"],
            "audio_url": f"/audio/{gen_id}",
            "waveform_url": f"/waveform/{gen_id}",
            "spectrogram_url": f"/spectrogram/{gen_id}",
            "waveform_points": analysis["waveform_points"],
            "generation_time_seconds": gen_result["generation_time_seconds"],
            "device": gen_result["device"],
        }

        # 6. Save history metadata record
        HistoryManager.save_record(response_data)

        # Attach created_at for pydantic response
        record = HistoryManager.get_record(gen_id)
        return GenerateResponse(**record)

    except Exception as e:
        logger.error(f"Error in /generate endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/audio/{generation_id}")
def get_audio(generation_id: str):
    """Serves the generated WAV audio file."""
    audio_path = AUDIO_DIR / f"{generation_id}.wav"
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(path=str(audio_path), media_type="audio/wav", filename=f"{generation_id}.wav")


@app.get("/waveform/{generation_id}")
def get_waveform(generation_id: str):
    """Serves the generated waveform PNG image."""
    png_path = WAVEFORMS_DIR / f"{generation_id}.png"
    if not png_path.exists():
        raise HTTPException(status_code=404, detail="Waveform image not found")
    return FileResponse(path=str(png_path), media_type="image/png")


@app.get("/spectrogram/{generation_id}")
def get_spectrogram(generation_id: str):
    """Serves the generated spectrogram PNG image."""
    png_path = SPECTROGRAMS_DIR / f"{generation_id}.png"
    if not png_path.exists():
        raise HTTPException(status_code=404, detail="Spectrogram image not found")
    return FileResponse(path=str(png_path), media_type="image/png")


@app.post("/regenerate", response_model=GenerateResponse)
def regenerate_music(req: RegenerateRequest):
    """Re-runs generation using previous record's settings."""
    try:
        prev_record = HistoryManager.get_record(req.generation_id)
        controls = prev_record.get("controls", {})
        prompt = req.prompt_override if req.prompt_override else prev_record.get("original_prompt", "")

        new_req = GenerateRequest(
            prompt=prompt,
            mood=controls.get("mood"),
            genre=controls.get("genre"),
            instrument=controls.get("instrument"),
            intensity=controls.get("intensity"),
            tempo=controls.get("tempo"),
            purpose=controls.get("purpose"),
            duration=int(prev_record.get("duration_seconds", 5)),
        )

        return generate_music(new_req)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Previous generation record not found")
    except Exception as e:
        logger.error(f"Error in /regenerate: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history")
def get_history(limit: int = 20):
    """Returns list of past generation records."""
    return HistoryManager.list_history(limit=limit)


# Mount compiled Flutter Web UI if available
flutter_web_path = Path(__file__).resolve().parent.parent / "flutter_app" / "build" / "web"
if flutter_web_path.exists():
    app.mount("/app", StaticFiles(directory=str(flutter_web_path), html=True), name="flutter_app")

