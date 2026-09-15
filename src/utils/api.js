import axios from "axios";

// Instance terpusat + token login web app (tanpa logout — token menetap).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5002",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (!config.url.startsWith("/auth/")) {
    const token = localStorage.getItem("qa_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
