"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

// Zählt einen Euro-Betrag beim Erscheinen weich hoch (Premium-Moment für
// den Jackpot). Respektiert Reduced Motion: dann steht der Endwert sofort da.
export function CountUpCurrency({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const format = (amount: number) =>
      new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);

    if (reduce || value <= 0) {
      node.textContent = format(value);
      return;
    }

    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = format(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [value, reduce]);

  // Endwert als Initialinhalt, damit ohne JS/vor Hydration nichts springt.
  return (
    <span ref={ref} className={className}>
      {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)}
    </span>
  );
}
