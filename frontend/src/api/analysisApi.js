import axiosClient from "./axiosClient";

export function runAnalysis({ resumeId, jobId }) {
  return axiosClient
    .post("/analysis", { resume_id: resumeId, job_id: jobId })
    .then((res) => res.data);
}

export function getAnalysis(analysisId) {
  return axiosClient.get(`/analysis/${analysisId}`).then((res) => res.data);
}

export function listHistory() {
  return axiosClient.get("/history").then((res) => res.data);
}
