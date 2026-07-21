import { useCallback, useEffect, useRef, useState } from "react";

import { deleteResume, listResumes, uploadResume } from "../api/resumeApi";
import { useToast } from "../components/ToastContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

function fileIcon(fileType) {
  if (fileType === "pdf") return "bi-file-earmark-pdf text-danger";
  if (fileType === "docx") return "bi-file-earmark-word text-primary";
  return "bi-file-earmark-text text-secondary";
}

export default function Resumes() {
  const { notify } = useToast();
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listResumes();
      setResumes(data);
    } catch {
      notify("Could not load resumes.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleFile(file) {
    if (!file) return;
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      notify(`Unsupported file type ${ext}. Use PDF, DOCX, or TXT.`, "error");
      return;
    }

    setUploading(true);
    try {
      await uploadResume(file);
      notify("Resume uploaded.", "success");
      load();
    } catch (err) {
      notify(err.response?.data?.detail || "Upload failed.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this resume? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      notify("Resume deleted.", "success");
    } catch {
      notify("Could not delete resume.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Resumes</h2>
        <p className="text-muted mb-0">Upload the resumes you want to score against job descriptions.</p>
      </div>

      <div
        className={`dropzone mb-4 ${dragging ? "dragging" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        role="button"
        tabIndex={0}
      >
        {uploading ? (
          <>
            <span className="spinner-border text-primary mb-2" />
            <div>Uploading and parsing…</div>
          </>
        ) : (
          <>
            <i className="bi bi-cloud-arrow-up d-block" style={{ fontSize: "2rem" }} />
            <div className="fw-semibold mb-1">Drop a resume here, or click to browse</div>
            <div className="small">PDF, DOCX, or TXT — up to 10MB</div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="d-none"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <div className="card card-elevated">
        <div className="card-header bg-white">
          <h6 className="mb-0">Your resumes</h6>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : resumes.length === 0 ? (
            <EmptyState
              icon="bi-file-earmark-text"
              title="No resumes yet"
              description="Upload your first resume above to get started."
            />
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr className="text-muted small text-uppercase">
                    <th>File</th>
                    <th>Uploaded</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <i className={`bi ${fileIcon(r.file_type)} me-2`} />
                        {r.original_filename}
                      </td>
                      <td className="text-muted small">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                        >
                          {deletingId === r.id ? (
                            <span className="spinner-border spinner-border-sm-inline" />
                          ) : (
                            <i className="bi bi-trash3" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
