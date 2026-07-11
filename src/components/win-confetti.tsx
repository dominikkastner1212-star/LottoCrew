"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const COLORS = ["#E8A600", "#1B8F5C", "#7C5CFF", "#F2B705", "#34D399"];

// Einmalig abspielender Konfetti-Regen. Rein dekorativ, liegt über dem Inhalt
// und fängt keine Klicks ab. Wird bei reduzierter Bewegung nicht angezeigt.
export function WinConfetti({ pieces = 34 }: { pieces?: number }) {
  const reduce = useReducedMotion();

  // Zufallswerte einmalig beim Mounten erzeugen (useState-Initializer läuft nur
  // einmal und ist damit render-rein, anders als Math.random in useMemo).
  const [confetti] = useState(() =>
    Array.from({ length: pieces }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.35,
      duration: 1.6 + Math.random() * 1.2,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 6,
      rotate: Math.random() * 360,
    })),
  );

  if (reduce) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {confetti.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute top-0 block rounded-sm"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
          }}
          initial={{ y: -20, opacity: 0, rotate: piece.rotate }}
          animate={{ y: "120%", opacity: [0, 1, 1, 0], rotate: piece.rotate + 220 }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
