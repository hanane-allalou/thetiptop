// src/seo/Seo.jsx
import React, { useContext, useMemo } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useCanonical } from './useCanonical';
import { InitialDataContext } from '../ssr/InitialDataContext';

// Helpers
const absolutize = (origin, maybePath) => {
  if (!maybePath) return undefined;
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  try {
    const p = maybePath.startsWith('/') ? maybePath : `/${maybePath}`;
    return new URL(p, origin).href;
  } catch {
    return undefined;
  }
};

const absolutizeJsonLd = (origin, json) => {
  if (!json) return [];
  const arr = Array.isArray(json) ? json : [json];
  return arr.map((obj) => {
    try {
      const clone = { ...obj };
      // standard fields commonly used
      ['url', 'logo', 'image'].forEach((k) => {
        if (typeof clone[k] === 'string') {
          clone[k] = absolutize(origin, clone[k]) || clone[k];
        }
      });
      return clone;
    } catch {
      return obj;
    }
  });
};

export default function Seo({
  title,
  description,
  path,
  ogImage,
  noindex = false,
  jsonLd,
  locale = 'fr_FR',
  type = 'website',
  siteName = 'Thé Tip Top',
  twitterSite, 
}) {
  const initial = useContext(InitialDataContext) || {};
  const nonce = initial.nonce;
  const origin = initial.origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const canonical = useCanonical(path);

  const ogImageAbs = useMemo(() => absolutize(origin, ogImage), [origin, ogImage]);
  const jsonLdAbs = useMemo(() => absolutizeJsonLd(origin, jsonLd), [origin, jsonLd]);

  return (
    <Helmet prioritizeSeoTags>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}

      {canonical && <link rel="canonical" href={canonical} />}

      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={locale} />
      {siteName && <meta property="og:site_name" content={siteName} />}
      {ogImageAbs && <meta property="og:image" content={ogImageAbs} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}

      {/* JSON-LD (absolutisé) */}
      {jsonLdAbs.map((obj, i) => (
        <script key={i} type="application/ld+json" nonce={nonce}>
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}
