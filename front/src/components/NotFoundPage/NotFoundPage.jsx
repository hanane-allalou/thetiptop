import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './NotFoundPage.module.scss';
import { Helmet } from '@dr.pogodin/react-helmet';
import Seo from '../../seo/Seo';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <>
       <Seo
        title="404 — Page introuvable | The Tip Top"
        description="La page que vous cherchez n’existe pas ou a été déplacée."
        path={pathname}
        noindex
        nofollow
      />
      <Helmet>
        <meta name="ssr:status" content="404" />
      </Helmet>
      <Box className={styles.container}>
      <div className={styles.content}>
        <Typography className={styles.code} component="div" aria-hidden>
          404
        </Typography>

        <Typography component="h1" className={styles.title}>
          Oups, page introuvable
        </Typography>

        <Typography className={styles.lead}>
          La page que vous cherchez n’existe pas ou a été déplacée.
        </Typography>

        <div className={styles.actions}>
          <Button
            variant="contained"
            className={styles.primaryButton}
            component={Link}
            to="/"
            >
            Retour à l’accueil
            </Button>

            <Button
            variant="outlined"
            className={styles.secondaryButton}
            onClick={() => navigate(-1)}
            >
            Page précédente
            </Button>
        </div>
      </div>
    </Box>
    
    </>
    
  );
}
