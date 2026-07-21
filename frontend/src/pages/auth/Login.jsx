import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../components/ToastContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      notify("Welcome back!", "success");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Incorrect email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <span className="brand-mark">
          <span className="brand-dot" />
          ATS Copilot
        </span>
        <div>
          <h2 className="text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Know your match score before you hit submit.
          </h2>
          <p className="mb-0" style={{ color: "#b8c0d4", maxWidth: 420 }}>
            Upload a resume, paste in a job description, and see exactly which
            keywords are missing — before an ATS filters you out.
          </p>
        </div>
        <p className="mb-0" style={{ color: "#6c7691", fontSize: "0.85rem" }}>
          &copy; {new Date().getFullYear()} ATS Copilot
        </p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="d-lg-none mb-4 text-center">
            <span className="brand-mark justify-content-center">
              <span className="brand-dot" />
              ATS Copilot
            </span>
          </div>

          <h3 className="mb-1">Log in</h3>
          <p className="text-muted mb-4">Welcome back — enter your details to continue.</p>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label small fw-semibold">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label small fw-semibold">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-2" disabled={submitting}>
              {submitting && <span className="spinner-border spinner-border-sm-inline me-2" />}
              Log in
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            Don&apos;t have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
