import axiosClient from "./axiosClient";

export function uploadResume(file) {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient
    .post("/resumes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}

export function listResumes() {
  return axiosClient.get("/resumes").then((res) => res.data);
}

export function getResume(resumeId) {
  return axiosClient.get(`/resumes/${resumeId}`).then((res) => res.data);
}

export function deleteResume(resumeId) {
  return axiosClient.delete(`/resumes/${resumeId}`);
}
