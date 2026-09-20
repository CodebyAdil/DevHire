const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Single place all backend calls go through — mirrors the backend's own
 * "one config module, not process.env scattered everywhere" convention:
 * here, no component should hardcode a fetch URL or manually attach the
 * auth header, they all go through this file.
 */
async function request(
  path,
  { method = "GET", body, isFormData = false } = {},
) {
  const token = localStorage.getItem("devhire_token");

  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content has no body to parse
  const data =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data?.details;
    throw error;
  }

  return data;
}

export const api = {
  register: (payload) =>
    request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me"),

  listJobs: () => request("/jobs"),
  createJob: (payload) => request("/jobs", { method: "POST", body: payload }),
  getJob: (id) => request(`/jobs/${id}`),
  updateJob: (id, payload) =>
    request(`/jobs/${id}`, { method: "PATCH", body: payload }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: "DELETE" }),

  listCandidates: (jobId) => request(`/jobs/${jobId}/candidates`),
  getCandidate: (jobId, id) => request(`/jobs/${jobId}/candidates/${id}`),
  uploadResumes: (jobId, formData) =>
    request(`/jobs/${jobId}/candidates`, {
      method: "POST",
      body: formData,
      isFormData: true,
    }),
  scoreCandidate: (jobId, id) =>
    request(`/jobs/${jobId}/candidates/${id}/score`, { method: "POST" }),
  scoreAllCandidates: (jobId) =>
    request(`/jobs/${jobId}/candidates/score-all`, { method: "POST" }),
};
