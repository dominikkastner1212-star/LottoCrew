import { AlertCircle, CalendarClock, CreditCard, Euro, Trophy, Users } from "lucide-react";
import { AppShell, PageHeader, QuickActionRail } from "@/components/app-shell";
import { ChartBars } from "@/components/chart-bars";
import { MetricCard } from "@/components/metric-card";
import { NumberRow } from "@/components/number-row";
import { Panel, Surface } from "@/components/ui/panel";
import { StatusPill } from "@/components/status-pill";
import { draws, group, payments, tickets, totals, winnings } from "@/lib/sample-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const openPayments = payments.filter((payment) => payment.status === "offen");

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Alles Wichtige fuer die naechste Runde: Jackpot, Tipps, offene Beitraege und Gewinne."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Aktueller Jackpot" value={formatCurrency(group.jackpot)} trend="Eurojackpot am Freitag" icon={Euro} tone="gold" />
        <MetricCard label="Naechste Ziehung" value={formatDate(draws[0].date)} trend="2 aktive Tippfelder vorbereitet" icon={CalendarClock} tone="violet" />
        <MetricCard label="Aktive Mitspieler" value={`${totals.activeMembers}`} trend="6 von 6 im Gruppenpool" icon={Users} tone="green" />
        <MetricCard label="Offene Zahlungen" value={formatCurrency(totals.openPayments)} trend="2 Erinnerungen faellig" icon={CreditCard} tone="blue" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Panel className="premium-ring overflow-hidden">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-200">{group.name}</p>
              <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-normal text-white md:text-5xl">
                {formatCurrency(group.jackpot)} warten auf euren naechsten Coup.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                Die Runde ist finanziert, bis auf zwei offene Beitraege. Der Admin kann Zahlung, Tippabgabe und Auswertung direkt abhaken.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live-Fokus</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {["03", "21", "44"].map((part, index) => (
                  <div key={index} className="rounded-2xl bg-white/[.07] p-4">
                    <p className="font-mono text-2xl font-semibold text-white">{part}</p>
                    <p className="mt-1 text-[0.65rem] text-slate-500">{["Tage", "Std", "Min"][index]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <QuickActionRail />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Erinnerungen</h2>
              <p className="mt-1 text-sm text-slate-400">Offene Beitraege vor der Ziehung.</p>
            </div>
            <AlertCircle className="size-5 text-amber-200" />
          </div>
          <div className="mt-5 space-y-3">
            {openPayments.map((payment) => (
              <Surface key={payment.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{payment.member}</p>
                  <p className="text-xs text-slate-400">{payment.month}</p>
                </div>
                <p className="font-semibold text-amber-100">{formatCurrency(payment.amount)}</p>
              </Surface>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Aktive Tipps</h2>
              <p className="mt-1 text-sm text-slate-400">Mehrere Tipps pro Ziehung, sauber getrennt.</p>
            </div>
            <StatusPill status="abgegeben" />
          </div>
          <div className="mt-5 space-y-3">
            {tickets.slice(0, 3).map((ticket) => (
              <Surface key={ticket.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{ticket.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{ticket.id} · {formatDate(ticket.date)}</p>
                  </div>
                  <StatusPill status={ticket.status} />
                </div>
                <div className="mt-4">
                  <NumberRow numbers={ticket.numbers} euroNumbers={ticket.euroNumbers} />
                </div>
              </Surface>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Gewinntrend</h2>
              <p className="mt-1 text-sm text-slate-400">Einsaetze und Gewinne im Monatsvergleich.</p>
            </div>
            <Trophy className="size-5 text-amber-200" />
          </div>
          <ChartBars />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Surface>
              <p className="text-sm text-slate-400">Letzter Gewinn</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(winnings[0].amount)}</p>
            </Surface>
            <Surface>
              <p className="text-sm text-slate-400">Gesamt historisch</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(totals.totalWinnings)}</p>
            </Surface>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
