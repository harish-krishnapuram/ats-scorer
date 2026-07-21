from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    resume_id: Mapped[int] = mapped_column(ForeignKey("resumes.id"), nullable=False)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), nullable=False)

    match_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    matched_keywords: Mapped[str] = mapped_column(Text, nullable=True)   # JSON list
    missing_keywords: Mapped[str] = mapped_column(Text, nullable=True)   # JSON list
    suggestions: Mapped[str] = mapped_column(Text, nullable=True)        # JSON list

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="analyses")
    resume = relationship("Resume", back_populates="analyses")
    job = relationship("Job", back_populates="analyses")
