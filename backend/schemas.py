from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    prompt: Optional[str] = Field(default="", description="Natural-language music prompt")
    mood: Optional[str] = Field(default=None, description="Musical mood (e.g., Calm, Happy, Dark)")
    genre: Optional[str] = Field(default=None, description="Genre (e.g., Ambient, Classical, Jazz)")
    instrument: Optional[str] = Field(default=None, description="Primary instrument (e.g., Piano, Guitar)")
    intensity: Optional[str] = Field(default=None, description="Intensity level (Low, Medium, High)")
    tempo: Optional[str] = Field(default=None, description="Tempo (Slow, Medium, Fast)")
    purpose: Optional[str] = Field(default=None, description="Intended purpose (Study, Workout, Meditation)")
    duration: int = Field(default=5, ge=1, le=30, description="Audio duration in seconds (1-30)")


class RegenerateRequest(BaseModel):
    generation_id: str = Field(..., description="ID of previous generation to re-trigger")
    prompt_override: Optional[str] = Field(default=None, description="Optional updated prompt")


class GenerateResponse(BaseModel):
    generation_id: str
    original_prompt: str
    final_prompt: str
    controls: Dict[str, Any]
    duration_seconds: float
    sampling_rate: int
    audio_url: str
    waveform_url: str
    spectrogram_url: str
    waveform_points: List[float]
    generation_time_seconds: float
    device: str
    created_at: str


class HealthResponse(BaseModel):
    status: str
    service: str
    device: str
    model_id: str
