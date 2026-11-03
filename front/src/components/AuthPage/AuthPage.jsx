import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';

import AuthService from '../../service/authService';
import API_BASE_URL from '../../service/apiBase';
import styles from './AuthPage.module.scss';
import gift from '../../assets/gift.png';
import LoginFields from '../AuthPage/LoginFields';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Seo from '../../seo/Seo';
import { useNavigate } from 'react-router-dom';


export default function AuthPage() {
  const [openRegister, setOpenRegister] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    emailConfirm: '',
    password: '',
    passwordConfirm: '',
    gender: '',
    age: '',
    city: '',
    occupation: '',
    optInEmail: false,
  });

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const emailOk = useMemo(() => /^\S+@\S+\.\S+$/.test(form.email), [form.email]);
  const emailsMatch = useMemo(() => form.email.length > 0 && form.email === form.emailConfirm, [form.email, form.emailConfirm]);
  const passwordOk = useMemo(() => form.password.length >= 6, [form.password]);
  const passwordsMatch = useMemo(() => form.password.length > 0 && form.password === form.passwordConfirm, [form.password, form.passwordConfirm]);
  const ageOk = useMemo(() => {
    const n = Number(form.age);
    return Number.isInteger(n) && n >= 13 && n <= 120;
  }, [form.age]);

  const isValid = useMemo(
    () =>
      form.firstName.trim().length >= 2 &&
      form.lastName.trim().length >= 2 &&
      emailOk &&
      emailsMatch &&
      passwordOk &&
      passwordsMatch &&
      (form.gender === 'M' || form.gender === 'F' || form.gender === 'Other') &&
      ageOk &&
      form.city.trim().length >= 2,
    [form, emailOk, emailsMatch, passwordOk, passwordsMatch, ageOk]
  );

  const API_BASE = API_BASE_URL;
  const googleAuthUrl = `${API_BASE}/auth/google`;
  const facebookAuthUrl = `${API_BASE}/auth/facebook`;
  const navigate = useNavigate();

  const showToast = (message, severity = 'info') => setToast({ open: true, message, severity });
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      await AuthService.login(loginEmail, loginPassword);
      showToast('Connexion réussie !', 'success');
      navigate('/jeu', { replace: true });
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Erreur';
      showToast(`Erreur lors de la connexion : ${msg}`, 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const openModal = () => {
    setSubmitted(false);
    setOpenRegister(true);
  };
  const closeModal = () => setOpenRegister(false);

  const onSubmitRegister = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) return;

    try {
      setRegisterLoading(true);
      const payload = {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        gender: form.gender,
        age: parseInt(form.age, 10),
        city: form.city,
        optInEmail: form.optInEmail,
        ...(form.occupation.trim() ? { occupation: form.occupation.trim() } : {}),
      };

      const response = await AuthService.register(payload);
      console.log('Inscription réussie :', response.data);

      setOpenRegister(false);
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        emailConfirm: '',
        password: '',
        passwordConfirm: '',
        gender: '',
        age: '',
        city: '',
        occupation: '',
        optInEmail: false,
      });
      setSubmitted(false);
      showToast('Compte créé avec succès. Vous pouvez vous connecter.', 'success');
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Une erreur s'est produite pendant l'inscription.";
      showToast(msg, 'error');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <>
      <Seo
        title="Connexion — Thé Tip Top"
        description="Connectez-vous pour participer au jeu-concours Thé Tip Top."
        path="/connexion"
        robots="noindex,nofollow"
      />

<Box className={styles.wrapper}>
      <Box className={styles.content}>
        <Typography className={styles.tagline} variant="body1" component="p">
          Participez à notre jeu-concours et tentez de remporter des lots élégants !
        </Typography>
        <Typography className={styles.title} variant="h1" component="h1">
          Inscription
        </Typography>

      <Box className={styles.formGrid}>
        <Box sx={{ gridColumn: { xs: '1 / -1', md: '1 / 2' }, gridRow: { md: '1 / 3' } }}>
          <LoginFields
            email={loginEmail}
            password={loginPassword}
            onEmailChange={setLoginEmail}
            onPasswordChange={setLoginPassword}
            onSubmit={handleLogin}
            fieldClassName={styles.field}
            buttonClassName={styles.primaryButton}
            loading={loginLoading}
            withSubmit={false}
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<GoogleIcon style={{ color: '#DB4437' }} />}
          className={styles.socialButton}
          sx={{ gridColumn: { xs: '1 / -1', md: '2 / 3' }, gridRow: { md: 1 } }}
          onClick={() => (window.location.href = googleAuthUrl)}
          fullWidth
        >
          Continuer avec Google
        </Button>
        <Button
          variant="outlined"
          startIcon={<FacebookIcon style={{ color: '#1877F2' }} />}
          className={styles.socialButton}
          sx={{ gridColumn: { xs: '1 / -1', md: '2 / 3' }, gridRow: { md: 2 } }}
          onClick={() => (window.location.href = facebookAuthUrl)}
          fullWidth
        >
          Continuer avec Facebook
        </Button>
        <Button
          variant="contained"
          className={styles.primaryButton}
          sx={{ gridColumn: { xs: '1 / -1', md: '1 / 2' }, gridRow: { md: 3 } }}
          onClick={handleLogin}
          disabled={loginLoading}
          fullWidth
        >
          Continuer
        </Button>
        <Button
          variant="contained"
          className={styles.secondaryButton}
          sx={{ gridColumn: { xs: '1 / -1', md: '2 / 3' }, gridRow: { md: 3 } }}
          onClick={openModal}
          fullWidth
        >
          S’inscrire
        </Button>
    </Box>


        <Box className={styles.mobileStack}>
          <LoginFields
            email={loginEmail}
            password={loginPassword}
            onEmailChange={setLoginEmail}
            onPasswordChange={setLoginPassword}
            onSubmit={handleLogin}
            fieldClassName={styles.field}
            buttonClassName={styles.primaryButton}
            loading={loginLoading}
          />

          <Typography className={styles.orLabel}>ou</Typography>
          <Button
            variant="outlined"
            startIcon={<GoogleIcon style={{ color: '#DB4437' }} />}
            className={styles.socialButton}
            onClick={() => (window.location.href = googleAuthUrl)}
          >
            Continuer avec Google
          </Button>

          <Typography className={styles.orLabel}>ou</Typography>
          <Button
            variant="outlined"
            startIcon={<FacebookIcon style={{ color: '#1877F2' }} />}
            className={styles.socialButton}
            onClick={() => (window.location.href = facebookAuthUrl)}
          >
            Continuer avec Facebook
          </Button>

          <Typography className={styles.orLabel}>ou</Typography>
          <Button variant="contained" className={styles.secondaryButton} onClick={openModal}>
            S’inscrire
          </Button>
        </Box>
      </Box>

      <Box className={styles.bottomImagePlaceholder}>
        <img src={gift} alt="Cadeau" className={styles.gift} />
      </Box>

      <Dialog open={openRegister} onClose={closeModal} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontFamily: `'Playfair Display', serif`, fontWeight: 700 }}>Créer un compte</DialogTitle>

        <form onSubmit={onSubmitRegister} noValidate>
          <DialogContent dividers>
            {submitted && !isValid && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="error">Merci de corriger les champs en rouge.</Alert>
              </Box>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Prénom"
                value={form.firstName}
                onChange={onChange('firstName')}
                error={submitted && form.firstName.trim().length < 2}
                helperText={submitted && form.firstName.trim().length < 2 ? 'Min. 2 caractères' : ' '}
                autoFocus
              />
              <TextField
                label="Nom"
                value={form.lastName}
                onChange={onChange('lastName')}
                error={submitted && form.lastName.trim().length < 2}
                helperText={submitted && form.lastName.trim().length < 2 ? 'Min. 2 caractères' : ' '}
              />

              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={onChange('email')}
                error={submitted && !emailOk}
                helperText={submitted && !emailOk ? 'Email invalide' : ' '}
              />
              <TextField
                label="Email (confirmation)"
                type="email"
                value={form.emailConfirm}
                onChange={onChange('emailConfirm')}
                error={submitted && !emailsMatch}
                helperText={submitted && !emailsMatch ? 'Les emails ne correspondent pas' : ' '}
              />

              <TextField
                label="Mot de passe"
                type="password"
                value={form.password}
                onChange={onChange('password')}
                error={submitted && !passwordOk}
                helperText={submitted && !passwordOk ? 'Min. 6 caractères' : ' '}
              />
              <TextField
                label="Mot de passe (confirmation)"
                type="password"
                value={form.passwordConfirm}
                onChange={onChange('passwordConfirm')}
                error={submitted && !passwordsMatch}
                helperText={submitted && !passwordsMatch ? 'Les mots de passe ne correspondent pas' : ' '}
              />

              <TextField
                label="Genre"
                select
                value={form.gender}
                onChange={onChange('gender')}
                SelectProps={{ native: true }}
                helperText=" "
              >
                <option value=""></option>
                <option value="M">M</option>
                <option value="F">F</option>
                <option value="Other">Other</option>
              </TextField>

              <TextField
                label="Âge"
                type="number"
                value={form.age}
                onChange={onChange('age')}
                error={submitted && !ageOk}
                helperText={submitted && !ageOk ? 'Âge entre 13 et 120' : ' '}
                inputProps={{ min: 13, max: 120 }}
              />

              <TextField
                label="Ville"
                value={form.city}
                onChange={onChange('city')}
                error={submitted && form.city.trim().length < 2}
                helperText={submitted && form.city.trim().length < 2 ? 'Min. 2 caractères' : ' '}
                sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}
              />

              <TextField
                label="Profession (optionnel)"
                value={form.occupation}
                onChange={onChange('occupation')}
                helperText=" "
                sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}
              />
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.optInEmail}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, optInEmail: e.target.checked }))
                  }
                  name="optInEmail"
                  color="primary"
                />
              }
              label="J'accepte que mes données soient utilisées conformément à la politique de confidentialité."
              sx={{ mt: 2 }}
            />

          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={closeModal} variant="text" disabled={registerLoading}>
              Annuler
            </Button>
            <Button type="submit" variant="contained" className={styles.primaryButton} disabled={(submitted && !isValid) || registerLoading}>
              {registerLoading ? 'Création…' : 'Créer le compte'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={closeToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeToast} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
    </>
    
  );
}
