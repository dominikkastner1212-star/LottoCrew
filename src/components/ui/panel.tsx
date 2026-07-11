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
  return <section className={cn("glass-panel rounded-[24px] p-4 sm:p-5 md:rounded-[28px] md:p-6", className)} {...props}>{children}</section>;
}

export function Surface({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"div">) {
  return <div className={cn("rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5", className)} {...props}>{children}</div>;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center sm:px-6",
        className,
      )}
    >
      {icon ? <div className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-white text-amber-600 shadow-sm">{icon}</div> : null}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
