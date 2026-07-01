import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  trend,
  icon: Icon,
  tone = "gold",
}: {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  tone?: "gold" | "violet" | "green" | "blue";
}) {
  const tones = {
    gold: "from-amber-300/24 to-amber-500/6 text-amber-600",
    violet: "from-violet-400/24 to-violet-700/8 text-violet-700",
    green: "from-emerald-400/22 to-emerald-800/8 text-emerald-700",
    blue: "from-sky-400/22 to-sky-900/8 text-sky-700",
  };
  return (
    <div className={cn("rise-in rounded-[26px] border border-slate-200 bg-gradient-to-br p-5", tones[tone])}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="grid size-10 place-items-center rounded-2xl bg-slate-100">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-normal text-slate-900 md:text-3xl">{value}</p>
      <p className="mt-2 text-xs font-medium text-slate-500">{trend}</p>
    </div>
  );
}
