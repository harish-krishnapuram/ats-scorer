from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_active_user, get_db
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ResumeOut, ResumeParsedOut
from app.services import resume_parser
from app.utils.file_handler import save_resume_file, validate_resume_file
from app.utils.helpers import safe_json_dumps, safe_json_loads
from app.utils.helpers import trim_to_latest

router = APIRouter(prefix="/resumes", tags=["resumes"])


def _build_resume_out(resume: Resume) -> ResumeParsedOut:
    return ResumeParsedOut(
        id=resume.id,
        original_filename=resume.original_filename,
        file_type=resume.file_type,
        created_at=resume.created_at,
        raw_text=resume.raw_text,
        parsed_data=safe_json_loads(resume.parsed_data, {}),
    )


@router.post("", response_model=ResumeParsedOut, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    file_type = validate_resume_file(file)
    contents = await file.read()

    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")

    stored_path, _ = save_resume_file(file, contents)

    raw_text = ""
    parsed_data: dict = {}
    try:
        raw_text = resume_parser.extract_text(stored_path, file_type)
        parsed_data = resume_parser.parse_fields(raw_text)
    except NotImplementedError:
        pass  # parser not implemented yet for this file type

    resume = Resume(
        owner_id=current_user.id,
        original_filename=file.filename,
        stored_path=stored_path,
        file_type=file_type,
        raw_text=raw_text,
        parsed_data=safe_json_dumps(parsed_data),
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    trim_to_latest(db, Resume, "owner_id", current_user.id, limit=2, file_field="stored_path")

    return _build_resume_out(resume)


@router.get("", response_model=list[ResumeOut])
def list_resumes(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return db.query(Resume).filter(Resume.owner_id == current_user.id).order_by(Resume.created_at.desc()).all()


@router.get("/{resume_id}", response_model=ResumeParsedOut)
def get_resume(resume_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.owner_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    return _build_resume_out(resume)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(resume_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.owner_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()