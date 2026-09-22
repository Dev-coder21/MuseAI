import pytest
from backend.prompt_processor import PromptProcessor


def test_basic_prompt():
    res = PromptProcessor.process(prompt="calm piano music")
    assert res["original_prompt"] == "calm piano music"
    assert res["final_prompt"] == "calm piano music"
    assert res["controls"] == {}


def test_prompt_with_controls():
    res = PromptProcessor.process(
        prompt="gentle melody",
        mood="Calm",
        genre="Ambient",
        instrument="Piano",
        tempo="Slow",
        purpose="Study",
    )
    assert res["controls"]["mood"] == "Calm"
    assert res["controls"]["genre"] == "Ambient"
    assert res["controls"]["instrument"] == "Piano"
    assert "gentle melody" in res["final_prompt"]
    assert "calm" in res["final_prompt"].lower()
    assert "study" in res["final_prompt"].lower()


def test_empty_prompt_fallback():
    res = PromptProcessor.process()
    assert "music composition" in res["final_prompt"].lower() or "acoustic" in res["final_prompt"].lower()
