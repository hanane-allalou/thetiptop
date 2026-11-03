import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OauthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    let token = qs.get('accessToken') || qs.get('token');
    if (!token && window.location.hash) {
      const hp = new URLSearchParams(window.location.hash.slice(1));
      token = hp.get('accessToken') || hp.get('token');
    }

    if (token) {
      // IMPORTANT : on sauve sous les deux clés
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ access_token: token }));

      const redirect =
        sessionStorage.getItem('postLoginRedirect') ||
        location.state?.from?.pathname ||
        '/jeu';
      sessionStorage.removeItem('postLoginRedirect');

      navigate(redirect, { replace: true });
    } else {
      navigate('/connexion', { replace: true });
    }
  }, [navigate, location]);

  return <p>Connexion en cours...</p>;
}
