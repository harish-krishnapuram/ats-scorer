"""
Extracts raw text and structured fields (skills, experience, education, contact info)
from an uploaded resume file (.pdf, .docx, .txt).
"""
from pathlib import Path


def extract_text(file_path: str, file_type: str) -> str:
    """Dispatch to the correct extractor based on file type."""
    if file_type == "pdf":
        return _extract_from_pdf(file_path)
    if file_type == "docx":
        return _extract_from_docx(file_path)
    if file_type == "txt":
        return Path(file_path).read_text(encoding="utf-8", errors="ignore")
    raise ValueError(f"Unsupported file type: {file_type}")


def _extract_from_pdf(file_path: str) -> str:
    # TODO: use pypdf / pdfplumber to extract text
    raise NotImplementedError


def _extract_from_docx(file_path: str) -> str:
    # TODO: use python-docx to extract text
    raise NotImplementedError


def parse_fields(raw_text: str) -> dict:
    """
    Parse structured fields out of raw resume text: name, email, phone,
    skills, education, work experience, certifications, etc.
    """
    # TODO: implement rule-based / NLP parsing
    return {
        "name": None,
        "email": None,
        "phone": None,
        "skills": [],
        "education": [],
        "experience": [],
    }
