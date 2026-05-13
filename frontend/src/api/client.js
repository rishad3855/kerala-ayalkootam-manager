import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: apiBaseUrl
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ayalkootam_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function downloadUrl(path) {
  return `${apiBaseUrl}${path}`;
}
