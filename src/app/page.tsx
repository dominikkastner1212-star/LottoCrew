import { AlertCircle, CalendarClock, CreditCard, Euro, Trophy, Users, Wallet } from "lucide-react";
import { AppShell, PageHeader, QuickActionRail } from "@/components/app-shell";
import { AnimatedBalls } from "@/components/animated-balls";
import { ChartBars } from "@/components/chart-bars";
import { CountUpCurrency } from "@/components/count-up-currency";
import { DrawCountdown } from "@/components/draw-countdown";
import { HeroRays } from "@/components/hero-rays";
import { MemberAvatars } from "@/components/member-avatars";
import { MetricCard } from "@/components/metric-card";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { NumberRow } from "@/components/number-row";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { PaymentReminderButton } from "@/components/payment-reminder";
import { StatusPill } from "@/components/status-pill";
import { Panel, Surface } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const app = await requireAppContext();
  const openPayments = app.payments.filter((payment) => payment.status === "open");
  const nextDraw = app.draws.find((draw) => new Date(draw.date) >= new Date()) ?? app.draws[0];
  const totalStake = app.tickets.reduce((sum, ticket) => sum + ticket.stake, 0);
  const returnRate = totalStake > 0 ? (app.totals.totalWinnings / totalStake) * 100 : 0;

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Alles Wichtige fuer die naechste Runde: Jackpot, Tipps, Guthaben, offene Beitraege und Gewinne."
      />

      <OnboardingChecklist app={app} />

      <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StaggerItem><MetricCard label="Aktueller Jackpot" value={formatCurrency(nextDraw?.jackpot ?? 0)} trend="Eurojackpot" icon={Euro} tone="gold" /></StaggerItem>
        <StaggerItem><MetricCard label="Naechste Ziehung" value={nextDraw ? formatDate(nextDraw.date) : "offen"} trend={`${app.tickets.length} Tippfelder`} icon={CalendarClock} tone="violet" /></StaggerItem>
        <StaggerItem><MetricCard label="Gruppenguthaben" value={formatCurrency(app.totals.groupBalance)} trend="Kasse gesamt" icon={Wallet} tone="green" /></StaggerItem>
        <StaggerItem><MetricCard label="Mein Guthaben" value={formatCurrency(app.totals.ownBalance)} trend={app.profile?.displayName ?? "Mitglied"} icon={Wallet} tone="blue" /></StaggerItem>
        <StaggerItem><MetricCard label="Aktive Mitspieler" value={`${app.totals.activeMembers}`} trend={app.group?.name ?? "Noch keine Gruppe"} icon={Users} tone="green" /></StaggerItem>
        <StaggerItem><MetricCard label="Offene Zahlungen" value={formatCurrency(app.totals.openPayments)} trend={`${openPayments.length} offene Beitraege`} icon={CreditCard} tone="blue" /></StaggerItem>
      </Stagger>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Panel className="premium-ring relative overflow-hidden">
          <HeroRays />
          <AnimatedBalls
            numbers={app.tickets[0]?.numbers?.length ? app.tickets[0].numbers.slice(0, 5) : [7, 12, 23, 34, 41]}
            euroNumbers={app.tickets[0]?.euroNumbers?.length ? app.tickets[0].euroNumbers.slice(0, 2) : [3, 9]}
            className="pointer-events-none absolute right-5 top-5 hidden gap-1.5 sm:flex"
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-600">{app.group?.name ?? "LottoCrew"}</p>
              <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-normal text-slate-900 md:text-5xl">
                <CountUpCurrency value={nextDraw?.jackpot ?? 0} /> fuer eure naechste Eurojackpot-Runde.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                Alle Kennzahlen kommen direkt aus eurer Supabase-Gruppe.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <MemberAvatars names={app.members.filter((member) => member.status === "active").map((member) => member.name)} />
                <span className="text-xs font-semibold text-slate-500">{app.totals.activeMembers} Mitspieler dabei</span>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live-Fokus</p>
              <DrawCountdown date={nextDraw?.date ?? null} />
            </div>
          </div>
          <div className="mt-6">
            <QuickActionRail />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Erinnerungen</h2>
              <p className="mt-1 text-sm text-slate-500">Offene Beitraege vor der Ziehung.</p>
            </div>
            <AlertCircle className="size-5 text-amber-600" />
          </div>
          <div className="mt-5 space-y-3">
            {openPayments.map((payment) => (
              <Surface key={payment.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{payment.member}</p>
                  <p className="text-xs text-slate-500">{formatDate(payment.month)}</p>
                </div>
                <p className="font-semibold text-amber-700">{formatCurrency(payment.amount)}</p>
              </Surface>
            ))}
            {openPayments.length === 0 ? <Surface className="text-sm text-slate-500">Keine offenen Zahlungen.</Surface> : null}
          </div>
          <PaymentReminderButton openCount={openPayments.length} />
        </Panel>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Aktive Tipps</h2>
              <p className="mt-1 text-sm text-slate-500">Mehrere Tipps pro Ziehung, sauber getrennt.</p>
            </div>
            <StatusPill status="submitted" />
          </div>
          <div className="mt-5 space-y-3">
            {app.tickets.slice(0, 3).map((ticket) => (
              <Surface key={ticket.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{ticket.label}</p>
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
              <h2 className="text-xl font-semibold text-slate-900">Gewinntrend</h2>
              <p className="mt-1 text-sm text-slate-500">Einsaetze und Gewinne im Monatsvergleich.</p>
            </div>
            <Trophy className="size-5 text-amber-600" />
          </div>
          <ChartBars monthlyStats={app.monthlyStats} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Surface>
              <p className="text-sm text-slate-500">Letzter Gewinn</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(app.totals.lastWinnings)}</p>
            </Surface>
            <Surface>
              <p className="text-sm text-slate-500">Gesamt historisch</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(app.totals.totalWinnings)}</p>
            </Surface>
            <Surface>
              <p className="text-sm text-slate-500">Gesamteinsaetze</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalStake)}</p>
            </Surface>
            <Surface>
              <p className="text-sm text-slate-500">Rueckflussquote</p>
              <p className="mt-2 text-2xl font-semibold text-amber-700">{returnRate.toFixed(1)}%</p>
            </Surface>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
