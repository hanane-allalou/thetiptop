import React, { useMemo, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import styles from './ContactPage.module.scss';
import Seo from '../../seo/Seo';

const topics = ['Support', 'Partenariat', 'Presse', 'Autre'];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | ok | ko

  const emailOk = useMemo(() => /^\S+@\S+\.\S+$/.test(form.email), [form.email]);
  const isValid = useMemo(() => (
    form.name.trim().length >= 2 &&
    emailOk &&
    form.subject.trim().length >= 3 &&
    form.message.trim().length >= 10
  ), [form, emailOk]);

  const onChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!isValid) { setStatus('ko'); return; }
    setStatus('sending');
    // Front only: petite latence pour feedback
    setTimeout(() => {
      setStatus('ok');
      // option: reset message uniquement
      setForm((f) => ({ ...f, subject: '', message: '' }));
    }, 900);
  };

  // auto-hide des alertes
  useEffect(() => {
    if (status === 'ok' || status === 'ko') {
      const t = setTimeout(() => setStatus('idle'), 4000);
      return () => clearTimeout(t);
    }
  }, [status]);

  return (
    <>
      <Seo
        title="Contact — Thé Tip Top"
        description="Besoin d’aide ou d’informations ? Contactez l’équipe Thé Tip Top par email, téléphone ou via le formulaire."
        path="/contact"
        ogImage="/og-image.jpg"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact — Thé Tip Top",
            "url": "https://thetiptop.wk-dsp5-archi-o23dis-5-g4.fr/contact",
            "description": "Formulaire de contact et informations de support de Thé Tip Top."
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "The Tip Top",
            "url": "https://thetiptop.wk-dsp5-archi-o23dis-5-g4.fr/",
            "logo": "https://thetiptop.wk-dsp5-archi-o23dis-5-g4.fr/logo192.png",
            "contactPoint": [{
              "@type": "ContactPoint",
              "contactType": "customer support",
              "email": "support@tiptop.com",
              "telephone": "+33123456789",
              "areaServed": "FR",
              "availableLanguage": ["fr"]
            }]
          }
        ]}
      />
      <Box className={styles.container}>
      {/* Alerts */}
      {status === 'ok' && (
        <div className={styles.alertWrap}>
          <Alert severity="success">Merci ! Votre message a bien été envoyé.</Alert>
        </div>
      )}
      {status === 'ko' && (
        <div className={styles.alertWrap}>
          <Alert severity="error">Veuillez compléter correctement le formulaire.</Alert>
        </div>
      )}

      <Typography className={styles.title} variant="h1" component="h1">Contactez nous</Typography>

      <div className={styles.grid}>
        {/* FORMULAIRE */}
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.row}>
            <TextField
              label="Nom & prénom"
              variant="outlined"
              className={styles.field}
              value={form.name}
              onChange={onChange('name')}
              required
            />
            <TextField
              label="Adresse e-mail"
              variant="outlined"
              className={styles.field}
              value={form.email}
              onChange={onChange('email')}
              error={form.email.length > 0 && !emailOk}
              helperText={form.email.length > 0 && !emailOk ? 'Email invalide' : ' '}
              required
            />
          </div>

          <div className={styles.row}>
            <TextField
              label="Sujet"
              variant="outlined"
              className={styles.field}
              value={form.subject}
              onChange={onChange('subject')}
              required
            />
            {/* Select via TextField */}
            <TextField
              label="Motif"
              variant="outlined"
              className={styles.field}
              select
              SelectProps={{ native: true }}
              value={form.topic}
              onChange={onChange('topic')}
            >
              <option value=""></option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </TextField>
          </div>

          <TextField
            label="Votre message"
            variant="outlined"
            className={styles.textarea}
            multiline
            minRows={5}
            value={form.message}
            onChange={onChange('message')}
            required
          />

          <div className={styles.actions}>
            <Button
              type="submit"
              variant="contained"
              className={styles.sendBtn}
              disabled={status === 'sending' || !isValid}
            >
              {status === 'sending' ? 'Envoi…' : 'Envoyer'}
            </Button>
          </div>
        </form>

        {/* PANNEAU INFOS */}
        <div className={styles.infoPanel}>
          <div className={styles.infoCard}>
            <div className={styles.infoTitle}>Nous écrire</div>
            <div className={styles.infoValue}>support@tiptop.com</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoTitle}>Téléphone</div>
            <div className={styles.infoValue}>+33 1 23 45 67 89</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoTitle}>Adresse</div>
            <div className={styles.infoValue}>12 rue xxxxx, 75000 Paris</div>
          </div>
        </div>
      </div>
    </Box>
   
    </>
    
  );
}
