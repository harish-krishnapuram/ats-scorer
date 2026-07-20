# ATS Backend

A FastAPI backend for an Applicant Tracking System (ATS) resume/job-matching
platform, paired with a React frontend.

## Features

- JWT-based authentication (register/login)
- Resume upload and parsing (PDF / DOCX / TXT)
- Job description parsing and keyword extraction
- ATS match scoring between resumes and job descriptions
- Actionable improvement suggestions
- Analysis history per user

## Tech Stack

- **FastAPI** — web framework
- **SQLAlchemy 2.0** — ORM
- **Alembic** — database migrations
- **Pydantic v2 / pydantic-settings** — validation & config
- **python-jose + passlib** — JWT auth & password hashing
- **SQLite** for local dev, **PostgreSQL/MySQL** in production

## Project Structure

```
ats-backend/
├── app/
│   ├── main.py              # FastAPI app entrypoint
│   ├── api/v1/               # Route handlers (auth, users, resumes, jobs, analysis, history)
│   ├── core/                 # Config, security, shared dependencies
│   ├── database/              # Engine, session, declarative base
│   ├── models/                # SQLAlchemy models
│   ├── schemas/                # Pydantic request/response schemas
│   ├── services/                # Business logic (parsing, scoring, suggestions)
│   ├── utils/                    # Constants, helpers, file handling
│   └── uploads/resumes/            # Uploaded resume storage
├── migrations/                # Alembic migration environment
├── tests/                     # Pytest test suite
├── requirements.txt
├── alembic.ini
└── run.py
```

## Getting Started

### 1. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
# edit .env: set SECRET_KEY, DATABASE_URL, etc.
```

### 4. Run database migrations (optional for SQLite dev)

```bash
alembic revision --autogenerate -m "init"
alembic upgrade head
```

By default, `app/main.py` also calls `Base.metadata.create_all()` on startup
for quick local development, so migrations aren't strictly required to get
started with SQLite.

### 5. Start the dev server

```bash
python run.py
# or
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`, with interactive docs
at `http://localhost:8000/docs`.

## Running Tests

```bash
pytest
```

## API Overview

| Method | Endpoint                  | Description                     |
|--------|----------------------------|----------------------------------|
| POST   | `/api/v1/auth/register`    | Register a new user             |
| POST   | `/api/v1/auth/login`       | Log in, get JWT access token    |
| GET    | `/api/v1/users/me`         | Get current user profile        |
| POST   | `/api/v1/resumes`          | Upload & parse a resume         |
| GET    | `/api/v1/resumes`          | List uploaded resumes           |
| GET    | `/api/v1/resumes/{id}`     | Get a parsed resume             |
| DELETE | `/api/v1/resumes/{id}`     | Delete a resume                 |
| POST   | `/api/v1/jobs`              | Create a job description        |
| GET    | `/api/v1/jobs`              | List job descriptions           |
| POST   | `/api/v1/analysis`          | Run ATS match analysis          |
| GET    | `/api/v1/analysis/{id}`     | Get a specific analysis result  |
| GET    | `/api/v1/history`            | List past analyses              |

## Frontend

This backend is designed to pair with a React frontend (Vite/CRA), configured
via the `CORS_ORIGINS` setting in `.env`.

## Notes

- `app/services/resume_parser.py` and `app/services/job_parser.py` contain
  `TODO`s for PDF/DOCX text extraction and keyword extraction — plug in
  `pypdf`, `python-docx`, spaCy, or an LLM-based approach as needed.
- `app/services/ats_engine.py` currently uses simple set-overlap scoring;
  swap in embeddings/semantic similarity for a more sophisticated match.
