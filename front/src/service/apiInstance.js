// client/src/service/apiInstance.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import AuthService from './authService';
import API_BASE_URL from './apiBase';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    const user = AuthService.getCurrentUser();
    
    if (user?.access_token) {
      const token = user.access_token;
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        try {
          const refreshedToken = await AuthService.refreshToken();
          user.access_token = refreshedToken;
          localStorage.setItem('user', JSON.stringify(user));
          config.headers['Authorization'] = `Bearer ${refreshedToken}`;
        } catch (err) {
          AuthService.logout();
          window.location.href = '/login';
          return Promise.reject(err);
        }
      } else {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
