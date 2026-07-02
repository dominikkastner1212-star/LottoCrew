"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-amber-400 text-slate-950 shadow-[0_14px_32px_rgba(232,166,0,.28)] hover:bg-amber-300",
  secondary: "border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100",
  ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
  danger: "border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100",
};

const base =
  "inline-flex min-h-10 select-none touch-manipulation items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

// Button fuer Server-Action-Formulare. Zeigt automatisch einen Spinner, sobald
// das umgebende <form> uebermittelt wird — sofortiges Feedback statt stummer
// Wartezeit. Muss innerhalb eines <form action={...}> stehen.
export function SubmitButton({
  children,
  className,
  variant = "primary",
  disabled,
  pendingLabel,
}: {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof variants;
  disabled?: boolean;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={disabled || pending} className={cn(base, variants[variant], className)}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {pendingLabel ?? "Wird gespeichert..."}
        </>
      ) : (
        children
      )}
    </button>
  );
}
