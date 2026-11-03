import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { useNavigate } from 'react-router-dom';

import UserService from '../../service/userService';
import styles from './ProfilePage.module.scss';
import fallbackAvatar from '../../assets/avatar.jpg';

export default function ProfilePage() {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    age: '',
    city: ''
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const genres = [
    { value: '', label: '—' },
    { value: 'M', label: 'Homme' },
    { value: 'F', label: 'Femme' },
    { value: 'Other', label: 'Autre' },
  ];

  // Charger le profil
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await UserService.getProfile();
        if (mounted) {
          setMe(data);
          setFormData({
            name: data.name ?? '',
            email: data.email ?? '',
            gender: data.gender ?? '',
            age: data.age ?? '',
            city: data.city ?? ''
          });
        }
      } catch (e) {
        if (mounted) setError("Impossible de charger le profil.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleChangePassword = () => {
    setToast("Un lien pour modifier votre mot de passe vous sera envoyé.");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocusField = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    if (!me) return;
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        age: formData.age !== '' ? Number(formData.age) : null
      };
      await UserService.updateProfile(me.id, payload);
      setToast('Profil mis à jour avec succès ✅');
      setMe((prev) => ({ ...prev, ...payload }));
      setEditing(false);
    } catch (err) {
      console.error(err);
      setToast('Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!me) return;
    try {
      await UserService.deleteAccount(me.id);
      localStorage.removeItem('token');
      navigate('/connexion');
    } catch (err) {
      console.error(err);
      setToast('Erreur lors de la suppression du compte');
    } finally {
      setOpenDelete(false);
    }
  };

  if (loading) {
    return (
      <Box className={`${styles.container} ${styles.compactTop}`}>
        <LinearProgress style={{ width: '100%' }} />
      </Box>
    );
  }

  if (error || !me) {
    return (
      <Box className={`${styles.container} ${styles.compactTop}`}>
        <Typography color="error">{error || "Profil introuvable."}</Typography>
      </Box>
    );
  }

  const avatarSrc = me.avatar || fallbackAvatar;
  const isFormSignUp = (me.registrationMethod || '').toLowerCase() === 'formulaire';

  return (
    <Box className={`${styles.container} ${styles.compactTop}`}>
      {toast && (
        <div className={`${styles.toast} ${styles.toastInfo}`}>
          {toast}
        </div>
      )}

      {/* Photo de profil */}
      <Box className={styles.avatarWrapper} aria-label="Photo de profil">
        <img src={avatarSrc} alt="Avatar" className={styles.avatar} />
      </Box>

      {/* Nom */}
      <Box className={styles.fieldWrapper}>
        <TextField
          label="Nom"
          variant="outlined"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onFocus={handleFocusField}
          className={styles.field}
          size="small"
        />
      </Box>

      {/* Email */}
      <Box className={styles.fieldWrapper}>
        <TextField
          label="Adresse e-mail"
          variant="outlined"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onFocus={handleFocusField}
          className={styles.field}
          size="small"
        />
      </Box>

      {/* Méthode d'inscription */}
      <Box className={styles.fieldWrapper}>
        <TextField
          label="Méthode d’inscription"
          variant="outlined"
          value={me.registrationMethod || '—'}
          className={styles.field}
          size="small"
          InputProps={{ readOnly: true }}
        />
      </Box>

      {/* Mot de passe */}
      {isFormSignUp && (
        <Box className={styles.fieldWrapper}>
          <TextField
            label="Mot de passe"
            variant="outlined"
            type="password"
            value="********"
            className={styles.field}
            size="small"
            InputProps={{ readOnly: true }}
          />
          <Typography
            role="button"
            tabIndex={0}
            className={styles.link}
            onClick={handleChangePassword}
            onKeyDown={(e) => (e.key === 'Enter' ? handleChangePassword() : null)}
          >
            Modifier le mot de passe
          </Typography>
        </Box>
      )}

      {/* Genre sous forme de menu déroulant */}
      <Box className={styles.fieldWrapper}>
        <TextField
          select
          label="Genre"
          variant="outlined"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          onFocus={handleFocusField}
          className={styles.field}
          size="small"
        >
          {genres.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Âge */}
      <Box className={styles.fieldWrapper}>
        <TextField
          label="Âge"
          variant="outlined"
          name="age"
          value={formData.age}
          onChange={handleChange}
          onFocus={handleFocusField}
          className={styles.field}
          size="small"
        />
      </Box>

      {/* Ville */}
      <Box className={styles.fieldWrapper}>
        <TextField
          label="Ville"
          variant="outlined"
          name="city"
          value={formData.city}
          onChange={handleChange}
          onFocus={handleFocusField}
          className={styles.field}
          size="small"
        />
      </Box>

      {/* Boutons */}
      <Box className={styles.buttonsWrapper}>
        {editing && (
          <Button
            variant="contained"
            onClick={handleSave}
            className={styles.myButton}
            disabled={isSaving}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        )}

        <Button
          variant="contained"
          className={styles.myButton}
          onClick={() => navigate('/historique')}
        >
          Mon historique
        </Button>

        <Button
          variant="contained"
          onClick={() => setOpenDelete(true)}
          className={styles.deleteButton}
        >
          Supprimer mon compte
        </Button>
      </Box>

      {/* Dialog de confirmation suppression */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
      >
        <DialogTitle>Supprimer mon compte</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Annuler</Button>
          <Button onClick={handleDeleteAccount} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
