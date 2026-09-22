import os
from pathlib import Path
import numpy as np
import soundfile as sf
import pytest
from backend.audio_processor import AudioProcessor


def test_audio_processor_with_synthetic_wav(tmp_path):
    wav_path = tmp_path / "test_audio.wav"
    sr = 32000
    duration = 2.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    audio_signal = 0.5 * np.sin(2 * np.pi * 440 * t)  # 440 Hz sine wave

    sf.write(str(wav_path), audio_signal, sr)

    analysis = AudioProcessor.analyze_audio(str(wav_path), num_waveform_points=50)

    assert analysis["sampling_rate"] == 32000
    assert abs(analysis["duration_seconds"] - 2.0) < 0.1
    assert len(analysis["waveform_points"]) <= 50
    assert analysis["peak_amplitude"] > 0.4
