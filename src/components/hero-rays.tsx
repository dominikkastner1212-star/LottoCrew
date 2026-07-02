"use client";

import { motion, useReducedMotion } from "motion/react";

// Sehr dezente, langsam rotierende goldene Lichtstrahlen als Hero-Hintergrund.
// Rein dekorativ (pointer-events-none), bei Reduced Motion statisch.
export function HeroRays() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
      <motion.div
        className="absolute -right-24 -top-40 size-[26rem]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(232,166,0,0.10) 18deg, transparent 40deg, transparent 95deg, rgba(232,166,0,0.07) 115deg, transparent 140deg, transparent 210deg, rgba(27,143,92,0.05) 230deg, transparent 255deg, transparent 360deg)",
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={reduce ? undefined : { duration: 90, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute -right-16 -top-24 size-64 rounded-full bg-[radial-gradient(circle,rgba(232,166,0,0.12),transparent_65%)]" />
    </div>
  );
}
