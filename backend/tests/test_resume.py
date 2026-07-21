"""
Tests for resume upload/list/delete endpoints.
"""
import io

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.dependencies import get_db
from app.database.base import Base
from app.main import app

engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def _auth_headers():
    client.post("/api/v1/auth/register", json={"email": "resume@example.com", "password": "strongpassword"})
    login = client.post("/api/v1/auth/login", data={"username": "resume@example.com", "password": "strongpassword"})
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_upload_txt_resume():
    headers = _auth_headers()
    file_content = b"John Doe\nSoftware Engineer\nSkills: Python, Django, React"
    response = client.post(
        "/api/v1/resumes",
        headers=headers,
        files={"file": ("resume.txt", io.BytesIO(file_content), "text/plain")},
    )
    assert response.status_code == 201
    assert response.json()["original_filename"] == "resume.txt"


def test_reject_unsupported_file_type():
    headers = _auth_headers()
    response = client.post(
        "/api/v1/resumes",
        headers=headers,
        files={"file": ("resume.exe", io.BytesIO(b"data"), "application/octet-stream")},
    )
    assert response.status_code == 400
