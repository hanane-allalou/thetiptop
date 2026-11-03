import React from 'react';
import Box from '@mui/material/Box';

import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import styles from './Footer.module.scss';

const SOCIALS = {
  facebook: 'https://facebook.com',   
  instagram: 'https://instagram.com/thee_tip_top', 
  twitter: 'https://x.com',           
};

export default function Footer() {
  return (
    <Box className={styles.footer}>
      <Box className={styles.topBorder} />
      <Box className={styles.content}>
        <Box className={styles.socials}>
          <a
            href={SOCIALS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className={styles.socialLink}
          >
            <FaFacebookF />
          </a>
            
        <a
            href={SOCIALS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter/X"
            className={styles.socialLink}
        >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              className={`${styles.iconSvg} iconSvg-global`}
            >
             <path
             fill="currentColor"
             d="M20.59 3H17.4L12 10.12 6.6 3H3l7.8 10.44L3 21h3.19l5.61-7.5L17.4 21H21l-8.1-10.8L20.59 3z"
           />
          </svg>
        </a>

          <a
            href={SOCIALS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={styles.socialLink}
          >
            <FaInstagram />
          </a>
         
        </Box>

        <Box className={styles.links}>
          <Link to="/contact" className={styles.link}>Contact</Link>
          <Link to="/mentions-legales" className={styles.link}>Mentions légales</Link>
          <Link to="/a-propos" className={styles.link}>À propos</Link>
        </Box>
      </Box>
    </Box>
  );
}
