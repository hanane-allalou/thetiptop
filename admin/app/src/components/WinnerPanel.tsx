import { User, Mail, Gift, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";

interface WinnerPanelProps {
  winner: {
    userName: string;
    userEmail: string;
    prize: string;
    drawDate: string;
  } | null;
  onClose: () => void;
  visible: boolean;
}

export default function WinnerPanel({ winner, visible, onClose }: WinnerPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showPrizeBubble, setShowPrizeBubble] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible && winner) {
      const timer1 = setTimeout(() => setShowDetails(true), 15500); 
      const timer2 = setTimeout(() => setShowPrizeBubble(true), 7000); 

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setShowDetails(false);
      setShowPrizeBubble(false);
      setProgressValue(0);
    }
  }, [visible, winner]);

useEffect(() => {
  let animationFrameId: number | null = null;
  let startTime: number | null = null;

  const duration = 15000; 

  function linearEase(t: number) { 
    return t;
  }

  if (visible && !showDetails) {
    setProgressValue(0);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const normalized = Math.min(elapsed / duration, 1); 
      const easedProgress = linearEase(normalized) * 100; 

      setProgressValue(easedProgress);

      if (normalized < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setProgressValue(100);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
  }

  return () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}, [visible, showDetails]);



  
  useEffect(() => {
    if (showDetails && winner) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [showDetails, winner]);

 
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ease-in-out",
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      style={{
        background: "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(10px)", 
      }}
    >
      <div
        ref={panelRef}
        className={cn(
          "relative w-full max-w-xl mx-2 sm:mx-4 px-4 py-8",
  "rounded-[4rem] border border-white/50",
  "bg-white/10 backdrop-blur-lg backdrop-saturate-150",
  "bg-[radial-gradient(1200px_400px_at_10%_-20%,_rgba(255,215,0,0.25)_0%,_transparent_55%),_radial-gradient(1000px_300px_at_110%_120%,_rgba(255,105,180,0.18)_0%,_transparent_60%),_linear-gradient(180deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0))]",
  "bg-no-repeat bg-cover",
  "drop-shadow-xl",
  "shadow-[0_8px_2px_rgba(255,215,0,0.15),0_50px_60px_rgba(255,105,180,0.12),0_10px_5px_rgba(198,124,78,0.2),0_15px_40px_rgba(217,202,179,0.15)]",
  "ring-1 ring-white/10",
  "transition-all duration-300 ease-in-out",
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"

        )}
      >
        {/* Title */}
        <h2 className="text-3xl sm:text-5xl font-fairplay font-bold text-center text-white mt-2 mb-6">
          <span className="inline-block animate-bounce-party mr-0 duration-1000">✨</span>
          Félicitations à notre gagnant·e !✨
        </h2>

        {showDetails && winner ? (
          <div className="space-y-3 text-center text-white">
            {/* Info Box - shared style */}
            {[
              {
                icon: <User className="w-6 h-6 sm:w-7 sm:h-7 text-custom-gold" />,
                label: "Nom",
                value: winner.userName,
                delay: "2s",
              },
              {
                icon: <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-custom-gold" />,
                label: "Email",
                value: winner.userEmail,
                delay: "3.5s",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-1 animate-fade-in-up rounded-[2rem] p-2 bg-white/20 border border-white/60 mx-auto w-full max-w-sm"
                style={{ animationDelay: item.delay, animationFillMode: "forwards" }}
              >
                {item.icon}
                <p className="text-xs sm:text-sm font-bold text-white-900">{item.label}</p>
                <p className="text-lg sm:text-xl font-bold break-all">{item.value}</p>
              </div>
            ))}

            {/* Prize bubble */}
            {showPrizeBubble && (
              <div className="flex justify-center pt-3 animate-pop-surprise">
                <div className="rounded-[2rem] border border-white bg-white/20 shadow-lg px-4 py-3 text-center w-full max-w-sm">
                  <Gift className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-1 text-custom-gold" />
                  <p className="text-lg sm:text-xl font-black text-white-900">Lot remporté :</p>
                  <p className="text-2xl sm:text-3xl font-bold text-custom-gold break-words">{winner.prize} – 360 €</p>
                </div>
              </div>
            )}

            {/* Date du tirage */}
            {showDetails && winner && (
              <div
                className="flex flex-col items-center gap-1 animate-fade-in-up rounded-[2rem] p-2 bg-white/20 border border-white/60 mx-auto w-full max-w-sm"
                style={{ animationDelay: "4.5s", animationFillMode: "forwards" }}
              >
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-custom-gold" />
                <p className="text-xs sm:text-sm font-bold text-white-900">Date du tirage</p>
                <p className="text-lg sm:text-xl font-bold break-all">
                  {new Date(winner.drawDate).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <Progress
              value={progressValue}
              className="progress-striped progress-animated"  
            />
            <p className="mt-4 text-center text-white text-lg">
               {Math.round(progressValue)}%
           </p>
          </div>
        )}
      </div>
    </div>
  );
}
