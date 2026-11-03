// src/service/authService.js
import api from './apiInstance';

const AuthService = {
  async register(data) {
    return api.post('/auth/register', data);
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    const token = data?.accessToken || data?.access_token;
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ access_token: token }));
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
    return data;
  },

  async refreshToken() {
    const { data } = await api.get('/auth/refresh');
    const token = data?.accessToken || data?.access_token;
    if (!token) throw new Error('Token non rafraîchi');

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ access_token: token }));
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return token;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common.Authorization;
  },

  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  },

  isAuthenticated() {
    const t = localStorage.getItem('token');
    if (t) return true;
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return !!u?.access_token;
    } catch {
      return false;
    }
  },

  getAuthHeader() {
    const direct = localStorage.getItem('token');
    if (direct) return { Authorization: `Bearer ${direct}` };
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return u?.access_token ? { Authorization: `Bearer ${u.access_token}` } : {};
    } catch {
      return {};
    }
  },
};

export default AuthService;
