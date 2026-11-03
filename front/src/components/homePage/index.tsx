// front/src/components/homePage/index.tsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Gift, Trophy, Sparkles, Users, Calendar, MapPin } from 'lucide-react';
import { PrizeCard } from './PrizeCard.tsx';
import { CountdownTimer } from './CountdownTimer.tsx';
import './index.scss';
import Seo from '../../seo/Seo.jsx';

import PrizeService from '../../service/prizeService';
import { useNavigate } from 'react-router-dom';
import { InitialDataContext } from '../../ssr/InitialDataContext';

type UiPrize = {
  name: string;
  percentage?: string;
  image: string;
  description?: string;
  value?: string;
};

// Helpers
function computeImage(src?: string): string {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/')) return src;
  // Par défaut, nos assets sont dans /lots/
  return `/lots/${src}`;
}

function normalizePrize(p: any): UiPrize {
  const pctRaw = p?.percentage ?? p?.winRate ?? p?.odds;
  const percentage =
    typeof pctRaw === 'number'
      ? `${Math.round(pctRaw)}%`
      : (typeof pctRaw === 'string' ? pctRaw : undefined);

  const img = p?.imageUrl || p?.image;

  return {
    name: String(p?.name ?? p?.title ?? 'Lot'),
    percentage,
    image: computeImage(img),
    description: p?.description || undefined,
    value:
      typeof p?.value === 'number'
        ? `${p.value}€`
        : (p?.value || undefined),
  };
}

function normalizePrizes(list: any[]): UiPrize[] {
  return (Array.isArray(list) ? list : []).map(normalizePrize);
}

const Index: React.FC = () => {
  const navigate = useNavigate();

  // Prises injectées par le SSR (entry-server) via window.__INITIAL_DATA__
  const initialData = useContext(InitialDataContext) as any;
  const ssrPrizes = useMemo<UiPrize[]>(
    () => normalizePrizes(initialData?.prizes || []),
    [initialData]
  );

  // État local hydraté depuis le SSR (évite tout mismatch)
  const [prizes, setPrizes] = useState<UiPrize[]>(ssrPrizes);

  // Si le SSR n'a pas fourni de données (ou vide), on fetch côté client
  useEffect(() => {
    let mounted = true;
    if (ssrPrizes.length > 0) return;

    (async () => {
      try {
        const res = await PrizeService.getPublicPrize();
        const normalized = normalizePrizes(res?.data);
        if (mounted) setPrizes(normalized);
      } catch (e) {
        console.error('Erreur lors du chargement des lots :', e);
        if (mounted) setPrizes([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [ssrPrizes.length]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Seo
        title="Gagnez 1 an de thé avec Thé Tip Top — Jeu-concours officiel"
        description="Jeu-concours à Nice : 100% des tickets gagnants. En boutique, recevez un code, jouez en ligne et découvrez nos thés d’exception. Tirage final : 1 an de thé (360 €). Offre valable jusqu’au 30 septembre 2025."
        path="/"
        ogImage="/og-image.jpg"
        jsonLd={[
          { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Thé Tip Top — Jeu-concours', url: '/' },
          { '@context': 'https://schema.org', '@type': 'Organization', name: 'The Tip Top', url: '/', logo: '/logo192.png' }
        ]}
        siteName="Thé Tip Top"
        twitterSite="@thetiptop"
      />

      <main className="home-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-fx" aria-hidden="true">
            <span className="star s1">✨</span>
            <span className="star s2">🎁</span>
            <span className="star s3">🌿</span>
            <span className="gift g1">🎁</span>
            <span className="spark sp1">✨</span>
          </div>
          <div className="container">
            <div className="hero-content">
              <div className="fade-in-up">
                <div className="hero-badge">
                  <Sparkles size={18} />
                  Nouvelle boutique à Nice
                </div>

                <h1 className="hero-title">
                  <span className="gradient-primary">Gagnez</span>{' '}
                  <span className="gradient-gold">1 an de thé</span>
                  <br />
                  avec Thé Tip Top
                </h1>

                <p className="hero-description">
                  Pour célébrer l'ouverture de notre 10ème boutique à Nice,
                  participez à notre grand jeu-concours ! <strong>100% des tickets sont gagnants </strong>
                  et tentez de remporter un an de thé d'une valeur de 360€.
                </p>

                <div className="hero-actions">
                  <button className="btn btn-primary btn-lg scale-in" onClick={() => navigate('/jeu')}>
                    <Gift size={20} style={{ marginRight: 8 }} />
                    Participer au jeu
                  </button>
                  <button
                    className="btn btn-outline btn-lg"
                    onClick={() => scrollToSection('concours')}
                  >
                    Découvrir les règles
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="stats">
          <div className="stats-section">
            {[
              { icon: Trophy, title: '100% Gagnant', desc: 'Tous les tickets sont gagnants' },
              { icon: Users, title: '500 000 tickets', desc: 'Disponibles pendant 30 jours' },
              { icon: Gift, title: '5 types de lots', desc: "De l'infuseur au coffret premium" }
            ].map((item, index) => (
              <div key={index} className="stat-card">
                <item.icon className="stat-icon" size={48} />
                <h3 className="stat-title">{item.title}</h3>
                <p className="stat-description">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About Contest Section */}
        <section id="concours" className="section section-alt">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                <span className="gradient-primary">Comment</span> participer ?
              </h2>
              <p className="section-subtitle">
                C'est simple et rapide ! Suivez ces étapes pour tenter votre chance.
              </p>
            </div>

            <div className="steps-section">
              <div className="steps-grid">
                {[
                  {
                    step: '1',
                    title: 'Achetez pour 49€ minimum',
                    desc: "Rendez-vous dans l'une de nos boutiques et effectuez un achat d'au moins 49€.",
                    gradient: 'green-gradient'
                  },
                  {
                    step: '2',
                    title: 'Récupérez votre code',
                    desc: 'Votre ticket de caisse contient un code unique de 10 caractères (lettres et chiffres).',
                    gradient: 'gold-gradient'
                  },
                  {
                    step: '3',
                    title: 'Jouez en ligne',
                    desc: 'Saisissez votre code sur notre site et découvrez instantanément votre lot !',
                    gradient: 'green-gradient'
                  }
                ].map((item, index) => (
                  <div key={index} className="step-item">
                    <div className={`step-number ${item.gradient}`}>{item.step}</div>
                    <h3 className="step-title">{item.title}</h3>
                    <p className="step-description">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="btn btn-secondary btn-lg" onClick={() => navigate('/jeu')}>
                  <Sparkles size={20} style={{ marginRight: 8 }} />
                  Je veux jouer maintenant
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Prizes Section */}
        <section id="lots" className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                <span className="gradient-gold">Lots</span> à gagner
              </h2>
              <p className="section-subtitle">
                Découvrez nos magnifiques lots, de l'infuseur premium aux coffrets découverte exclusifs.
              </p>
            </div>

            <div className="prizes-grid">
              {prizes.map((prize, index) => (
                <PrizeCard key={index} {...prize} />
              ))}
            </div>

            <div className="grand-prize-card">
              <div className="grand-prize-header">
                <Trophy className="trophy-icon" size={48} />
                <h3 className="grand-prize-title">Prix Exceptionnel</h3>
              </div>
              <h4 className="prize-name">1 an de thé offert</h4>
              <p className="prize-value">Valeur 360€ • Tirage au sort final</p>
              <p className="prize-description">
                Chaque participation au jeu-concours vous inscrit automatiquement au tirage final !
              </p>
            </div>
          </div>
        </section>

        {/* Rules Section */}
        <section id="reglement" className="section section-alt">
          <div className="container" style={{ maxWidth: 800 }}>
            <div className="section-header">
              <h2 className="section-title">
                <span className="gradient-primary">Règlement</span> du jeu
              </h2>
            </div>

            <div className="rules-card">
              <div className="rules-header">
                <Calendar className="calendar-icon" size={28} />
                <h3 className="rules-title">Période et conditions</h3>
              </div>

              <div className="rules-grid">
                {[
                  {
                    icon: '📅',
                    title: 'Durée du concours',
                    items: ['30 jours de jeu-concours', '+ 30 jours pour réclamer les lots', '500 000 tickets maximum']
                  },
                  {
                    icon: '🎯',
                    title: 'Conditions',
                    items: ['Achat minimum de 49€', 'Code unique de 10 caractères', '100% des tickets gagnants']
                  },
                  {
                    icon: '🏪',
                    title: 'Retrait des lots',
                    items: ['En boutique avec nom/prénom', 'Présentation du code gagnant']
                  },
                  {
                    icon: '🏆',
                    title: 'Grand tirage',
                    items: ["1 an de thé (360€)", "Tirage sous contrôle d'huissier", 'Tous les participants éligibles']
                  }
                ].map((section, index) => (
                  <div key={index} className="rule-section">
                    <div className="rule-header">
                      <span className="rule-emoji">{section.icon}</span>
                      <h4 className="rule-title">{section.title}</h4>
                    </div>
                    <ul className="rule-list">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="rule-item">
                          <span className="bullet" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #ddd' }} />

              <div className="nice-info">
                <div className="nice-header">
                  <MapPin className="map-icon" size={24} />
                  <div className="nice-content">
                    <h4 className="nice-title">Nouvelle boutique Nice</h4>
                    <p className="nice-description">
                      Ce jeu-concours célèbre l'ouverture de notre 10ème boutique à Nice.
                      Venez découvrir notre nouvelle adresse et profitez de nos thés d'exception !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Countdown Section */}
        <section className="section">
          <div className="container" style={{ maxWidth: 1200 }}>
            <div className="section-header">
              <h2 className="section-title">
                <span className="gradient-gold">Temps</span> restant
              </h2>
              <p className="section-subtitle">
                Plus que quelques jours pour participer au grand jeu-concours !
              </p>
            </div>
            <CountdownTimer onPlayNow={() => navigate('/jeu')} />
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section section">
          <div className="container" style={{ maxWidth: 800 }}>
            <h2 className="cta-title">Prêt à tenter votre chance ?</h2>
            <p className="cta-description">
              Ne manquez pas cette opportunité unique de gagner de magnifiques lots
              et peut-être même 1 an de thé offert !
            </p>
            <div className="cta-actions">
              <button className="btn btn-white btn-lg" onClick={() => navigate('/jeu')}>
                <Gift size={20} style={{ marginRight: 8 }} />
                Commencer à jouer
              </button>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-logo" />
          </div>
        </footer>
      </main>
    </>
  );
};

export default Index;