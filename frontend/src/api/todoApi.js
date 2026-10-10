import axios from 'axios';

// In dev, Vite proxy forwards /api → http://localhost:5000
// In production Docker, VITE_API_URL should be set to the backend URL
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Response interceptor for uniform error messages ───────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Todo API methods ──────────────────────────────────────────────────────────
export const todoApi = {
  getAll: (params = {}) => api.get('/todos', { params }),
  getById: (id) => api.get(`/todos/${id}`),
  create: (data) => api.post('/todos', data),
  update: (id, data) => api.put(`/todos/${id}`, data),
  toggle: (id) => api.patch(`/todos/${id}/toggle`),
  delete: (id) => api.delete(`/todos/${id}`),
  deleteCompleted: () => api.delete('/todos/completed/all'),
  health: () => api.get('/health'),
};

export default api;
