export default function FullScreenLoader({ label = "Loading..." }) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: "100vh", gap: "0.75rem" }}
    >
      <div className="spinner-border text-primary" role="status" />
      <span className="text-muted small">{label}</span>
    </div>
  );
}
