import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-amber-300 text-slate-950 shadow-[0_14px_42px_rgba(251,191,36,.22)] hover:bg-amber-200",
  secondary: "border border-white/10 bg-white/[.07] text-white hover:bg-white/[.11]",
  ghost: "text-slate-300 hover:bg-white/[.08] hover:text-white",
  danger: "border border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/18",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 disabled:cursor-not-allowed disabled:opacity-45",
        variants[variant],
        className,
      )}
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
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
