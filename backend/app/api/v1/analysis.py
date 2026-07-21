from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user, get_db
from app.models.analysis import Analysis
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User
from app.schemas.analysis import AnalysisOut, AnalysisRequest
from app.services import ats_engine, suggestion_engine
from app.utils.helpers import safe_json_dumps, safe_json_loads, trim_to_latest

router = APIRouter(prefix="/analysis", tags=["analysis"])


def _to_analysis_out(analysis: Analysis) -> AnalysisOut:
    return AnalysisOut(
        id=analysis.id,
        resume_id=analysis.resume_id,
        job_id=analysis.job_id,
        match_score=analysis.match_score,
        matched_keywords=safe_json_loads(analysis.matched_keywords, []),
        missing_keywords=safe_json_loads(analysis.missing_keywords, []),
        suggestions=safe_json_loads(analysis.suggestions, []),
        created_at=analysis.created_at,
    )


@router.post("", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
def run_analysis(payload: AnalysisRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    resume = db.query(Resume).filter(Resume.id == payload.resume_id, Resume.owner_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    job = db.query(Job).filter(Job.id == payload.job_id, Job.owner_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    resume_data = safe_json_loads(resume.parsed_data, {})
    resume_skills = resume_data.get("skills", [])
    requirement_groups = safe_json_loads(job.parsed_keywords, {"required": [], "preferred": []})

    result = ats_engine.compute_weighted_match(resume_skills, requirement_groups)
    match_score = result["match_score"]
    matched = result["matched_keywords"]
    missing = result["missing_keywords"]
    suggestions = suggestion_engine.generate_suggestions(missing, match_score)

    analysis = Analysis(
        user_id=current_user.id,
        resume_id=resume.id,
        job_id=job.id,
        match_score=match_score,
        matched_keywords=safe_json_dumps(matched),
        missing_keywords=safe_json_dumps(missing),
        suggestions=safe_json_dumps(suggestions),
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    trim_to_latest(db, Analysis, "user_id", current_user.id, limit=2)

    return _to_analysis_out(analysis)


@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis(analysis_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return _to_analysis_out(analysis)