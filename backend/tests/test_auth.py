"""
Tests for registration and login endpoints.
Uses an isolated SQLite DB overriding the app's get_db dependency.
"""
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


def test_register_user():
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "strongpassword", "full_name": "Test User"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"


def test_login_user():
    client.post(
        "/api/v1/auth/register",
        json={"email": "login@example.com", "password": "strongpassword"},
    )
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "login@example.com", "password": "strongpassword"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
