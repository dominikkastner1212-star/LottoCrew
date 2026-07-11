import { AlertCircle, CheckCircle2, Clock3, MinusCircle, Send, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const styles = {
  geplant: "border-sky-200 bg-sky-50 text-sky-700",
  abgegeben: "border-violet-200 bg-violet-50 text-violet-700",
  ausgewertet: "border-emerald-200 bg-emerald-50 text-emerald-700",
  offen: "border-amber-200 bg-amber-50 text-amber-700",
  bezahlt: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Admin: "border-amber-200 bg-amber-50 text-amber-700",
  Teilnehmer: "border-slate-200 bg-slate-50 text-slate-600",
  planned: "border-sky-200 bg-sky-50 text-sky-700",
  submitted: "border-violet-200 bg-violet-50 text-violet-700",
  evaluated: "border-emerald-200 bg-emerald-50 text-emerald-700",
  open: "border-amber-200 bg-amber-50 text-amber-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  admin: "border-amber-200 bg-amber-50 text-amber-700",
  participant: "border-slate-200 bg-slate-50 text-slate-600",
  amount_open: "border-amber-200 bg-amber-50 text-amber-800",
  no_win: "border-slate-200 bg-slate-50 text-slate-600",
  unchecked: "border-slate-200 bg-white text-slate-600",
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
  amount_open: "Gewinnbetrag offen",
  no_win: "kein Gewinn",
  unchecked: "noch nicht geprüft",
};

export function StatusPill({ status, className }: { status: keyof typeof styles; className?: string }) {
  let Icon = Clock3;
  if (status === "amount_open") {
    Icon = AlertCircle;
  } else if (status === "no_win") {
    Icon = MinusCircle;
  } else if (status === "bezahlt" || status === "paid" || status === "ausgewertet" || status === "evaluated") {
    Icon = CheckCircle2;
  } else if (status === "offen" || status === "open") {
    Icon = XCircle;
  } else if (status === "abgegeben" || status === "submitted") {
    Icon = Send;
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", styles[status], className)}>
      <Icon className="size-3.5" />
      {labels[status]}
    </span>
  );
}
