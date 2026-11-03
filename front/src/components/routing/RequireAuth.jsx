// components/routing/RequireAuth.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const isBrowser = typeof window !== 'undefined';
const getToken = () => {
  if (!isBrowser) return null;
  try {
    const ls = localStorage.getItem('token');
    if (ls) return ls;
    const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
};

export default function RequireAuth({ children }) {
  const location = useLocation();
  // null = on ne sait pas encore (SSR ou 1er cycle)
  const [authed, setAuthed] = useState(() => (isBrowser ? !!getToken() : null));

  useEffect(() => {
    if (isBrowser) setAuthed(!!getToken());
  }, []);

  if (authed === null) return null; 
  return authed ? <>{children}</> : <Navigate to="/connexion" replace state={{ from: location }} />;
}