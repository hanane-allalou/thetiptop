import React from 'react';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import styles from './Logo.module.scss';

export default function Logo() {
  const src = '/logo192.png';
  return (
    
    <Link to="/" className={styles.logoLink} aria-label="Aller à l’accueil">
      <Box className={styles.logoWrapper} sx={{ cursor: 'pointer' }}>
        <img 
        src={src} 
        alt="Thé Tip Top"
        width="70"
        height="70"
        decoding="async"
        className={`${styles.logo} logo-global`} />
      </Box>
    </Link>
  );
}
