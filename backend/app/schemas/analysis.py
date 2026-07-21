from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AnalysisRequest(BaseModel):
    resume_id: int
    job_id: int


class AnalysisOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    resume_id: int
    job_id: int
    match_score: float
    matched_keywords: list[str] = []
    missing_keywords: list[str] = []
    suggestions: list[str] = []
    created_at: datetime
