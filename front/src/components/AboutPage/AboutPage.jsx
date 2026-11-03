import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import styles from './AboutPage.module.scss';
import Seo from '../../seo/Seo';

export default function AboutPage() {
  const description =
  "The Tip Top ouvre sa 10ᵉ boutique à Nice et remercie ses clients avec un grand jeu-concours. Maison française de thés d’exception et mélanges signatures.";


  return (
    <>
      <Seo
        title="À propos de The Tip Top — Thés d’exception & mélanges signatures"
        description={description}
        path="/a-propos"
        ogImage="https://thetiptop.wk-dsp5-archi-o23dis-5-g4.fr/og/og-about.jpg"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "À propos de The Tip Top",
          "description": description,
          "primaryImageOfPage": "https://thetiptop.wk-dsp5-archi-o23dis-5-g4.fr/og/og-about.jpg",
          "isPartOf": {
            "@type": "WebSite",
            "name": "The Tip Top",
            "url": "https://thetiptop.wk-dsp5-archi-o23dis-5-g4.fr/"
          },
          "publisher": {
            "@type": "Organization",
            "name": "The Tip Top"
          }
        }}
      />
      <Box className={styles.container}>
      <div className={styles.content}>
        <Typography component="h1" className={styles.title}>
          À propos de The Tip Top
        </Typography>

        <Typography className={styles.lead}>
          <strong>The Tip Top</strong> est une maison française spécialisée dans la 
          promotion de thés d’exception et de mélanges signatures.  
          Notre ambition : partager avec vous des créations uniques, mêlant tradition, 
          innovation et savoir-faire artisanal.
        </Typography>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Notre mission</h2>
            <p className={styles.cardText}>
              Proposer aux amateurs de thé des produits de grande qualité, issus de recettes originales :
              thés blancs, thés verts, thés détox, infusions et créations exclusives.  
              L’ensemble de nos thés est conditionné avec soin, dans des coffrets élégants et durables.
            </p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Notre jeu-concours</h2>
            <p className={styles.cardText}>
              À l’occasion de l’ouverture de notre 10ᵉ boutique à Nice, The Tip Top a souhaité 
              remercier et fidéliser ses clients à travers un <strong>grand jeu-concours</strong>.  
              Pour chaque achat supérieur à 49€, un ticket de caisse unique est remis au client, 
              contenant un code permettant de participer en ligne et de découvrir immédiatement son gain.  
              100% des tickets sont gagnants, avec des cadeaux allant d’un infuseur à thé à un coffret découverte premium.
            </p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Des lots exclusifs</h2>
            <ul className={styles.list}>
              <li>🎁 Infuseurs à thé (60% des tickets)</li>
              <li>🎁 Boîtes de 100g de nos thés signatures ou détox (35% des tickets)</li>
              <li>🎁 Coffrets découverte d’une valeur de 39€, 69€ ou 100€ (8% des tickets)</li>
              <li>🏆 Tirage final : un an de thé offert (valeur 360€)</li>
            </ul>
          </section>
        </div>

        <section className={styles.block}>
          <h2 className={styles.cardTitle}>Nos valeurs</h2>
          <p className={styles.cardText}>
            Chez <strong>The Tip Top</strong>, nous croyons en :  
            🌱 <em>La qualité</em> — Une sélection rigoureuse des meilleurs ingrédients.  
            ♻️ <em>La durabilité</em> — Des emballages respectueux de l’environnement.  
            💝 <em>La proximité</em> — Récompenser la fidélité de nos clients avec des expériences uniques.  
            🎉 <em>Le partage</em> — Faire de chaque tasse de thé un moment de plaisir et de convivialité.
          </p>
        </section>
      </div>
    </Box>
    </>
    
  );
}