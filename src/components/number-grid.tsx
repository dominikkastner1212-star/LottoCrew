"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Antippbares Zahlenraster wie auf einem echten Lottoschein.
 *
 * Bewusst simpel gehalten für maximale Verständlichkeit:
 * - Große Touch-Flächen (min. 44x44px, Apple-Empfehlung)
 * - 10 Spalten wie auf dem Papier-Spielschein (Wiedererkennung!)
 * - Gewählte Zahlen sind unübersehbar (gefüllt + Haken)
 * - Ist das Limit erreicht, werden restliche Zahlen ausgegraut
 */
export function NumberGrid({
  max,
  limit,
  selected,
  onToggle,
  columns = 10,
  tone = "amber",
  label,
}: {
  max: number;
  limit: number;
  selected: number[];
  onToggle: (value: number) => void;
  columns?: number;
  tone?: "amber" | "violet";
  label: string;
}) {
  const full = selected.length >= limit;
  const remaining = limit - selected.length;

  const toneStyles = {
    amber: {
      selected: "border-amber-400 bg-amber-400 text-slate-950 shadow-[0_6px_16px_rgba(232,166,0,.35)]",
      idle: "border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50",
      badge: "bg-amber-100 text-amber-900",
      done: "bg-emerald-100 text-emerald-800",
    },
    violet: {
      selected: "border-violet-400 bg-violet-400 text-white shadow-[0_6px_16px_rgba(139,92,246,.35)]",
      idle: "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50",
      badge: "bg-violet-100 text-violet-900",
      done: "bg-emerald-100 text-emerald-800",
    },
  }[tone];

  return (
    <fieldset>
      {/* Kopfzeile: Label + Live-Zähler. aria-live liest den Fortschritt
          für Screenreader mit vor. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <legend className="text-sm font-semibold text-slate-700">{label}</legend>
        <span
          aria-live="polite"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            full ? toneStyles.done : toneStyles.badge,
          )}
        >
          {full ? (
            <>
              <Check className="size-3.5" /> Fertig - {limit} von {limit} gewählt
            </>
          ) : (
            <>Noch {remaining} {remaining === 1 ? "Zahl" : "Zahlen"} antippen</>
          )}
        </span>
      </div>

      <div
        className="mt-3 grid gap-1.5 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        role="group"
        aria-label={label}
      >
        {Array.from({ length: max }, (_, index) => index + 1).map((value) => {
          const isSelected = selected.includes(value);
          const isDisabled = !isSelected && full;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              aria-label={`Zahl ${value}${isSelected ? ", gewählt" : ""}`}
              className={cn(
                "flex aspect-square min-h-9 select-none touch-manipulation items-center justify-center rounded-xl border text-sm font-semibold transition duration-100 sm:min-h-11 sm:text-base",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                isSelected ? cn(toneStyles.selected, "scale-105") : toneStyles.idle,
                isDisabled && "cursor-not-allowed opacity-30",
                !isDisabled && "active:scale-90",
              )}
            >
              {value}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
