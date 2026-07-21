import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../components/ToastContext.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (username.length === 0) {
      setError("Username cannot be empty.");
      return;
    }
    if (email.length === 0) {
      setError("Email cannot be empty.");
      return;
    }
    if (password.length === 0 || confirmPassword.length === 0) {
      setError("Password fields cannot be empty.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await signup({ email, password, username });
      notify("Account created — you're in!", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Could not create your account. Please try again.");
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
            Tailor every application with data, not guesswork.
          </h2>
          <p className="mb-0" style={{ color: "#b8c0d4", maxWidth: 420 }}>
            Track every resume and job description in one place, and get a
            fresh match score and suggestions for each application.
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

          <h3 className="mb-1">Create your account</h3>
          <p className="text-muted mb-4">It only takes a minute to get started.</p>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="username" className="form-label small fw-semibold">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="Jane Doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="name"
              />
            </div>

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
                // autoComplete="email"
                required
              />
            </div>

            <div className="row g-2">
              <div className="col-6 mb-3">
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
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="col-6 mb-3">
                <label htmlFor="confirmPassword" className="form-label small fw-semibold">
                  Confirm
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-2" disabled={submitting}>
              {submitting && <span className="spinner-border spinner-border-sm-inline me-2" />}
              Create account
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
