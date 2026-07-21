import json
import re
import uuid
from pathlib import Path
from sqlalchemy.orm import Session

def generate_unique_filename(original_filename: str) -> str:
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else ""
    return f"{uuid.uuid4().hex}.{ext}" if ext else uuid.uuid4().hex


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def safe_json_loads(value: str | None, default=None):
    if not value:
        return default if default is not None else []
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return default if default is not None else []


def safe_json_dumps(value) -> str:
    return json.dumps(value if value is not None else [])

from pathlib import Path
from sqlalchemy.orm import Session


def trim_to_latest(db: Session, model, owner_field: str, owner_id: int, limit: int, file_field: str | None = None):
    """
    Keep only the most recent `limit` rows for this owner; delete the rest.
    If file_field is given, also delete the file on disk for removed rows.
    """
    records = (
        db.query(model)
        .filter(getattr(model, owner_field) == owner_id)
        .order_by(model.created_at.desc())
        .all()
    )
    if len(records) > limit:
        for record in records[limit:]:
            if file_field:
                path = getattr(record, file_field, None)
                if path:
                    Path(path).unlink(missing_ok=True)
            db.delete(record)
        db.commit()