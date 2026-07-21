import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listHistory } from "../api/analysisApi";
import { useToast } from "../components/ToastContext.jsx";
import ScoreGauge from "../components/ScoreGauge.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function History() {
  const { notify } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await listHistory();
        if (!cancelled) setHistory(data);
      } catch {
        if (!cancelled) notify("Could not load analysis history.", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [notify]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Analysis History</h2>
        <p className="text-muted mb-0">Every match you've run, most recent first.</p>
      </div>

      <div className="card card-elevated">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : history.length === 0 ? (
            <EmptyState
              icon="bi-clock-history"
              title="No analyses yet"
              description="Run your first resume-to-job match to see it show up here."
              action={
                <Link to="/analysis" className="btn btn-primary btn-sm">
                  Run analysis
                </Link>
              }
            />
          ) : (
            <div className="d-flex flex-column gap-3">
              {history.map((a) => (
                <div
                  key={a.id}
                  className="d-flex flex-wrap align-items-center justify-content-between border rounded-3 p-3 gap-3"
                >
                  <div className="d-flex align-items-center gap-3">
                    <ScoreGauge score={a.match_score} size={56} strokeWidth={5} label="" />
                    <div>
                      <div className="fw-semibold">Analysis #{a.id}</div>
                      <div className="text-muted small">{new Date(a.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <span className="badge rounded-pill" style={{ background: "rgba(47,163,107,0.12)", color: "var(--score-high)" }}>
                      {a.matched_keywords?.length || 0} matched
                    </span>
                    <span className="badge rounded-pill" style={{ background: "rgba(228,87,46,0.1)", color: "var(--score-low)" }}>
                      {a.missing_keywords?.length || 0} missing
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
