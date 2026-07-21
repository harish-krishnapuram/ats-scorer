"""
Extracts raw text and structured fields (skills, contact info) from an
uploaded resume file (.pdf, .docx, .txt).
"""
import re
from pathlib import Path

from app.utils.constants import SKILLS_DB
from app.utils.helpers import normalize_text

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}")


def extract_text(file_path: str, file_type: str) -> str:
    if file_type == "pdf":
        return _extract_from_pdf(file_path)
    if file_type == "docx":
        return _extract_from_docx(file_path)
    if file_type == "txt":
        return Path(file_path).read_text(encoding="utf-8", errors="ignore")
    raise ValueError(f"Unsupported file type: {file_type}")


def _extract_from_pdf(file_path: str) -> str:
    from pypdf import PdfReader

    reader = PdfReader(file_path)
    pages_text = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages_text)


def _extract_from_docx(file_path: str) -> str:
    import docx

    document = docx.Document(file_path)
    paragraphs = [p.text for p in document.paragraphs]
    return "\n".join(paragraphs)


def parse_fields(raw_text: str) -> dict:
    normalized = normalize_text(raw_text)

    email_match = EMAIL_RE.search(raw_text)
    phone_match = PHONE_RE.search(raw_text)

    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    name = lines[0] if lines else None
    if name and (len(name) > 60 or "@" in name):
        name = None

    return {
        "name": name,
        "email": email_match.group(0) if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "skills": _match_skills(normalized),
        "education": [],
        "experience": [],
    }


def _match_skills(normalized_text: str) -> list[str]:
    found = []
    for skill in SKILLS_DB:
        pattern = r"(?<![a-z0-9])" + re.escape(skill) + r"(?![a-z0-9])"
        if re.search(pattern, normalized_text):
            found.append(skill)
    return found