import os
from pathlib import Path
import pytest
from backend.music_generator import music_generator
from backend.visualizer import Visualizer


def test_end_to_end_short_generation(tmp_path):
    # Test short 2-second generation
    prompt = "calm ambient synth"
    gen_id = "test_gen_unit"

    res = music_generator.generate(prompt=prompt, duration_seconds=2, generation_id=gen_id)

    assert res["generation_id"] == gen_id
    assert os.path.exists(res["audio_filepath"])
    assert res["sampling_rate"] == 32000
    assert res["duration_seconds"] > 1.0

    # Test visualization generation
    wf_path = tmp_path / "waveform.png"
    sp_path = tmp_path / "spectrogram.png"

    Visualizer.generate_waveform(res["audio_filepath"], str(wf_path))
    Visualizer.generate_spectrogram(res["audio_filepath"], str(sp_path))

    assert wf_path.exists()
    assert sp_path.exists()
