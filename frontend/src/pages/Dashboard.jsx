import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listResumes } from "../api/resumeApi";
import { listJobs } from "../api/jobApi";
import { listHistory } from "../api/analysisApi";
import { useAuth } from "../auth/AuthContext.jsx";
import ScoreGauge from "../components/ScoreGauge.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [resumesRes, jobsRes, historyRes] = await Promise.allSettled([
        listResumes(),
        listJobs(),
        listHistory(),
      ]);
      if (cancelled) return;
      if (resumesRes.status === "fulfilled") setResumes(resumesRes.value);
      if (jobsRes.status === "fulfilled") setJobs(jobsRes.value);
      if (historyRes.status === "fulfilled") setHistory(historyRes.value);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const latestAnalyses = history.slice(0, 5);
  const firstName = user?.full_name?.split(" ")[0];

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-2">
        <div>
          <h2 className="mb-1">{firstName ? `Welcome back, ${firstName}` : "Welcome back"}</h2>
          <p className="text-muted mb-0">Here's where things stand across your job search.</p>
        </div>
        <Link to="/analysis" className="btn btn-primary">
          <i className="bi bi-graph-up-arrow me-1" />
          Run a new analysis
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-4">
          <div className="card stat-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted small">Resumes uploaded</div>
                <div className="stat-value">{loading ? "—" : resumes.length}</div>
              </div>
              <i className="bi bi-file-earmark-text fs-3 text-primary" />
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4">
          <div className="card stat-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted small">Job descriptions saved</div>
                <div className="stat-value">{loading ? "—" : jobs.length}</div>
              </div>
              <i className="bi bi-briefcase fs-3 text-primary" />
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4">
          <div className="card stat-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted small">Analyses run</div>
                <div className="stat-value">{loading ? "—" : history.length}</div>
              </div>
              <i className="bi bi-clock-history fs-3 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="card card-elevated">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Recent analyses</h6>
          <Link to="/history" className="small">
            View all
          </Link>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : latestAnalyses.length === 0 ? (
            <EmptyState
              icon="bi-graph-up-arrow"
              title="No analyses yet"
              description="Upload a resume and a job description, then run your first match."
              action={
                <Link to="/analysis" className="btn btn-primary btn-sm">
                  Run analysis
                </Link>
              }
            />
          ) : (
            <div className="d-flex flex-column gap-3">
              {latestAnalyses.map((a) => (
                <div
                  key={a.id}
                  className="d-flex align-items-center justify-content-between border-bottom pb-3"
                >
                  <div className="d-flex align-items-center gap-3">
                    <ScoreGauge score={a.match_score} size={52} strokeWidth={5} label="" />
                    <div>
                      <div className="fw-semibold">Analysis #{a.id}</div>
                      <div className="text-muted small">
                        {new Date(a.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="badge text-bg-light border">
                    {a.matched_keywords?.length || 0} matched · {a.missing_keywords?.length || 0} missing
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
