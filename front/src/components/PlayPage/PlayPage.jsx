import React, { useEffect, useRef, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { Card, CardContent, CardHeader } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './PlayPage.module.scss';
import PrizeService from '../../service/prizeService';
import ParticipationService from '../../service/participationService';
import gift from '../../assets/gift.png';
import { Helmet } from '@dr.pogodin/react-helmet';
import { PrizeCard } from '../homePage/PrizeCard.tsx';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

/* Hook compte à rebours */
function useCountdown(targetDate, totalDays) {
  const calc = useCallback(() => {
    const now = Date.now();
    const distance = Math.max(0, targetDate.getTime() - now);
    const days = Math.floor(distance / MS_IN_DAY);
    const hours = Math.floor((distance % MS_IN_DAY) / (60 * 60 * 1000));
    const minutes = Math.floor((distance % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((distance % (60 * 1000)) / 1000);

    const elapsedDays = Math.max(0, totalDays - distance / MS_IN_DAY);
    const clampedElapsed = Math.min(totalDays, Math.max(0, elapsedDays));
    const progress = (clampedElapsed / totalDays) * 100;

    return { distance, days, hours, minutes, seconds, progress };
  }, [targetDate, totalDays]);

  const [state, setState] = useState(calc);

  useEffect(() => {
    const timer = setInterval(() => setState(calc()), 1000);
    return () => clearInterval(timer);
  }, [calc]);

  return state;
}

export default function PlayPage() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketCode, setTicketCode] = useState('');
  const [participationResult, setParticipationResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);



  // Refs pour l'accessibilité et la navigation
  const rulesRef = useRef(null);
  const prizesRef = useRef(null);
  const countdownRef = useRef(null);
  const heroFormRef = useRef(null);

  // Fonction de scroll améliorée pour l'accessibilité
  const scrollTo = useCallback((refOrId) => {
    let targetElement = null;
    
    if (typeof refOrId === 'string') {
      targetElement = document.getElementById(refOrId);
    } else if (refOrId?.current) {
      targetElement = refOrId.current;
    }
    
    if (targetElement) {
      // Amélioration pour l'accessibilité : focus sur l'élément après le scroll
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Petite pause avant de définir le focus pour permettre au scroll de se terminer
      setTimeout(() => {
        if (targetElement.setAttribute) {
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus();
        }
      }, 500);
    }
  }, []);

  // Compte à rebours : 30 jours depuis le premier chargement
  const CONTEST_TOTAL_DAYS = 30;
  const [contestEnd] = useState(() => {
    const key = 'contestStartISO';
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(key);
        let start;
        if (stored) {
          start = new Date(stored);
        } else {
          start = new Date();
          localStorage.setItem(key, start.toISOString());
        }
        return new Date(start.getTime() + CONTEST_TOTAL_DAYS * MS_IN_DAY);
      } catch (e) {
        console.warn('LocalStorage non disponible, utilisation de la date actuelle');
        const start = new Date();
        return new Date(start.getTime() + CONTEST_TOTAL_DAYS * MS_IN_DAY);
      }
    }
    const start = new Date();
    return new Date(start.getTime() + CONTEST_TOTAL_DAYS * MS_IN_DAY);
  });

  const countdown = useCountdown(contestEnd, CONTEST_TOTAL_DAYS);
  const isOver = countdown.distance === 0;

  // Chargement des lots avec gestion d'erreur améliorée
  useEffect(() => {
    const loadRewards = async () => {
      try {
        const res = await PrizeService.getPrize();
        setRewards(res.data || []);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des lots:', err);
        setError("Impossible de charger les lots. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    loadRewards();
  }, []);

   

  // Participation avec validation améliorée
  const handlePlay = useCallback(async () => {
    const trimmedCode = ticketCode.trim();
    if (!trimmedCode) {
      setError("Veuillez entrer un numéro de ticket valide.");
      heroFormRef.current?.querySelector('input')?.focus();
      return;
    }

    // Validation du format (10 caractères alphanumériques)
    if (!/^[A-Za-z0-9]{10}$/.test(trimmedCode)) {
      setError("Le numéro de ticket doit contenir exactement 10 caractères (lettres et chiffres uniquement).");
      heroFormRef.current?.querySelector('input')?.focus();
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await ParticipationService.createParticipation(trimmedCode);
      setParticipationResult(res.data);
      setTicketCode('');
      
      // Annonce pour les lecteurs d'écran
      const announcement = "Participation enregistrée avec succès ! Votre résultat s'affiche.";
      const ariaLive = document.createElement('div');
      ariaLive.setAttribute('aria-live', 'assertive');
      ariaLive.setAttribute('aria-atomic', 'true');
      ariaLive.className = 'sr-only';
      ariaLive.textContent = announcement;
      document.body.appendChild(ariaLive);
      setTimeout(() => document.body.removeChild(ariaLive), 2000);
      
    } catch (err) {
      console.error('Erreur participation:', err);
      setError(err.response?.data?.message || "Une erreur est survenue lors de la participation. Veuillez réessayer.");
      heroFormRef.current?.querySelector('input')?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }, [ticketCode]);

  const handleCloseModal = useCallback(() => {
    setParticipationResult(null);
    // Remettre le focus sur le champ de saisie après fermeture
    setTimeout(() => {
      heroFormRef.current?.querySelector('input')?.focus();
    }, 100);
  }, []);

  // Gestion des touches pour la modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (participationResult && e.key === 'Escape') {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [participationResult, handleCloseModal]);

  const wonPrize = participationResult
    ? participationResult.prize
    : null;

  // Fonction pour retourner en haut avec focus
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      heroFormRef.current?.querySelector('input')?.focus();
    }, 500);
  }, []);

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>Jouer — Thé Tip Top</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <Box 
      className={styles.container}
      component="main"
      role="main"
      aria-label="Page de jeu concours Thé Tip Top"
    >
      <AnimatePresence>
        {(loading || isSubmitting) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            role="progressbar"
            aria-label={loading ? "Chargement en cours" : "Participation en cours"}
          >
            <LinearProgress />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======== HERO ======== */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <Typography 
          component="h1" 
          id="hero-title"
          className={`${styles.title} ${styles.heroTitle}`}
        >
          Jouez &amp; gagnez
        </Typography>

        <Box 
          className={`${styles.formArea} ${styles.heroForm}`} 
          ref={heroFormRef}
          component="form"
          onSubmit={(e) => { e.preventDefault(); handlePlay(); }}
          aria-label="Formulaire de participation"
        >
          <TextField
            id="ticket-code-input"
            label="Numéro de Ticket"
            placeholder="Ex: ABC1234567"
            variant="outlined"
            className={styles.input}
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
            error={!!error}
            helperText={error || 'Saisissez votre code à 10 caractères'}
            inputProps={{
              maxLength: 10,
              pattern: '[A-Za-z0-9]{10}',
              'aria-describedby': error ? 'ticket-error' : 'ticket-help',
              autoComplete: 'off'
            }}
            aria-invalid={!!error}
            disabled={isSubmitting}
            fullWidth
          />

          <div 
            className={styles.heroCtas}
            role="group"
            aria-label="Actions principales"
          >
            <Button
              type="submit"
              variant="contained"
              className={styles.playButton}
              onClick={handlePlay}
              disabled={isSubmitting || !ticketCode.trim()}
              aria-describedby={error ? 'ticket-error' : undefined}
            >
              {isSubmitting ? 'Chargement...' : 'Jouer'}
            </Button>

            <Button
              variant="outlined"
              className={`${styles.playButton} ${styles.btnGhost}`}
              onClick={() => scrollTo(rulesRef)}
              aria-label="Consulter le règlement du jeu"
            >
              Voir le règlement
            </Button>
          </div>
        </Box>

        <Box className={styles.giftWrapper} aria-hidden="true">
          <img src={gift} alt="" className={styles.gift} />
        </Box>
      </section>

      {/* ======== RÈGLEMENT ======== */}
      <section 
        id="reglement" 
        ref={rulesRef} 
        className={styles.anchorSection}
        aria-labelledby="rules-title"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, scale: 1.003 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={styles.ticketWrapper}
        >
          <Card
            className={styles.ticketCard}
            sx={{
              backgroundImage: `
                radial-gradient(900px 260px at 0% 0%, rgba(191,141,61,0.10), transparent 60%),
                radial-gradient(900px 260px at 100% 100%, rgba(191,141,61,0.10), transparent 60%),
                linear-gradient(180deg, #FFF2E1, #FFEED7)
              `,
              backgroundColor: 'transparent',
              border: '1px solid rgba(191,141,61,0.28)'
            }}
          >
            <div className={styles.ticketGlow} aria-hidden="true" />
            <div className={styles.ticketEdgeLeft} aria-hidden="true" />
            <div className={styles.ticketEdgeRight} aria-hidden="true" />
            <div className={styles.ticketPerfo} aria-hidden="true" />

            <CardHeader 
              title={
                <Typography component="h2" id="rules-title">
                  Règlement du Jeu-Concours
                </Typography>
              }
              className={styles.rulesHeader} 
            />

            <CardContent className={styles.rulesContent}>
              <Typography paragraph>
                Pour fêter l'ouverture de notre <strong>10<sup>e</sup> boutique à Nice</strong>, <strong>Thé Tip Top</strong> organise un grand
                <strong> jeu-concours</strong>. Chaque code est gagnant et un <strong>tirage final</strong> désignera le/la chanceux·se
                qui repart avec <strong>1 an de thé</strong> ✨
              </Typography>

              <Typography paragraph>
                <span role="img" aria-label="Ticket">🎟️</span> <strong>Comment participer ?</strong><br/>
                • Tout achat supérieur à <strong>49€</strong> donne droit à un ticket de caisse avec
                un <strong>code unique de 10 caractères</strong> (chiffres et lettres).<br/>
                • Saisissez ce code dans le champ ci-dessus puis cliquez sur <strong>"Jouer"</strong>.
              </Typography>

              <Typography paragraph>
                <span role="img" aria-label="Calendrier">📅</span> <strong>Durée &amp; délais</strong><br/>
                • Le jeu dure <strong>30 jours</strong> — il reste <strong>{Math.max(0, countdown.days)} jours</strong> pour jouer.<br/>
                • Après la clôture : <strong>+30 jours</strong> pour tester tes codes et <strong>réclamer</strong> ton lot en ligne ou en boutique.
              </Typography>

              <Typography paragraph>
                <span role="img" aria-label="Shopping">🛍️</span> <strong>Retirer votre lot en boutique</strong><br/>
                • Présentez-vous en magasin avec <strong>votre nom et prénom</strong> <em>ou</em> votre <strong>numéro de code</strong> (celui du ticket).<br/>
                • L'équipe vérifie en caisse et vous remet <strong>immédiatement votre lot</strong>.
              </Typography>

              <Typography paragraph>
                <span role="img" aria-label="Trophée">🏆</span> <strong>Tirage final</strong><br/>
                À l'issue du jeu, tirage au sort parmi tous les participants pour <strong>1 an de thé (360€)</strong>.
              </Typography>

              <div className={`${styles.bonusCallout} ${styles.ruleBonus}`} role="note">
                <span className={styles.bonusIcon} aria-hidden="true">✨</span>
                <span className={styles.bonusText}>
                  <strong>Bonus :</strong> Participation 100% gagnante, et chaque participation t'inscrit au tirage final pour <strong>1 an de thé</strong> offert !
                </span>
              </div>

              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 3 }, 
                  justifyContent: 'center',
                  mt: 4
                }}
                role="group"
                aria-label="Actions du règlement"
              >
                <Button
                  variant="contained"
                  className={`${styles.playButton} ${styles.btnPrimary}`}
                  onClick={scrollToTop}
                  size="large"
                >
                  Jouer maintenant
                </Button>
                <Button
                  variant="outlined"
                  className={`${styles.playButton} ${styles.btnGhost}`}
                  onClick={() => scrollTo('countdown')}
                  size="large"
                >
                  Voir le compte à rebours
                </Button>
                <Button
                  variant="outlined"
                  className={`${styles.playButton} ${styles.btnGhost}`}
                  onClick={() => scrollTo(prizesRef)}
                  size="large"
                >
                  Voir les lots
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <Box className={styles.rulesDivider} role="separator" aria-hidden="true" />

      {/* ======== LOTS ======== */}
      <section 
        id="lots" 
        ref={prizesRef} 
        className={styles.anchorSection}
        aria-labelledby="prizes-title"
      >
        <Typography component="h2" id="prizes-title" className={styles.sectionTitle}>
          Lots à gagner
        </Typography>

        {loading ? (
          <Typography className={styles.loading} role="status" aria-live="polite">
            Chargement des lots...
          </Typography>
        ) : error && !rewards.length ? (
          <Typography className={styles.error} role="alert" aria-live="assertive">
            {error}
          </Typography>
        ) : rewards.length === 0 ? (
          <Typography className={styles.loading}>
            Aucun lot disponible pour le moment.
          </Typography>
        ) : (
          <Box
            className={styles.rewards}
            role="list"
            aria-label="Liste des lots"
          >
            <div className={styles.prizesGrid}>
            {rewards.map((reward, index) => (
              <div role="listitem" key={reward.id ?? index}>
                <PrizeCard
                  name={reward.name}
                  image={`/lots/${reward.imageUrl}`}
                  description={reward.description || reward.desc || reward.details || ''}
                  value={reward.value}
                />
              </div>
            ))}
            </div>
            
          </Box>
        )}
      </section>
      

      {/* ======== Modal de résultat ======== */}
      <AnimatePresence>
        {participationResult && (
          <>
            <motion.div 
              className={styles.modalOverlay} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={handleCloseModal}
              role="presentation"
              aria-hidden="true"
            />
            <motion.div
              className={styles.modalContainer}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="result-title"
              aria-describedby="result-description"
            >
              <Card className={styles.resultCard}>
                <button 
                  className={styles.closeBtn} 
                  onClick={handleCloseModal}
                  aria-label="Fermer la fenêtre de résultat"
                  autoFocus
                >
                  ×
                </button>

                <div className={styles.confettiWrapper} aria-hidden="true">
                  {['🎊', '🎉', '✨', '🎁'].map((emoji, i) => (
                    <span key={i} className={styles.confetti} aria-hidden="true">
                      {emoji}
                    </span>
                  ))}
                </div>

                <Typography 
                  id="result-title"
                  className={styles.congratsTitle}
                  component="h2"
                >
                  Félicitations !
                </Typography>
                
                <Typography 
                  className={styles.winText}
                  aria-live="assertive"
                >
                  Vous avez gagné
                </Typography>

                {wonPrize ? (
                  <motion.div 
                    className={styles.prizeContainer} 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <div className={styles.prizeGlow} aria-hidden="true" />
                    <img 
                      src={`/lots/${wonPrize.imageUrl}`} 
                      alt={`Votre lot gagné: ${wonPrize.name}`}
                      className={styles.prizeImage} 
                    />
                    <Typography 
                      className={styles.prizeName}
                      component="h3"
                      id="result-description"
                    >
                      {wonPrize.name}
                    </Typography>
                  </motion.div>
                ) : (
                  <Typography 
                    className={styles.errorText}
                    role="alert"
                    id="result-description"
                  >
                    Lot inconnu : impossible de trouver le prix associé.
                  </Typography>
                )}

                <Typography className={styles.instructionText}>
                  Présentez vous en magasin pour récupérer votre lot !
                </Typography>
                
                <Button 
                  variant="contained" 
                  className={styles.collectBtn} 
                  onClick={handleCloseModal}
                  size="large"
                >
                  Compris !
                </Button>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ======== Compte à rebours ======== */}
      <Box className={styles.rulesDivider} sx={{ my: 6 }} role="separator" aria-hidden="true" />

      <motion.section
        id="countdown"
        ref={countdownRef}
        className={styles.anchorSection}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginTop: '64px' }}
        aria-labelledby="countdown-title"
      >
        <Card className={styles.countdownCard} sx={{
          position: 'relative',
          overflow: 'hidden',
          p: { xs: 2.5, md: 4 },
          borderRadius: 4,
          background:
            'radial-gradient(1200px 400px at 10% -20%, rgba(255,215,0,.25), transparent 55%), radial-gradient(1000px 300px at 110% 120%, rgba(255,105,180,.18), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))',
          backdropFilter: 'blur(6px)',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography 
                  component="h2" 
                  id="countdown-title"
                  variant="h5" 
                  fontWeight={800}
                  sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                >
                  Grand Tirage — 1 an de thé (360€)
                </Typography>
              </Box>
            }
            subheader={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                <span role="img" aria-label="Chronomètre">⏱️</span>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {isOver ? "Le tirage est en cours / terminé." : "Plus que quelques instants avant la fin du concours !"}
                </Typography>
              </Box>
            }
            sx={{ p: 0, mb: 2 }}
          />

          <CardContent sx={{ p: 0 }}>
            {isOver ? (
              <Typography 
                variant="h6" 
                sx={{ fontWeight: 700, textAlign: 'center', my: 2 }}
                role="status"
                aria-live="polite"
              >
                Le compte à rebours est terminé 🎉
              </Typography>
            ) : (
              <>
                <Box 
                  sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, 
                    gap: { xs: 1, sm: 1.5 }, 
                    my: 2 
                  }}
                  role="timer"
                  aria-label={`Temps restant: ${countdown.days} jours, ${countdown.hours} heures, ${countdown.minutes} minutes, ${countdown.seconds} secondes`}
                >
                  {[
                    { label: 'Jours', value: countdown.days },
                    { label: 'Heures', value: countdown.hours },
                    { label: 'Minutes', value: countdown.minutes },
                    { label: 'Secondes', value: countdown.seconds },
                  ].map((block, i) => (
                    <motion.div 
                      key={block.label} 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      transition={{ delay: i * 0.05 }}
                    >
                      <Box sx={{
                        textAlign: 'center', 
                        p: { xs: 1.5, sm: 2 }, 
                        borderRadius: 3,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        background: 'rgba(255,255,255,0.7)', 
                        backdropFilter: 'blur(4px)',
                      }}>
                        <Typography 
                          variant="h4" 
                          fontWeight={900} 
                          lineHeight={1.1}
                          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                          aria-label={`${block.value} ${block.label.toLowerCase()}`}
                        >
                          {String(block.value).padStart(2, '0')}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            textTransform: 'uppercase', 
                            letterSpacing: 1,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        >
                          {block.label}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ mb: 0.5, fontWeight: 600 }}
                    id="progress-label"
                  >
                    Progression des {CONTEST_TOTAL_DAYS} jours
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={countdown.progress}
                    sx={{ 
                      height: 10, 
                      borderRadius: 999, 
                      backgroundColor: 'rgba(0,0,0,0.08)', 
                      '& .MuiLinearProgress-bar': { borderRadius: 999 } 
                    }}
                    aria-labelledby="progress-label"
                    aria-valuenow={Math.round(countdown.progress)}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuetext={`${Math.round(countdown.progress)}% du concours écoulé`}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
                    <Typography variant="caption">Début</Typography>
                    <Typography variant="caption" aria-live="polite">
                      {Math.round(countdown.progress)}%
                    </Typography>
                    <Typography variant="caption">Fin</Typography>
                  </Box>
                </Box>
              </>
            )}

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={scrollToTop}
                className={styles.playButton}
                size="large"
                aria-label="Retourner en haut pour jouer maintenant"
              >
                Tenter ma chance maintenant ✨
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.section>

      {/* Skip links pour l'accessibilité */}
      <Box 
        sx={{ 
          position: 'fixed', 
          top: -40, 
          left: 8, 
          zIndex: 9999,
          '&:focus-within': { top: 8 }
        }}
      >  
 
      </Box>
      </Box>
    </>
    
  );
}
