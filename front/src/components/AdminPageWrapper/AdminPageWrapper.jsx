// AdminPageWrapper.js
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';


const ADMIN_URL = process.env.REACT_APP_ADMIN_URL;
const isExternal = /^https?:\/\//i.test(ADMIN_URL);

function AdminPageWrapper() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setError(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {loading && !error && (
                <Box sx={{ width: '100%' }}>
          <LinearProgress sx={{ '& .MuiLinearProgress-bar': { backgroundColor: '#142C24' } }} />
        </Box>
      )}
      {error && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <p>Erreur : le panel admin ne répond pas.</p>
          <p>
            Vérifiez que le serveur est bien lancé.
          </p>
        </div>
      )}
      {!error && (
        <iframe
          src={ADMIN_URL}
          style={{
            width: '100vw',
            height: '100vh',
            border: 'none',
            overflow: 'hidden',
            display: 'block',
          }}
          title="Admin Panel"
          onLoad={() => setLoading(false)}
        />
      )}
    </div>
  );
}

export default AdminPageWrapper;