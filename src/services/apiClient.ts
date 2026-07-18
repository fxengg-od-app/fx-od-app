// ============================================================
//  src/services/apiClient.ts
//  Axios HTTP client with JWT auth interceptors.
//  When VITE_APP_MODE=live, every service call goes here.
// ============================================================

import axios from 'axios';
import { config } from '../config';

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ── Request interceptor: attach JWT Bearer token ─────────────
apiClient.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: global 401 handler ────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
