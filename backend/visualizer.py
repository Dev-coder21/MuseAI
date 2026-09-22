import os
from pathlib import Path
import matplotlib
matplotlib.use("Agg")  # Non-interactive background rendering
import matplotlib.pyplot as plt
import librosa
import librosa.display
import numpy as np


class Visualizer:
    """
    Generates high-quality PNG visualization images for Waveforms and Spectrograms
    from audio files for display in the Flutter UI.
    """

    @staticmethod
    def generate_waveform(audio_path: str, output_png_path: str) -> str:
        """Renders a modern, styled audio waveform image."""
        audio_path_obj = Path(audio_path)
        output_path_obj = Path(output_png_path)
        output_path_obj.parent.mkdir(parents=True, exist_ok=True)

        # Load audio using librosa
        y, sr = librosa.load(str(audio_path_obj), sr=None)

        fig, ax = plt.subplots(figsize=(10, 3.5), facecolor="#121324")
        ax.set_facecolor("#121324")

        # Plot waveform with vibrant cyan/purple style
        times = librosa.times_like(y, sr=sr)
        ax.plot(times, y, color="#6C5CE7", alpha=0.9, linewidth=1.2)
        ax.fill_between(times, y, color="#00CEC9", alpha=0.3)

        # Formatting
        ax.set_title("Audio Waveform", color="#FFFFFF", fontsize=12, fontweight="bold", pad=10)
        ax.set_xlabel("Time (seconds)", color="#A0A5C0", fontsize=9)
        ax.set_ylabel("Amplitude", color="#A0A5C0", fontsize=9)
        ax.tick_params(colors="#A0A5C0", labelsize=8)
        ax.grid(True, color="#25284B", linestyle="--", alpha=0.5)

        for spine in ax.spines.values():
            spine.set_color("#25284B")

        plt.tight_layout()
        plt.savefig(str(output_path_obj), dpi=150, facecolor=fig.get_facecolor(), edgecolor="none")
        plt.close(fig)

        return str(output_path_obj)

    @staticmethod
    def generate_spectrogram(audio_path: str, output_png_path: str) -> str:
        """Renders an STFT Spectrogram image representing frequency vs time."""
        audio_path_obj = Path(audio_path)
        output_path_obj = Path(output_png_path)
        output_path_obj.parent.mkdir(parents=True, exist_ok=True)

        y, sr = librosa.load(str(audio_path_obj), sr=None)
        D = librosa.stft(y)
        S_db = librosa.amplitude_to_db(np.abs(D), ref=np.max)

        fig, ax = plt.subplots(figsize=(10, 3.5), facecolor="#121324")
        ax.set_facecolor("#121324")

        img = librosa.display.specshow(
            S_db,
            sr=sr,
            x_axis="time",
            y_axis="hz",
            ax=ax,
            cmap="magma",
        )

        ax.set_title("Audio Spectrogram (Frequency vs Time)", color="#FFFFFF", fontsize=12, fontweight="bold", pad=10)
        ax.set_xlabel("Time (seconds)", color="#A0A5C0", fontsize=9)
        ax.set_ylabel("Frequency (Hz)", color="#A0A5C0", fontsize=9)
        ax.tick_params(colors="#A0A5C0", labelsize=8)

        for spine in ax.spines.values():
            spine.set_color("#25284B")

        cbar = fig.colorbar(img, ax=ax, format="%+2.0f dB")
        cbar.ax.yaxis.set_tick_params(color="#A0A5C0")
        plt.setp(plt.getp(cbar.ax.axes, "yticklabels"), color="#A0A5C0", fontsize=8)
        cbar.outline.set_edgecolor("#25284B")

        plt.tight_layout()
        plt.savefig(str(output_path_obj), dpi=150, facecolor=fig.get_facecolor(), edgecolor="none")
        plt.close(fig)

        return str(output_path_obj)
