import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { CacheProvider } from '@emotion/react';
import { StyledEngineProvider } from '@mui/material/styles';
import createEmotionCache from './ssr/createEmotionCache.ts'; 
import { InitialDataContext } from './ssr/InitialDataContext';
import './index.css';
import App from './App';

const initialData = window.__INITIAL_DATA__ || {};
const container = document.getElementById('root');
if (!container) throw new Error('#root introuvable');
const emotionCache = createEmotionCache(initialData?.nonce);

const app = (
  <HelmetProvider>
    <BrowserRouter>
      <InitialDataContext.Provider value={initialData}>
        <CacheProvider value={emotionCache}>
          <StyledEngineProvider>
            <App />
          </StyledEngineProvider>
        </CacheProvider>
      </InitialDataContext.Provider>
    </BrowserRouter>
  </HelmetProvider>
);

container.hasChildNodes()
  ? hydrateRoot(container, app)
  : createRoot(container).render(app);