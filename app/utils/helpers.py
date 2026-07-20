import json
import re
import uuid


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
    return json.dumps(value or [])
