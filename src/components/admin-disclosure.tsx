"use client";

import { Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useState } from "react";

// Klappt Admin-Formulare hinter einen "+ Neu"-Knopf, damit Seiten nicht mit
// dauerhaft offenen Formularen vollstehen. Mitglieder ohne Admin-Rechte sehen
// die Formulare ohnehin nicht.
export function AdminDisclosure({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-10 select-none touch-manipulation items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 text-sm font-semibold text-slate-600 transition duration-150 hover:border-amber-400 hover:text-slate-900 active:scale-[0.97]"
      >
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ type: "spring", stiffness: 420, damping: 24 }}>
          <Plus className="size-4 text-amber-600" />
        </motion.span>
        {label}
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
