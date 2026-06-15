import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("glass-panel rounded-[28px] p-5 md:p-6", className)}>{children}</section>;
}

export function Surface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("rounded-3xl border border-white/10 bg-white/[.055] p-4", className)}>{children}</div>;
}
