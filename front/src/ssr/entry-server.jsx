// front/src/ssr/entry-server.jsx
import React from 'react';
import axios from 'axios';
import { renderToString } from 'react-dom/server';
import { StaticRouter, matchRoutes } from 'react-router';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { InitialDataContext } from './InitialDataContext';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from './createEmotionCache';
import createEmotionServer from '@emotion/server/create-instance';
import { StyledEngineProvider } from '@mui/material/styles';
import App from '../App';


const ROUTES = [
  { path: '/' },
  { path: '/home' },
  { path: '/jouer' },
  { path: '/jeu' },
  { path: '/connexion' },
  { path: '/historique' },
  { path: '/profil' },
  { path: '/contact' },
  { path: '/a-propos' },
  { path: '/mentions-legales' },
  { path: '/admin' },
  { path: '/oauth-success' },
  { path: '*' }, // catch-all => 404
];

async function fetchPrizesSSR(apiBase) {
  try {
    const { data } = await axios.get(`${apiBase}/api/prizes/public`, { timeout: 3000 });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function render(url, ctx = {}) {
  // Base API : var d'env prioritaire, sinon même origine (reverse proxy /api)
  const API_BASE = process.env.FRONT_API_BASE || ctx.origin || '';
  const prizes = API_BASE ? await fetchPrizesSSR(API_BASE) : [];

  const initialData = {
    ...ctx,
    prizes,
  };

  // Emotion (MUI) SSR
  const emotionCache = createEmotionCache(initialData && initialData.nonce);
  const { extractCriticalToChunks, constructStyleTagsFromChunks } =
    createEmotionServer(emotionCache);

  const helmetContext = {};
  const jsx = (
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <InitialDataContext.Provider value={initialData}>
          <CacheProvider value={emotionCache}>
            <StyledEngineProvider>
              <App />
            </StyledEngineProvider>
          </CacheProvider>
        </InitialDataContext.Provider>
      </StaticRouter>
    </HelmetProvider>
  );

  const appHtml = renderToString(jsx, { identifierPrefix: 'tt-' });

  // Styles critiques Emotion
  const emotionChunks = extractCriticalToChunks(appHtml);
  const emotionCss = constructStyleTagsFromChunks(emotionChunks);

  // Head Helmet
  const helmet = helmetContext.helmet || {};
  const head =
    (helmet.title && helmet.title.toString ? helmet.title.toString() : '') +
    (helmet.priority && helmet.priority.toString ? helmet.priority.toString() : '') +
    (helmet.meta && helmet.meta.toString ? helmet.meta.toString() : '') +
    (helmet.link && helmet.link.toString ? helmet.link.toString() : '') +
    (helmet.script && helmet.script.toString ? helmet.script.toString() : '');

  // JSON inline safe (évite </script>, U+2028/U+2029)
  const safeJSON = JSON.stringify(initialData)
    .replace(/</g, '\\u003c')
    .replace(/\u2028|\u2029/g, (m) => (m === '\u2028' ? '\\u2028' : '\\u2029'));
  const stateScript = `<script>window.__INITIAL_DATA__=${safeJSON}</script>`;

  // Détecte 404 via matchRoutes
  const pathname = typeof url === 'string' ? url.split('?')[0] : (url && url.pathname) || '/';
  const matches = matchRoutes(ROUTES, pathname);
  const is404 = !matches || matches[matches.length - 1]?.route?.path === '*';
  const status = is404 ? 404 : 200;

  return { appHtml, head, stateScript, emotionCss, status };
}