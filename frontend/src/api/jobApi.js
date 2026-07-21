import axiosClient from "./axiosClient";

export function createJob({ title, company, description }) {
  return axiosClient
    .post("/jobs", { title, company: company || null, description })
    .then((res) => res.data);
}

export function listJobs() {
  return axiosClient.get("/jobs").then((res) => res.data);
}

export function getJob(jobId) {
  return axiosClient.get(`/jobs/${jobId}`).then((res) => res.data);
}

export function deleteJob(jobId) {
  return axiosClient.delete(`/jobs/${jobId}`);
}
