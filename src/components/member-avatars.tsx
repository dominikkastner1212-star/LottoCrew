"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const AVATAR_TONES = [
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// Ueberlappende Avatar-Reihe der Mitspieler. Tippen/Hovern zeigt den Namen als
// kleinen Tooltip, der federnd erscheint. Max. 6 Koepfe, Rest als "+N".
export function MemberAvatars({ names }: { names: string[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();

  if (names.length === 0) {
    return null;
  }

  const visible = names.slice(0, 6);
  const rest = names.length - visible.length;

  return (
    <div className="flex items-center">
      {visible.map((name, index) => (
        <div key={`${name}-${index}`} className="relative" style={{ marginLeft: index === 0 ? 0 : -8 }}>
          <AnimatePresence>
            {activeIndex === index ? (
              <motion.span
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 480, damping: 26 }}
                className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg"
              >
                {name}
              </motion.span>
            ) : null}
          </AnimatePresence>
          <motion.button
            type="button"
            aria-label={name}
            onHoverStart={() => setActiveIndex(index)}
            onHoverEnd={() => setActiveIndex((current) => (current === index ? null : current))}
            onTap={() => setActiveIndex((current) => (current === index ? null : index))}
            whileHover={reduce ? undefined : { y: -3, scale: 1.08, zIndex: 10 }}
            whileTap={reduce ? undefined : { scale: 0.94 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className={`relative grid size-9 select-none touch-manipulation place-items-center rounded-full border-2 border-white text-[0.7rem] font-bold shadow-sm ${AVATAR_TONES[index % AVATAR_TONES.length]}`}
          >
            {initials(name)}
          </motion.button>
        </div>
      ))}
      {rest > 0 ? (
        <span className="relative -ml-2 grid size-9 place-items-center rounded-full border-2 border-white bg-slate-100 text-[0.7rem] font-bold text-slate-500 shadow-sm">
          +{rest}
        </span>
      ) : null}
    </div>
  );
}
