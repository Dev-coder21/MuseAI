import os
from pathlib import Path
from typing import Dict, Any, List
import numpy as np
import soundfile as sf
import librosa


class AudioProcessor:
    """
    Analyzes generated WAV audio files and extracts metadata, duration,
    sampling rate, and normalized amplitude waveform points.
    """

    @staticmethod
    def analyze_audio(audio_path: str, num_waveform_points: int = 100) -> Dict[str, Any]:
        """
        Reads audio file from disk and computes key audio metrics and waveform points.
        """
        path = Path(audio_path)
        if not path.exists():
            raise FileNotFoundError(f"Audio file not found at {audio_path}")

        # Read audio file using soundfile
        audio_data, sr = sf.read(str(path))

        # If stereo, convert to mono by taking mean across channels for analysis
        if audio_data.ndim > 1:
            mono_data = np.mean(audio_data, axis=1)
            channels = audio_data.shape[1]
        else:
            mono_data = audio_data
            channels = 1

        total_samples = len(mono_data)
        duration_seconds = total_samples / sr if sr > 0 else 0.0

        # Calculate basic audio statistics
        peak_amplitude = float(np.max(np.abs(mono_data))) if total_samples > 0 else 0.0
        rms_energy = float(np.sqrt(np.mean(mono_data**2))) if total_samples > 0 else 0.0

        # Downsample mono_data into num_waveform_points normalized values (range 0.0 to 1.0)
        waveform_points = AudioProcessor._extract_waveform_points(mono_data, num_waveform_points)

        return {
            "audio_path": str(path),
            "filename": path.name,
            "sampling_rate": sr,
            "duration_seconds": round(duration_seconds, 2),
            "total_samples": total_samples,
            "channels": channels,
            "peak_amplitude": round(peak_amplitude, 4),
            "rms_energy": round(rms_energy, 4),
            "waveform_points": waveform_points,
        }

    @staticmethod
    def _extract_waveform_points(data: np.ndarray, points_count: int) -> List[float]:
        """Downsamples audio array into normalized peak amplitudes for rendering."""
        if len(data) == 0:
            return [0.0] * points_count

        step = max(1, len(data) // points_count)
        points = []
        for i in range(0, len(data), step):
            chunk = data[i : i + step]
            if len(chunk) > 0:
                max_val = float(np.max(np.abs(chunk)))
                points.append(round(max_val, 4))
            if len(points) >= points_count:
                break

        # Normalize points between 0.0 and 1.0
        max_p = max(points) if points else 1.0
        if max_p > 0:
            normalized = [round(p / max_p, 4) for p in points]
        else:
            normalized = points

        return normalized
