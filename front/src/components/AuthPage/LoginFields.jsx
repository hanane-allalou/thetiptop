import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export default function LoginFields({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  fieldClassName,
  buttonClassName,
  loading,
  withSubmit = true,  
}) {
  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <TextField
        label="E-mail"
        variant="outlined"
        className={fieldClassName}
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        autoComplete="email"
        fullWidth
        margin="none"
        sx={{ mb: { md: 4, xs: 2 } }}
        required
      />
      <TextField
        label="Mot de passe"
        type="password"
        variant="outlined"
        className={fieldClassName}
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        autoComplete="current-password"
        fullWidth
        margin="normal"
        required
      />
      {withSubmit && (
        <Button
          type="submit"
          variant="contained"
          className={buttonClassName}
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : null}
        >
          {loading ? 'Connexion…' : 'Continuer'}
        </Button>
      )}
    </Box>
  );
}
