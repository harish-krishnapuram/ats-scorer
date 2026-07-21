import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: "100vh", padding: "2rem" }}
    >
      <h1 className="font-mono mb-2" style={{ fontSize: "3rem", color: "var(--ink)" }}>
        404
      </h1>
      <p className="text-muted mb-4">This page doesn't exist, or you don't have access to it.</p>
      <Link to="/dashboard" className="btn btn-primary">
        Back to dashboard
      </Link>
    </div>
  );
}
