from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user, get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.analysis import AnalysisOut
from app.utils.helpers import safe_json_loads

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=list[AnalysisOut])
def list_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )

    results = []
    for a in analyses:
        out = AnalysisOut.model_validate(a)
        out.matched_keywords = safe_json_loads(a.matched_keywords, [])
        out.missing_keywords = safe_json_loads(a.missing_keywords, [])
        out.suggestions = safe_json_loads(a.suggestions, [])
        results.append(out)
    return results
