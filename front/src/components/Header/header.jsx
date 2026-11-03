import React from 'react';
import Box from '@mui/material/Box';
import Logo from './logo';
import NavBar from './NavBar';
import styles from './Header.module.scss';
import {useLocation } from 'react-router-dom';


export default function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <Box className={`${styles.header} ${isHome ? styles.homeSticky : ''}`}>
      <Logo />
      <NavBar />
    </Box>
  );
}