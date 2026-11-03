import { Routes, Route, Navigate, useLocation } from 'react-router';
import Box from '@mui/material/Box';

import Header from './components/Header/header';
import PlayPage from './components/PlayPage/PlayPage';
import AuthPage from './components/AuthPage/AuthPage';
import OauthSuccess from './components/OauthSuccess/OauthSuccess';
import HistoryPage from './components/HistoryPage/HistoryPage';
import ProfilePage from './components/ProfilePage/ProfilePage';
import Footer from './components/Footer/Footer';
import ContactPage from './components/ContactPage/ContactPage';
import AboutPage from './components/AboutPage/AboutPage';
import LegalPage from './components/LegalPage/LegalPage';
import RequireAuth from './components/routing/RequireAuth';
import GuestOnly from './components/routing/GuestOnly';
import HomePage from './components/homePage/index.tsx';
import AdminPageWrapper from './components/AdminPageWrapper/AdminPageWrapper';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';
import { Helmet } from '@dr.pogodin/react-helmet'; 
import CookieBanner from './components/CookieBanner/CookieBanner';

function StandaloneAdminLayout() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <AdminPageWrapper />
    </div>
  );
}

function AppShell() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <>
    <Helmet htmlAttributes={{ lang: 'fr' }}>
        <meta name="robots" content="index,follow" />
      </Helmet>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: isHome ? '#fff' : '#FEF7EB',
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/jouer" element={<Navigate to="/jeu" replace />} />

          <Route
            path="/jeu"
            element={
              <RequireAuth>
                <PlayPage />
              </RequireAuth>
            }
          />

          <Route
            path="/connexion"
            element={
              <GuestOnly redirectTo="/jeu">
                <AuthPage />
              </GuestOnly>
            }
          />
          <Route
            path="/historique"
            element={
              <RequireAuth>
                <HistoryPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profil"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/mentions-legales" element={<LegalPage />} />
          <Route path="/admin" element={<StandaloneAdminLayout />} />
          <Route path="/oauth-success" element={<OauthSuccess />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Box>
            <CookieBanner /> 
      <Footer />
    </Box>
    </>
   
  );
}

export default function App() {
  return <AppShell />;
}
