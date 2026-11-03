import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import styles from './LegalPage.module.scss';
import Seo from '../../seo/Seo';

const description =
    "Mentions légales du site The Tip Top (projet pédagogique) : éditeur, hébergeur, propriété intellectuelle, données personnelles, cookies, responsabilité et droit applicable.";

export default function LegalPage() {
  return (
    <>
      <Seo
        title="Mentions légales — The Tip Top"
        description={description}
        path="/mentions-legales"
        ogImage="https://thetiptop.wk-dsp5-archi-o23dis-5-g4.fr/og/og-legal.jpg"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Mentions légales",
          "description": description,
          "url": "https://thetiptop.wk-dsp5-archi-o23dis-5-g4.fr/mentions-legales",
          "isPartOf": {
            "@type": "WebSite",
            "name": "The Tip Top",
            "url": "https://thetiptop.wk-dsp5-archi-o23dis-5-g4.fr/"
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://thetiptop.wk-dsp5-archi-o23dis-5-g4.fr/" },
              { "@type": "ListItem", "position": 2, "name": "Mentions légales", "item": "https://thetiptop.wk-dsp5-archi-o23dis-5-g4.fr/mentions-legales" }
            ]
          }
        }}
      />
      <Box className={styles.container}>
      <div className={styles.content}>
        <Typography component="h1" className={styles.title}>
          Mentions légales
        </Typography>

        <nav className={styles.toc}>
          <a href="#editeur">Éditeur du site</a>
          <a href="#hebergeur">Hébergeur</a>
          <a href="#pi">Propriété intellectuelle</a>
          <a href="#donnees">Données personnelles</a>
          <a href="#cookies">Cookies</a>
          <a href="#responsabilite">Responsabilité</a>
          <a href="#droit">Droit applicable</a>
          <a href="#disclaimer">Avertissement</a>
        </nav>

        <section id="editeur" className={styles.section}>
          <h2 className={styles.sectionTitle}>Éditeur du site</h2>
          <p className={styles.text}>
            Le site <strong>The Tip Top</strong> est un projet fictif réalisé
            dans le cadre d’un parcours étudiant en stratégie et transformation
            digitale. <br />
            Raison sociale : <strong>The Tip Top (Projet étudiant fictif)</strong> <br />
            Équipe projet : étudiants du groupe G4 — DSP5 Archi 023DIS <br />
            Contact : <a href="mailto:contact@thetiptop.fr">contact@thetiptop.fr</a>
          </p>
        </section>

        <section id="hebergeur" className={styles.section}>
          <h2 className={styles.sectionTitle}>Hébergeur</h2>
          <p className={styles.text}>
            Ce projet est hébergé sur un serveur pédagogique Contabo (VPS). <br />
            Adresse : Contabo GmbH, Aschauer Straße 32a, 81549 München, Allemagne.
          </p>
        </section>

        <section id="pi" className={styles.section}>
          <h2 className={styles.sectionTitle}>Propriété intellectuelle</h2>
          <p className={styles.text}>
            Tous les contenus présents sur le site <strong>The Tip Top</strong> 
            (textes, images, illustrations, éléments graphiques, code source)
            sont utilisés uniquement à des fins pédagogiques. <br />
            Toute reproduction ou réutilisation commerciale est strictement interdite.
          </p>
        </section>

        <section id="donnees" className={styles.section}>
          <h2 className={styles.sectionTitle}>Données personnelles</h2>
          <p className={styles.text}>
            Le site peut collecter certaines données fictives dans le cadre des
            démonstrations (ex. : inscriptions, participations à des concours).
            Ces données n’ont aucune valeur réelle et ne sont utilisées que dans
            un cadre technique et pédagogique. <br />
            Conformément au RGPD, aucun traitement réel ni exploitation
            commerciale n’est effectué.
          </p>
        </section>

        <section id="cookies" className={styles.section}>
          <h2 className={styles.sectionTitle}>Cookies</h2>
          <p className={styles.text}>
            Des cookies techniques peuvent être utilisés pour assurer le bon
            fonctionnement de la plateforme. Aucun cookie publicitaire ni de
            suivi commercial n’est installé.
          </p>
        </section>

        <section id="responsabilite" className={styles.section}>
          <h2 className={styles.sectionTitle}>Responsabilité</h2>
          <p className={styles.text}>
            Ce site n’ayant qu’une vocation pédagogique, l’équipe projet ne
            saurait être tenue responsable en cas d’erreurs, de bugs ou
            d’indisponibilité du service. <br />
            L’utilisation de ce site est strictement limitée au cadre du projet
            académique.
          </p>
        </section>

        <section id="droit" className={styles.section}>
          <h2 className={styles.sectionTitle}>Droit applicable</h2>
          <p className={styles.text}>
            Les présentes mentions légales sont régies par le droit français.
            En cas de litige, compétence exclusive des juridictions françaises.
          </p>
        </section>

        <section id="disclaimer" className={styles.section}>
          <h2 className={styles.sectionTitle}>Avertissement important</h2>
          <p className={styles.text}>
            <strong>
              Ce site internet est un projet étudiant fictif réalisé à des fins
              pédagogiques. Aucun achat, aucune réservation ou transaction
              réelle ne peut être effectué via cette plateforme.
            </strong>{' '}
            Toute ressemblance avec une plateforme commerciale existante serait
            purement fortuite.
          </p>
        </section>

        <p className={styles.updated}>Dernière mise à jour : 25/08/2025</p>
      </div>
    </Box>
  
    </>
    
  );
}