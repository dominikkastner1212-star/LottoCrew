import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-amber-400 text-slate-950 shadow-[0_14px_32px_rgba(232,166,0,.28)] hover:bg-amber-300",
  secondary: "border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100",
  ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
  danger: "border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100",
};

// Gemeinsame Basis: sofortiges Tap-Feedback (active:scale) + kurze Transition.
// touch-manipulation nimmt die iOS-Tap-Verzoegerung, select-none verhindert
// versehentliches Markieren beim Gedrueckthalten.
const base =
  "inline-flex min-h-10 select-none touch-manipulation items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70";

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(base, "disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100", variants[variant], className)}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  children,
  className,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}
