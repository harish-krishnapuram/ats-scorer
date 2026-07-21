"""
Extracts structured, weighted requirements from a job description:
- required vs preferred sections
- "X/Y" or "X or Y" treated as alternative groups (satisfying any one counts)
"""
import re

from app.utils.constants import SKILLS_DB
from app.utils.helpers import normalize_text

REQUIRED_HEADERS = [
    "required qualifications", "requirements", "must have", "must-have",
    "minimum qualifications", "required skills", "basic qualifications",
]
PREFERRED_HEADERS = [
    "preferred qualifications", "preferred skills", "nice to have",
    "nice-to-have", "good to have", "bonus", "pluses", "preferred",
]


def extract_requirements(description: str) -> dict:
    """
    Returns:
    {
      "required": [["python", "java"], ["react"]],     # each inner list = OR-alternatives
      "preferred": [["docker", "kubernetes"]],
    }
    If the description has no explicit "Required"/"Preferred" headers,
    everything is treated as required (backwards-compatible behavior).
    """
    sections = _split_sections(description)
    if not sections["required"] and not sections["preferred"]:
        sections["required"] = description.splitlines()

    return {
        "required": _lines_to_groups(sections["required"]),
        "preferred": _lines_to_groups(sections["preferred"]),
    }


def _split_sections(description: str) -> dict:
    sections = {"required": [], "preferred": []}
    current = None
    for raw_line in description.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        lowered = line.lower().strip(":-• ")
        if any(h in lowered for h in REQUIRED_HEADERS):
            current = "required"
            continue
        if any(h in lowered for h in PREFERRED_HEADERS):
            current = "preferred"
            continue
        if current:
            sections[current].append(line)
    return sections


def _lines_to_groups(lines: list[str]) -> list[list[str]]:
    groups = []
    for line in lines:
        for chunk in re.split(r"[,;]", line):
            chunk = chunk.strip()
            if not chunk:
                continue
            # "/" or " or " inside a chunk = alternatives, not separate requirements
            alt_parts = re.split(r"\s*/\s*|\s+or\s+", chunk, flags=re.IGNORECASE)
            alt_skills = []
            for part in alt_parts:
                normalized = normalize_text(part)
                for skill in SKILLS_DB:
                    pattern = r"(?<![a-z0-9])" + re.escape(skill) + r"(?![a-z0-9])"
                    if re.search(pattern, normalized) and skill not in alt_skills:
                        alt_skills.append(skill)
            if alt_skills:
                groups.append(alt_skills)
    return groups