import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listResumes } from "../api/resumeApi";
import { listJobs } from "../api/jobApi";
import { runAnalysis } from "../api/analysisApi";
import { useToast } from "../components/ToastContext.jsx";
import ScoreGauge from "../components/ScoreGauge.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Analysis() {
  const { notify } = useToast();

  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingOptions(true);
      try {
        const [resumesData, jobsData] = await Promise.all([listResumes(), listJobs()]);
        if (cancelled) return;
        setResumes(resumesData);
        setJobs(jobsData);
      } catch {
        notify("Could not load resumes/jobs.", "error");
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [notify]);

  async function handleRun(e) {
    e.preventDefault();
    if (!resumeId || !jobId) {
      notify("Choose a resume and a job description first.", "error");
      return;
    }
    setRunning(true);
    setResult(null);
    try {
      const data = await runAnalysis({ resumeId: Number(resumeId), jobId: Number(jobId) });
      setResult(data);
    } catch (err) {
      notify(err.response?.data?.detail || "Analysis failed.", "error");
    } finally {
      setRunning(false);
    }
  }

  const noOptions = !loadingOptions && (resumes.length === 0 || jobs.length === 0);

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Run Analysis</h2>
        <p className="text-muted mb-0">Pick a resume and a job description to see how well they match.</p>
      </div>

      {noOptions ? (
        <div className="card card-elevated">
          <div className="card-body">
            <EmptyState
              icon="bi-graph-up-arrow"
              title="You need at least one resume and one job description"
              description="Add both, then come back to run your first analysis."
              action={
                <div className="d-flex gap-2 justify-content-center">
                  <Link to="/resumes" className="btn btn-primary btn-sm">
                    Upload resume
                  </Link>
                  <Link to="/jobs" className="btn btn-outline-primary btn-sm">
                    Add job description
                  </Link>
                </div>
              }
            />
          </div>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card card-elevated">
              <div className="card-body">
                <form onSubmit={handleRun}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Resume</label>
                    <select
                      className="form-select"
                      value={resumeId}
                      onChange={(e) => setResumeId(e.target.value)}
                      disabled={loadingOptions}
                      required
                    >
                      <option value="">Select a resume…</option>
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.original_filename}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Job description</label>
                    <select
                      className="form-select"
                      value={jobId}
                      onChange={(e) => setJobId(e.target.value)}
                      disabled={loadingOptions}
                      required
                    >
                      <option value="">Select a job…</option>
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title}
                          {j.company ? ` · ${j.company}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={running}>
                    {running && <span className="spinner-border spinner-border-sm-inline me-2" />}
                    Run analysis
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card card-elevated h-100">
              <div className="card-body">
                {running ? (
                  <div className="text-center py-5">
                    <span className="spinner-border text-primary mb-2" />
                    <div className="text-muted small">Scoring your resume against this role…</div>
                  </div>
                ) : !result ? (
                  <EmptyState
                    icon="bi-clipboard-data"
                    title="Results will appear here"
                    description="Run an analysis to see your match score, keyword gaps, and suggestions."
                  />
                ) : (
                  <div>
                    <div className="d-flex align-items-center gap-4 mb-4">
                      <ScoreGauge score={result.match_score} size={110} strokeWidth={10} />
                      <div>
                        <h5 className="mb-1">Match score</h5>
                        <p className="text-muted small mb-0">
                          Based on keyword overlap between this resume and job description.
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h6 className="small text-uppercase text-muted mb-2">Matched keywords</h6>
                      {result.matched_keywords?.length ? (
                        <div>
                          {result.matched_keywords.map((kw) => (
                            <span key={kw} className="chip chip-matched">
                              <i className="bi bi-check-circle-fill" style={{ fontSize: "0.7rem" }} />
                              {kw}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted small mb-0">No overlapping keywords found.</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <h6 className="small text-uppercase text-muted mb-2">Missing keywords</h6>
                      {result.missing_keywords?.length ? (
                        <div>
                          {result.missing_keywords.map((kw) => (
                            <span key={kw} className="chip chip-missing">
                              <i className="bi bi-exclamation-circle-fill" style={{ fontSize: "0.7rem" }} />
                              {kw}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted small mb-0">Nothing missing — great coverage!</p>
                      )}
                    </div>

                    {result.suggestions?.length > 0 && (
                      <div>
                        <h6 className="small text-uppercase text-muted mb-2">Suggestions</h6>
                        <ul className="mb-0 ps-3">
                          {result.suggestions.map((s, i) => (
                            <li key={i} className="small mb-1">
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
