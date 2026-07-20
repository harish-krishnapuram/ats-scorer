from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResumeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_filename: str
    file_type: str
    created_at: datetime


class ResumeParsedOut(ResumeOut):
    raw_text: str | None = None
    parsed_data: dict | None = None
