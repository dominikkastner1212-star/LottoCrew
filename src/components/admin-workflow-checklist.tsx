import { ArrowRight, Check, CircleAlert, ListChecks } from "lucide-react";
import Link from "next/link";

import type { AppContext } from "@/lib/app-data";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type ChecklistStep = {
  title: string;
  description: string;
  href: string;
  done: boolean;
  urgent?: boolean;
};

function isPastOrToday(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date <= today;
}

export function AdminWorkflowChecklist({ app }: { app: AppContext }) {
  if (!app.group || !app.isAdmin) {
    return null;
  }

  const nextOpenDraw =
    app.draws.find((draw) => draw.status !== "evaluated" && new Date(draw.date) >= new Date()) ??
    app.draws.find((draw) => draw.status !== "evaluated") ??
    null;
  const nextDrawTickets = nextOpenDraw ? app.tickets.filter((ticket) => ticket.drawId === nextOpenDraw.id) : [];
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthPayments = app.payments.filter((payment) => payment.month.slice(0, 7) === currentMonth);
  const activeMemberCount = app.members.filter((member) => member.status === "active").length;
  const openPayments = app.payments.filter((payment) => payment.status === "open");
  const unevaluatedDraws = app.draws.filter((draw) => draw.status !== "evaluated" && isPastOrToday(draw.date));
  const openAmountWinnings = app.winnings.filter((winning) => winning.amount <= 0);

  const steps: ChecklistStep[] = [
    {
      title: "Ziehung angelegt?",
      description: nextOpenDraw ? `Nächste offene Ziehung: ${formatDate(nextOpenDraw.date)}.` : "Lege die nächste Eurojackpot-Ziehung an.",
      href: "/ziehungen",
      done: Boolean(nextOpenDraw),
      urgent: !nextOpenDraw,
    },
    {
      title: "Tipps eingetragen?",
      description: nextOpenDraw
        ? `${nextDrawTickets.length} Tipp${nextDrawTickets.length === 1 ? "" : "s"} für diese Ziehung.`
        : "Sobald eine Ziehung steht, können Tipps eingetragen werden.",
      href: "/tipps",
      done: nextDrawTickets.length > 0,
      urgent: Boolean(nextOpenDraw) && nextDrawTickets.length === 0,
    },
    {
      title: "Monatsbeiträge erzeugt?",
      description:
        currentMonthPayments.length > 0
          ? `${currentMonthPayments.length} Beitrag${currentMonthPayments.length === 1 ? "" : "e"} für diesen Monat vorhanden.`
          : "Erzeuge die Beiträge für den aktuellen Monat.",
      href: "/kasse",
      done: activeMemberCount > 0 && currentMonthPayments.length >= activeMemberCount,
      urgent: activeMemberCount > 0 && currentMonthPayments.length === 0,
    },
    {
      title: "Offene Zahlungen geprüft?",
      description:
        openPayments.length === 0
          ? "Keine offenen Beiträge."
          : `${openPayments.length} offen, zusammen ${formatCurrency(openPayments.reduce((sum, payment) => sum + payment.amount, 0))}.`,
      href: "/kasse",
      done: openPayments.length === 0,
      urgent: openPayments.length > 0,
    },
    {
      title: "Ziehung ausgewertet?",
      description:
        unevaluatedDraws.length === 0
          ? "Keine fällige Ziehung offen."
          : `${unevaluatedDraws.length} fällige Ziehung${unevaluatedDraws.length === 1 ? "" : "en"} noch nicht ausgewertet.`,
      href: "/ziehungen",
      done: unevaluatedDraws.length === 0,
      urgent: unevaluatedDraws.length > 0,
    },
    {
      title: "Gewinnbetrag erfasst?",
      description:
        openAmountWinnings.length === 0
          ? "Keine erkannten Gewinne mit offenem Betrag."
          : `${openAmountWinnings.length} Gewinn${openAmountWinnings.length === 1 ? "" : "e"} brauchen noch einen Betrag.`,
      href: "/kasse",
      done: openAmountWinnings.length === 0,
      urgent: openAmountWinnings.length > 0,
    },
  ];

  const openSteps = steps.filter((step) => !step.done);

  return (
    <section className="glass-panel mb-5 rounded-[28px] border border-amber-200 p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <ListChecks className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Admin-Checkliste</h2>
            <p className="text-sm text-slate-600">
              {openSteps.length === 0 ? "Alles Wichtige ist erledigt." : `${openSteps.length} Punkt${openSteps.length === 1 ? "" : "e"} offen.`}
            </p>
          </div>
        </div>
        {openSteps.some((step) => step.urgent) ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            <CircleAlert className="size-3.5" />
            Handlungsbedarf
          </span>
        ) : null}
      </div>

      <ol className="mt-5 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step) => {
          const content = (
            <>
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                  step.done
                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                    : step.urgent
                      ? "border-amber-400 bg-amber-400 text-slate-950"
                      : "border-slate-200 bg-white text-slate-400",
                )}
              >
                {step.done ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-sm font-semibold", step.done ? "text-slate-500" : "text-slate-900")}>{step.title}</span>
                <span className="mt-0.5 block text-sm leading-5 text-slate-600">{step.description}</span>
              </span>
            </>
          );

          return (
            <li key={step.title}>
              {step.done ? (
                <div className="flex h-full items-start gap-3 rounded-2xl border border-slate-100 bg-white/70 px-3 py-3">{content}</div>
              ) : (
                <Link
                  href={step.href}
                  className={cn(
                    "flex h-full items-start gap-3 rounded-2xl border px-3 py-3 transition",
                    step.urgent ? "border-amber-300 bg-amber-50 hover:bg-amber-100" : "border-slate-200 bg-white hover:bg-slate-50",
                  )}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
