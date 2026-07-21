from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.analysis import _to_analysis_out
from app.core.dependencies import get_current_active_user, get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.analysis import AnalysisOut

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=list[AnalysisOut])
def list_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )
    return [_to_analysis_out(a) for a in analyses]