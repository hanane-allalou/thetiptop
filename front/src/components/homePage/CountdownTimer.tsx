import { useState, useEffect, useCallback } from 'react';
import './CountdownTimer.scss';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

interface CountdownState {
  distance: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
}

function useCountdown(targetDate: Date, totalDays: number): CountdownState {
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

  const [state, setState] = useState<CountdownState>(calc);

  useEffect(() => {
    const timer = setInterval(() => setState(calc()), 1000);
    return () => clearInterval(timer);
  }, [calc]);

  return state;
}

interface CountdownTimerProps {
  onPlayNow?: () => void;
}

export function CountdownTimer({ onPlayNow }: CountdownTimerProps) {
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
        console.warn('LocalStorage non disponible');
        const start = new Date();
        return new Date(start.getTime() + CONTEST_TOTAL_DAYS * MS_IN_DAY);
      }
    }
    const start = new Date();
    return new Date(start.getTime() + CONTEST_TOTAL_DAYS * MS_IN_DAY);
  });

  const countdown = useCountdown(contestEnd, CONTEST_TOTAL_DAYS);
  const isOver = countdown.distance === 0;

  return (
    <div className="countdown-card">
      <div className="countdown-header">
        <div className="countdown-title-container">
          <span className="trophy-emoji">🏆</span>
          <h2 className="countdown-title">
            Grand Tirage Final
          </h2>
        </div>
        <p className="countdown-subtitle">
          Un an de thé offert • Valeur 360€
        </p>
      </div>
      
      <div className="countdown-content">
        {isOver ? (
          <div className="countdown-finished">
            <h3 className="finished-title">
              🎉 Le concours est terminé !
            </h3>
            <p className="finished-message">
              Restez connecté pour connaître les résultats du tirage final.
            </p>
          </div>
        ) : (
          <>
            <div className="countdown-grid">
              {[
                { label: 'Jours', value: countdown.days },
                { label: 'Heures', value: countdown.hours },
                { label: 'Minutes', value: countdown.minutes },
                { label: 'Secondes', value: countdown.seconds },
              ].map((block, index) => (
                <div
                  key={block.label}
                  className="countdown-block"
                >
                  <div className="countdown-number">
                    {String(block.value).padStart(2, '0')}
                  </div>
                  <div className="countdown-label">
                    {block.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Progression du concours</span>
                <span className="progress-percentage">{Math.round(countdown.progress)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${countdown.progress}%` }}
                />
              </div>
              <div className="progress-labels">
                <span className="progress-start">Début</span>
                <span className="progress-end">Fin</span>
              </div>
            </div>
          </>
        )}

        {onPlayNow && !isOver && (
          <div className="countdown-cta">
            <button onClick={onPlayNow} className="cta-button">
              ✨ Participer maintenant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}