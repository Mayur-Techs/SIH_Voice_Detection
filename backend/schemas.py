from pydantic import BaseModel, Field
from typing import Literal, List


class HealthResponse(BaseModel):
    status: str
    model: str
    model_loaded: bool


class UploadResponse(BaseModel):
    session_id: str
    duration_sec: float


class TimelinePoint(BaseModel):
    t: float   # seconds from start
    score: float  # 0-1 normalized


class ReportResponse(BaseModel):
    final_state: Literal["LOW_RISK", "SUSPICIOUS", "HIGH_RISK"]
    final_score: float = Field(..., ge=0, le=1)
    confidence: float = Field(..., ge=0, le=1)
    timeline: List[TimelinePoint]
    model_used: str
    recommendation: str
