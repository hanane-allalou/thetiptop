// utils/auth.js
const isBrowser =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const getToken = () => {
  if (!isBrowser) return null;
  try { return window.localStorage.getItem('token'); } catch { return null; }
};

export const setToken = (t) => {
  if (!isBrowser) return;
  try { window.localStorage.setItem('token', t); } catch {}
};

export const clearToken = () => {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
  } catch {}
};

export const isAuthenticated = () => !!getToken();