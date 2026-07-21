# ATS Copilot

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

# ATS Copilot — Frontend

A React + Bootstrap frontend for the ATS backend (FastAPI). Upload resumes,
save job descriptions, and get a match score with keyword gaps and
suggestions — all behind a proper login/signup flow with JWT-based
protected routes.

## Stack

- **React 18 + Vite** — app shell and dev server
- **React Router v6** — routing, including protected routes
- **Axios** — API client with request/response interceptors for JWT
- **Bootstrap 5 + Bootstrap Icons** — UI components, customized via CSS variables

## Features

- **Auth**: login, signup (with auto-login after signup), logout
- **Token management**: JWT stored in `localStorage`, attached to every
  request automatically; a 401 response anywhere logs the user out and
  redirects to `/login`
- **Protected routes**: `/dashboard`, `/resumes`, `/jobs`, `/analysis`,
  `/history` all require a valid session; `/login` and `/signup` redirect
  away if you're already logged in
- **Resumes**: drag-and-drop or click-to-upload, list, delete
- **Jobs**: add/list/delete job descriptions
- **Analysis**: pick a resume + job, run the match, see a score gauge,
  matched/missing keyword chips, and suggestions
- **History**: every past analysis, most recent first
- **Dashboard**: quick stats + recent analyses

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API base URL

```bash
cp .env.example .env
# edit .env if your backend isn't running on http://localhost:8000
```

### 3. Start the backend first

This app expects the FastAPI ATS backend running (see the `ats-backend`
project) at the URL set in `VITE_API_BASE_URL`. Make sure its `CORS_ORIGINS`
includes `http://localhost:5173`.

### 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:5173`. You'll land on `/login` — use "Create one" to
sign up, which logs you in automatically afterward.

## Project Structure

```
src/
├── api/                 # axios client + one module per backend resource
│   ├── axiosClient.js    # token attach + 401 handling
│   ├── authApi.js
│   ├── resumeApi.js
│   ├── jobApi.js
│   └── analysisApi.js
├── auth/
│   ├── AuthContext.jsx    # session state, login/signup/logout
│   └── ProtectedRoute.jsx # route guards
├── components/
│   ├── AppLayout.jsx       # sidebar + content shell for logged-in pages
│   ├── Sidebar.jsx
│   ├── ScoreGauge.jsx       # signature match-score ring
│   ├── EmptyState.jsx
│   ├── FullScreenLoader.jsx
│   └── ToastContext.jsx     # toast notifications
├── pages/
│   ├── auth/Login.jsx
│   ├── auth/Signup.jsx
│   ├── Dashboard.jsx
│   ├── Resumes.jsx
│   ├── Jobs.jsx
│   ├── Analysis.jsx
│   ├── History.jsx
│   └── NotFound.jsx
├── App.jsx                # route definitions
├── main.jsx                # app entry, providers
└── index.css                # design tokens + Bootstrap overrides
```

## Notes on Token Management

- The access token is stored under the `ats_access_token` key in
  `localStorage` and attached as `Authorization: Bearer <token>` to every
  request via an axios request interceptor.
- On app load, if a token exists, `AuthContext` calls `/users/me` to confirm
  it's still valid before rendering any protected page — this avoids
  flashing protected content for an expired token.
- If any API call returns 401, a global response interceptor clears the
  token and the app redirects to `/login` automatically.

## Building for Production

```bash
npm run build
```

Output goes to `dist/`, ready to deploy to Vercel, Netlify, or any static host.
Set `VITE_API_BASE_URL` to your deployed backend's URL as an environment
variable in your hosting provider before building.
