import axios from "axios";

const BASE = "http://localhost:5000/api";

// Configure axios with timeout and better error handling
const apiClient = axios.create({
  baseURL: BASE,
  timeout: 10000,
});

// Add error interceptor for better error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.code === "ECONNABORTED") {
      throw new Error(
        "Request timeout. The server might be slow or unreachable.",
      );
    }
    if (error.message === "Network Error") {
      throw new Error(
        "Network error. Make sure the backend is running on http://localhost:5000",
      );
    }
    throw error;
  },
);

export const getTodayHabits = () => apiClient.get(`/today`).then((r) => r.data);
export const addHabit = (data) =>
  apiClient.post(`/habits`, data).then((r) => r.data);
export const deleteHabit = (id) =>
  apiClient.delete(`/habits/${id}`).then((r) => r.data);
export const markComplete = (id) =>
  apiClient.post(`/habits/${id}/complete`).then((r) => r.data);
export const getAnalytics = () =>
  apiClient.get(`/analytics`).then((r) => r.data);
export const getHeatmap = (id) =>
  apiClient.get(`/habits/${id}/heatmap`).then((r) => r.data);
export const getYearHeatmap = () =>
  apiClient.get(`/heatmap/year`).then((r) => r.data);
