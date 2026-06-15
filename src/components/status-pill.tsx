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
  planned: "border-sky-300/20 bg-sky-400/10 text-sky-100",
  submitted: "border-violet-300/20 bg-violet-400/10 text-violet-100",
  evaluated: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  open: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  paid: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  admin: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  participant: "border-slate-300/20 bg-white/[.06] text-slate-200",
};

const labels: Record<keyof typeof styles, string> = {
  geplant: "geplant",
  abgegeben: "abgegeben",
  ausgewertet: "ausgewertet",
  offen: "offen",
  bezahlt: "bezahlt",
  Admin: "Admin",
  Teilnehmer: "Teilnehmer",
  planned: "geplant",
  submitted: "abgegeben",
  evaluated: "ausgewertet",
  open: "offen",
  paid: "bezahlt",
  admin: "Admin",
  participant: "Teilnehmer",
};

export function StatusPill({ status, className }: { status: keyof typeof styles; className?: string }) {
  const Icon =
    status === "bezahlt" || status === "paid" || status === "ausgewertet" || status === "evaluated"
      ? CheckCircle2
      : status === "offen" || status === "open"
        ? XCircle
        : status === "abgegeben" || status === "submitted"
          ? Send
          : Clock3;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", styles[status], className)}>
      <Icon className="size-3.5" />
      {labels[status]}
    </span>
  );
}
