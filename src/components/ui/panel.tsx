import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"section">) {
  return <section className={cn("glass-panel rounded-[28px] p-5 md:p-6", className)} {...props}>{children}</section>;
}

export function Surface({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"div">) {
  return <div className={cn("rounded-3xl border border-white/10 bg-white/[.055] p-4", className)} {...props}>{children}</div>;
}
