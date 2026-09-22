import logging
import os
import time
import uuid
from typing import Dict, Any, Tuple
import torch
import soundfile as sf
from transformers import AutoProcessor, MusicgenForConditionalGeneration

from backend.config import MODEL_ID, DEVICE, AUDIO_DIR, TOKENS_PER_SECOND, DEFAULT_SAMPLING_RATE

# Configure logger
logger = logging.getLogger("museai.music_generator")
logging.basicConfig(level=logging.INFO)


class MusicGenerator:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MusicGenerator, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.device = DEVICE
        self.model_id = MODEL_ID
        self.processor = None
        self.model = None
        self._initialized = True

    def load_model(self):
        """Loads MusicGen model and processor into memory if not already loaded."""
        if self.processor is not None and self.model is not None:
            return

        logger.info(f"Loading {self.model_id} onto device '{self.device}'...")
        start_time = time.time()
        try:
            self.processor = AutoProcessor.from_pretrained(self.model_id)
            self.model = MusicgenForConditionalGeneration.from_pretrained(self.model_id)
            self.model.to(self.device)
            logger.info(f"Successfully loaded {self.model_id} in {time.time() - start_time:.2f}s")
        except Exception as e:
            logger.error(f"Failed to load model on '{self.device}': {e}. Retrying on CPU...")
            self.device = "cpu"
            self.model.to(self.device)

    def generate(self, prompt: str, duration_seconds: int = 5, generation_id: str = None) -> Dict[str, Any]:
        """
        Generates audio using MusicGen-small for the given text prompt and duration.
        """
        if not generation_id:
            generation_id = uuid.uuid4().hex[:12]

        self.load_model()

        # Calculate max tokens needed for requested duration (50 tokens per sec)
        max_new_tokens = int(max(1, duration_seconds) * TOKENS_PER_SECOND)

        logger.info(f"Generating audio for prompt: '{prompt}' (duration: {duration_seconds}s, tokens: {max_new_tokens})")
        start_time = time.time()

        try:
            inputs = self.processor(text=[prompt], padding=True, return_tensors="pt").to(self.device)
            with torch.no_grad():
                audio_values = self.model.generate(**inputs, max_new_tokens=max_new_tokens)
        except Exception as e:
            logger.warning(f"Generation error on '{self.device}': {e}. Falling back to CPU...")
            cpu_device = "cpu"
            self.model.to(cpu_device)
            inputs = self.processor(text=[prompt], padding=True, return_tensors="pt").to(cpu_device)
            with torch.no_grad():
                audio_values = self.model.generate(**inputs, max_new_tokens=max_new_tokens)

        generation_time = time.time() - start_time

        # Extract audio numpy array and sampling rate
        sampling_rate = getattr(self.model.config.audio_encoder, "sampling_rate", DEFAULT_SAMPLING_RATE)
        
        # Tensor shape is typically (batch_size, channels, audio_length)
        audio_data = audio_values[0, 0].cpu().numpy()
        actual_duration = len(audio_data) / sampling_rate

        # Save audio file
        audio_filename = f"{generation_id}.wav"
        audio_filepath = AUDIO_DIR / audio_filename
        sf.write(str(audio_filepath), audio_data, sampling_rate)

        logger.info(f"Generated {actual_duration:.2f}s audio saved at {audio_filepath} in {generation_time:.2f}s")

        return {
            "generation_id": generation_id,
            "prompt": prompt,
            "audio_filepath": str(audio_filepath),
            "audio_filename": audio_filename,
            "sampling_rate": sampling_rate,
            "duration_seconds": round(actual_duration, 2),
            "generation_time_seconds": round(generation_time, 2),
            "device": self.device,
        }


# Global singleton helper
music_generator = MusicGenerator()
