import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import styles from './CookieBanner.module.scss';

const LS_KEY = 'cookieConsent.v1';

function loadConsent() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { return null; }
}
function saveConsent(consent) {
  localStorage.setItem(LS_KEY, JSON.stringify({ ...consent, timestamp: Date.now() }));
  // Exemple d’intégration analytics (facultatif)
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.marketing ? 'granted' : 'denied',
    });
  }
  if (window.dataLayer) {
    window.dataLayer.push({ event: 'consent_update', consent });
  }
}

export default function CookieBanner() {
  const existing = useMemo(() => loadConsent(), []);
  const [visible, setVisible] = useState(!existing);
  const [openPrefs, setOpenPrefs] = useState(false);
  const [prefs, setPrefs] = useState(() => existing || {
    essential: true,     // toujours requis
    analytics: false,
    marketing: false,
  });

  // Permet d’ouvrir le modal depuis le footer : window.dispatchEvent(new Event('openCookiePrefs'))
  useEffect(() => {
    const h = () => { setOpenPrefs(true); setVisible(true); };
    window.addEventListener('openCookiePrefs', h);
    return () => window.removeEventListener('openCookiePrefs', h);
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    const next = { essential: true, analytics: true, marketing: true };
    setPrefs(next);
    saveConsent(next);
    setVisible(false);
  };
  const rejectAll = () => {
    const next = { essential: true, analytics: false, marketing: false };
    setPrefs(next);
    saveConsent(next);
    setVisible(false);
  };
  const savePrefs = (e) => {
    e?.preventDefault?.();
    const next = { ...prefs, essential: true };
    saveConsent(next);
    setOpenPrefs(false);
    setVisible(false);
  };

  return (
    <>
      {/* Bandeau en bas */}
      <Box className={styles.banner} role="dialog" aria-live="polite">
        <div className={styles.texts}>
          <Typography className={styles.title}>Nous respectons votre vie privée</Typography>
          <Typography className={styles.body}>
            Nous utilisons des cookies pour améliorer votre expérience, mesurer l’audience
            et personnaliser le contenu. Vous pouvez accepter, refuser ou personnaliser.
          </Typography>
          <button
            type="button"
            className={styles.manageLink}
            onClick={() => setOpenPrefs(true)}
          >
            Personnaliser
          </button>
        </div>

        <div className={styles.actions}>
          <Button onClick={rejectAll} variant="outlined" className={styles.secondaryButton}>
            Refuser tout
          </Button>
          <Button onClick={acceptAll} variant="contained" className={styles.primaryButton}>
            Accepter tout
          </Button>
        </div>
      </Box>

      {/* Modal de préférences */}
      <Dialog open={openPrefs} onClose={() => setOpenPrefs(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontFamily: `'Playfair Display', serif`, fontWeight: 700 }}>
          Préférences de cookies
        </DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 2 }}>
            Choisissez les catégories que vous souhaitez autoriser. Les cookies essentiels sont nécessaires au fonctionnement du site.
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked disabled />}
              label={<span><strong>Essentiels</strong> — toujours actifs</span>}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                />
              }
              label={<span><strong>Mesure d’audience</strong> (Analytics)</span>}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                />
              }
              label={<span><strong>Marketing</strong> (publicité/personnalisation)</span>}
            />
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenPrefs(false)} variant="text">Annuler</Button>
          <Button onClick={rejectAll} variant="outlined" className={styles.secondaryButton}>Refuser tout</Button>
          <Button onClick={savePrefs} variant="contained" className={styles.primaryButton}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
