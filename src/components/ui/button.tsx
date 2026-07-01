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
