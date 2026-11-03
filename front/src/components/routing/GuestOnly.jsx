// GuestOnly.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const isBrowser = typeof window !== 'undefined';

const safeGetToken = () => {
  if (!isBrowser) return null;
  try {
    const ls = window.localStorage.getItem('token');
    if (ls) return ls;
    const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
};

export default function GuestOnly({ children, redirectTo = '/' }) {
  const [ready, setReady] = useState(isBrowser);
  const [authed, setAuthed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setReady(true);
    setAuthed(!!safeGetToken());
  }, []);

  if (!ready) return null;

  // Si déjà authentifié, on le redirige (ex: loin de /connexion) 
  return authed ? (
    <Navigate to={redirectTo} replace state={{ from: location }} />
  ) : (
    <>{children}</>
  );
}