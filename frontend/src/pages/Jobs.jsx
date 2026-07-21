import { useCallback, useEffect, useState } from "react";

import { createJob, deleteJob, listJobs } from "../api/jobApi";
import { useToast } from "../components/ToastContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Jobs() {
  const { notify } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setJobs(await listJobs());
    } catch {
      notify("Could not load job descriptions.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      notify("Title and description are required.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await createJob({ title, company, description });
      notify("Job description saved.", "success");
      setTitle("");
      setCompany("");
      setDescription("");
      load();
    } catch (err) {
      notify(err.response?.data?.detail || "Could not save job.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this job description?")) return;
    setDeletingId(id);
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      notify("Job description deleted.", "success");
    } catch {
      notify("Could not delete job.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Job Descriptions</h2>
        <p className="text-muted mb-0">Save the roles you're applying to so you can score resumes against them.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card card-elevated">
            <div className="card-header bg-white">
              <h6 className="mb-0">Add a job description</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Job title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Python Backend Developer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Company (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. HSBC"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows={8}
                    placeholder="Paste the full job description here…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting && <span className="spinner-border spinner-border-sm-inline me-2" />}
                  Save job description
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card card-elevated">
            <div className="card-header bg-white">
              <h6 className="mb-0">Saved jobs</h6>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <span className="spinner-border spinner-border-sm text-primary" />
                </div>
              ) : jobs.length === 0 ? (
                <EmptyState
                  icon="bi-briefcase"
                  title="No job descriptions yet"
                  description="Add one on the left to start matching resumes against it."
                />
              ) : (
                <div className="d-flex flex-column gap-3">
                  {jobs.map((job) => {
                    const isExpanded = expandedId === job.id;
                    return (
                      <div key={job.id} className="border rounded-3 p-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-semibold">{job.title}</div>
                            {job.company && <div className="text-muted small">{job.company}</div>}
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setExpandedId(isExpanded ? null : job.id)}
                            >
                              <i className={`bi ${isExpanded ? "bi-chevron-up" : "bi-chevron-down"}`} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(job.id)}
                              disabled={deletingId === job.id}
                            >
                              {deletingId === job.id ? (
                                <span className="spinner-border spinner-border-sm-inline" />
                              ) : (
                                <i className="bi bi-trash3" />
                              )}
                            </button>
                          </div>
                        </div>
                        {isExpanded && (
                          <p className="text-muted small mt-3 mb-0" style={{ whiteSpace: "pre-wrap" }}>
                            {job.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
