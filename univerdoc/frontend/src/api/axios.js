import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('univerdoc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login attempt failure
      const isLoginRoute = error.config && error.config.url && error.config.url.includes('/auth/login');
      if (!isLoginRoute) {
        localStorage.removeItem('univerdoc_token');
        localStorage.removeItem('univerdoc_user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;