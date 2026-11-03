// src/seo/useCanonical.js
import React from 'react';
import { InitialDataContext } from '../ssr/InitialDataContext';

export function useOrigin() {
  const ctx = React.useContext(InitialDataContext) || {};
  const serverOrigin = ctx.origin;
  const clientOrigin =
    typeof window !== 'undefined' ? window.location.origin : '';
  return serverOrigin || clientOrigin || '';
}

export function buildCanonical(pathOrUrl, origin) {
  if (!pathOrUrl) return undefined;

  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
 
  const normalized =
    pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;

  try {
    const url = new URL(normalized, origin || undefined);
    return url.href;
  } catch {
    return undefined;
  }
}

export function useCanonical(pathOrUrl) {
  const origin = useOrigin();
  return React.useMemo(
    () => buildCanonical(pathOrUrl, origin),
    [pathOrUrl, origin]
  );
}
