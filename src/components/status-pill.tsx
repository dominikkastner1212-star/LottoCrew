import { CheckCircle2, Clock3, Send, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const styles = {
  geplant: "border-sky-300/20 bg-sky-400/10 text-sky-100",
  abgegeben: "border-violet-300/20 bg-violet-400/10 text-violet-100",
  ausgewertet: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  offen: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  bezahlt: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  Admin: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  Teilnehmer: "border-slate-300/20 bg-white/[.06] text-slate-200",
};

export function StatusPill({ status, className }: { status: keyof typeof styles; className?: string }) {
  const Icon = status === "bezahlt" || status === "ausgewertet" ? CheckCircle2 : status === "offen" ? XCircle : status === "abgegeben" ? Send : Clock3;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", styles[status], className)}>
      <Icon className="size-3.5" />
      {status}
    </span>
  );
}
