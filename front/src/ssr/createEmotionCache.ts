import createCache from '@emotion/cache';

export default function createEmotionCache(nonce?: string) {
  let insertionPoint: HTMLElement | undefined;
  if (typeof document !== 'undefined') {
    const el = document.querySelector<HTMLMetaElement>('meta[name="emotion-insertion-point"]');
    insertionPoint = el || undefined as any;
  }
  return createCache({
    key: 'css',
    prepend: true,            
    nonce,
    insertionPoint,           
  });
}