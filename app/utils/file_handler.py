"""
Handles saving/validating uploaded resume files to disk.
"""
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.utils.constants import ALLOWED_RESUME_EXTENSIONS
from app.utils.helpers import generate_unique_filename


def validate_resume_file(file: UploadFile) -> str:
    """Validate extension and return the lowercase extension without the dot."""
    filename = file.filename or ""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_RESUME_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_RESUME_EXTENSIONS))}",
        )
    return ext.lstrip(".")


def save_resume_file(file: UploadFile, contents: bytes) -> tuple[str, str]:
    """Save file contents to the upload directory. Returns (stored_path, unique_filename)."""
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    unique_name = generate_unique_filename(file.filename or "resume")
    dest_path = upload_dir / unique_name
    dest_path.write_bytes(contents)

    return str(dest_path), unique_name
