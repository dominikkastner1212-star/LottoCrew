import { AlertCircle, CalendarClock, CreditCard, Euro, Trophy, Users } from "lucide-react";
import { AppShell, PageHeader, QuickActionRail } from "@/components/app-shell";
import { ChartBars } from "@/components/chart-bars";
import { MetricCard } from "@/components/metric-card";
import { NumberRow } from "@/components/number-row";
import { StatusPill } from "@/components/status-pill";
import { LinkButton } from "@/components/ui/button";
import { Panel, Surface } from "@/components/ui/panel";
import { getAppContext } from "@/lib/app-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const app = await getAppContext();
  const openPayments = app.payments.filter((payment) => payment.status === "open");
  const nextDraw = app.draws.find((draw) => new Date(draw.date) >= new Date()) ?? app.draws[0];

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Alles Wichtige fuer die naechste Runde: Jackpot, Tipps, offene Beitraege und Gewinne."
      />

      {!app.userId ? (
        <Panel className="mb-5">
          <h2 className="text-2xl font-semibold text-white">Bitte einloggen</h2>
          <p className="mt-2 text-sm text-slate-400">Melde dich an, um eure Abteilungsdaten zu sehen.</p>
          <LinkButton href="/login" className="mt-5">Zur Anmeldung</LinkButton>
        </Panel>
      ) : null}

      {app.userId && !app.group ? (
        <Panel className="mb-5">
          <h2 className="text-2xl font-semibold text-white">Gruppe einrichten</h2>
          <p className="mt-2 text-sm text-slate-400">
            Es gibt noch keine Tippgemeinschaft fuer deinen Account. Lege sie im Admin-Bereich an, du wirst automatisch Admin.
          </p>
          <LinkButton href="/einstellungen" className="mt-5">Admin-Bereich oeffnen</LinkButton>
        </Panel>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Aktueller Jackpot" value={formatCurrency(nextDraw?.jackpot ?? 0)} trend="Eurojackpot" icon={Euro} tone="gold" />
        <MetricCard label="Naechste Ziehung" value={nextDraw ? formatDate(nextDraw.date) : "offen"} trend={`${app.tickets.length} Tippfelder`} icon={CalendarClock} tone="violet" />
        <MetricCard label="Aktive Mitspieler" value={`${app.totals.activeMembers}`} trend={app.group?.name ?? "Noch keine Gruppe"} icon={Users} tone="green" />
        <MetricCard label="Offene Zahlungen" value={formatCurrency(app.totals.openPayments)} trend={`${openPayments.length} offene Beitraege`} icon={CreditCard} tone="blue" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Panel className="premium-ring overflow-hidden">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-200">{app.group?.name ?? "LottoCrew"}</p>
              <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-normal text-white md:text-5xl">
                {formatCurrency(nextDraw?.jackpot ?? 0)} fuer eure naechste Eurojackpot-Runde.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                Alle Kennzahlen kommen direkt aus eurer Supabase-Gruppe.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live-Fokus</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {["--", "--", "--"].map((part, index) => (
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
                  <p className="text-xs text-slate-400">{formatDate(payment.month)}</p>
                </div>
                <p className="font-semibold text-amber-100">{formatCurrency(payment.amount)}</p>
              </Surface>
            ))}
            {openPayments.length === 0 ? <Surface className="text-sm text-slate-500">Keine offenen Zahlungen.</Surface> : null}
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
            <StatusPill status="submitted" />
          </div>
          <div className="mt-5 space-y-3">
            {app.tickets.slice(0, 3).map((ticket) => (
              <Surface key={ticket.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{ticket.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{ticket.id} - {ticket.date ? formatDate(ticket.date) : "ohne Ziehung"}</p>
                  </div>
                  <StatusPill status={ticket.status as "planned" | "submitted" | "evaluated"} />
                </div>
                <div className="mt-4">
                  <NumberRow numbers={ticket.numbers} euroNumbers={ticket.euroNumbers} />
                </div>
              </Surface>
            ))}
            {app.tickets.length === 0 ? (
              <Surface className="py-10 text-center text-sm text-slate-500">Noch keine Tipps vorhanden.</Surface>
            ) : null}
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
          <ChartBars monthlyStats={app.monthlyStats} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Surface>
              <p className="text-sm text-slate-400">Letzter Gewinn</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(app.totals.lastWinnings)}</p>
            </Surface>
            <Surface>
              <p className="text-sm text-slate-400">Gesamt historisch</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(app.totals.totalWinnings)}</p>
            </Surface>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
