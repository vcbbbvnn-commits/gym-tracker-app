import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "https://gym-tracker-app-lue1.onrender.com/api";
// Ensure it always ends with /api if the user forgot it in Vercel settings
const safeBaseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

const api = axios.create({
  baseURL: safeBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gym_tracker_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
