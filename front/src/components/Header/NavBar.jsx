// front/src/components/navbar/NavBar.jsx
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Gift } from 'lucide-react';
import AuthService from '../../service/authService';
import styles from './NavBar.module.scss';

function readRoleFromToken() {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = jwtDecode(token);
    return (
      decoded?.role ??
      decoded?.user?.role ??
      decoded?.payload?.role ??
      decoded?.['https://thetiptop.app/role'] ??
      null
    );
  } catch {
    return null;
  }
}

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(() => readRoleFromToken());
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isHome = pathname === '/';
  const isAdmin = role === 'admin' || role === 'employee';

  const handleLogout = () => {
    AuthService.logout();
    window.dispatchEvent(new Event('auth:changed'));
    navigate('/connexion');
  };

  const toggleDrawer = () => setOpen((p) => !p);

  const linkClass = ({ isActive }) =>
    isActive ? `${styles.navItem} ${styles.active}` : styles.navItem;

  useLayoutEffect(() => {
    setRole(readRoleFromToken());
  }, []);

  useEffect(() => {
    setRole(readRoleFromToken());
  }, [pathname]);

  useEffect(() => {
    const onAuthChanged = () => setRole(readRoleFromToken());
    const onStorage = (e) => {
      if (e.key === 'token') setRole(readRoleFromToken());
    };
    window.addEventListener('auth:changed', onAuthChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('auth:changed', onAuthChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const LINKS = useMemo(
    () => [
      { label: 'Historique de gain', to: '/historique' },
      { label: 'Profil', to: '/profil' },
      ...(isAdmin ? [{ label: 'Dashboard admin', to: '/admin' }] : []),
    ],
    [isAdmin]
  );

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Box className={`${styles.nav} ${isHome ? styles.homeSticky : ''}`}>
        {isHome ? (
          <Box className={`${styles.navItems} ${styles.hideOnMobile}`}>
            <Typography component="div">
              <a
                href="#concours"
                className={styles.navItem}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('concours');
                }}
              >
                Concours
              </a>
            </Typography>
            <Typography component="div">
              <a
                href="#lots"
                className={styles.navItem}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('lots');
                }}
              >
                Lots à Gagner
              </a>
            </Typography>
            <Typography component="div">
              <a
                href="#reglement"
                className={styles.navItem}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('reglement');
                }}
              >
                Règlement
              </a>
            </Typography>
            <Typography component="div">
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => navigate('/jeu')}
                aria-label="Jouer"
              >
                <Gift size={16} style={{ marginRight: 8 }} />
                Jouer
              </button>
            </Typography>
          </Box>
        ) : (
          <Box className={`${styles.navItems} ${styles.hideOnMobile}`}>
            {LINKS.map((l) => (
              <Typography key={l.to} component="div">
                <NavLink to={l.to} className={linkClass}>
                  {l.label}
                </NavLink>
              </Typography>
            ))}
            {role && (
              <Typography component="div" className={styles.navItem}>
                <span onClick={handleLogout} style={{ cursor: 'pointer' }}>
                  Déconnexion
                </span>
              </Typography>
            )}
          </Box>
        )}

        <IconButton
          className={styles.burger}
          onClick={toggleDrawer}
          aria-label="Ouvrir le menu"
          size="large"
        >
          <MenuIcon />
        </IconButton>
      </Box>

      <Drawer anchor="right" open={open} onClose={toggleDrawer}>
        <Box className={styles.drawer} role="presentation">
          {isHome ? (
            <>
              <Typography className={styles.drawerItem}>
                <a
                  href="#concours"
                  className={styles.navItem}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('concours');
                    setOpen(false);
                  }}
                >
                  Le Concours
                </a>
              </Typography>
              <Typography className={styles.drawerItem}>
                <a
                  href="#lots"
                  className={styles.navItem}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('lots');
                    setOpen(false);
                  }}
                >
                  Lots à Gagner
                </a>
              </Typography>
              <Typography className={styles.drawerItem}>
                <a
                  href="#reglement"
                  className={styles.navItem}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('reglement');
                    setOpen(false);
                  }}
                >
                  Règlement
                </a>
              </Typography>
              <Typography className={styles.drawerItem} style={{ marginTop: '0.5rem' }}>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => {
                    navigate('/jeu');
                    setOpen(false);
                  }}
                >
                  <Gift size={16} style={{ marginRight: 8 }} />
                  Jouer
                </button>
              </Typography>
              {LINKS.map((l) => (
                <Typography key={`drawer-home-${l.to}`} className={styles.drawerItem}>
                  <NavLink to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                    {l.label}
                  </NavLink>
                </Typography>
              ))}
              {role && (
                <Typography className={styles.drawerItem}>
                  <span
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    Déconnexion
                  </span>
                </Typography>
              )}
            </>
          ) : (
            <>
              {LINKS.map((l) => (
                <Typography key={l.to} className={styles.drawerItem}>
                  <NavLink to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                    {l.label}
                  </NavLink>
                </Typography>
              ))}
              {role && (
                <Typography className={styles.drawerItem}>
                  <span
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    Déconnexion
                  </span>
                </Typography>
              )}
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}