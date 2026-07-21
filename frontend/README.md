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
