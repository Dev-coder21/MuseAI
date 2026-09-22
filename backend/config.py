import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUTS_DIR = BASE_DIR / "outputs"
AUDIO_DIR = OUTPUTS_DIR / "audio"
WAVEFORMS_DIR = OUTPUTS_DIR / "waveforms"
SPECTROGRAMS_DIR = OUTPUTS_DIR / "spectrograms"
METADATA_DIR = OUTPUTS_DIR / "metadata"

DATA_DIR = BASE_DIR / "data"
PROMPTS_DIR = DATA_DIR / "prompts"
GENERATED_DIR = DATA_DIR / "generated"
EVALUATION_DIR = DATA_DIR / "evaluation"

# Ensure all output and data directories exist
for directory in [
    OUTPUTS_DIR,
    AUDIO_DIR,
    WAVEFORMS_DIR,
    SPECTROGRAMS_DIR,
    METADATA_DIR,
    DATA_DIR,
    PROMPTS_DIR,
    GENERATED_DIR,
    EVALUATION_DIR,
]:
    directory.mkdir(parents=True, exist_ok=True)

# Hardware & Model Settings
MODEL_ID = "facebook/musicgen-small"
DEFAULT_SAMPLING_RATE = 32000
TOKENS_PER_SECOND = 50  # MusicGen generates ~50 tokens per second of audio

# PyTorch & Device Environment
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"


def get_device() -> str:
    """Detect available hardware acceleration (MPS for Apple Silicon, else CPU)."""
    try:
        import torch

        if torch.backends.mps.is_available():
            return "mps"
    except Exception:
        pass
    return "cpu"


DEVICE = get_device()
