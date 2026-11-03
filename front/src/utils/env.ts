// utils/env.ts
export const isBrowser = typeof window !== 'undefined';

export const safeLocalGet = (key: string) =>
  isBrowser ? window.localStorage.getItem(key) : null;