import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('siha_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token invalid, clear localStorage
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('siha_token')) {
        localStorage.removeItem('siha_token');
        localStorage.removeItem('siha_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
