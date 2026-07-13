import { AlertCircle, CalendarClock, CreditCard, Euro, ListChecks, Target, Trophy, Users } from "lucide-react";
import { AppShell, PageHeader, QuickActionRail } from "@/components/app-shell";
import { AdminWorkflowChecklist } from "@/components/admin-workflow-checklist";
import { AnimatedBalls } from "@/components/animated-balls";
import { ChartBars } from "@/components/chart-bars";
import { CountUpCurrency } from "@/components/count-up-currency";
import { DrawCountdown } from "@/components/draw-countdown";
import { HeroRays } from "@/components/hero-rays";
import { MemberAvatars } from "@/components/member-avatars";
import { MetricCard } from "@/components/metric-card";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { NumberRow } from "@/components/number-row";
import { PaymentReminderButton } from "@/components/payment-reminder";
import { StatusPill } from "@/components/status-pill";
import { EmptyState, Panel, Surface } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const app = await requireAppContext({ includeTicketImageUrls: false });
  const openPayments = app.payments.filter((payment) => payment.status === "open");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextOpenDraw =
    app.draws.find((draw) => draw.status !== "evaluated" && new Date(draw.date) >= today) ??
    app.draws.find((draw) => draw.status !== "evaluated") ??
    null;
  const nextDraw = nextOpenDraw ?? app.draws[0];
  const nextDrawTickets = nextDraw ? app.tickets.filter((ticket) => ticket.drawId === nextDraw.id) : [];
  const unevaluatedDraws = app.draws.filter((draw) => draw.status !== "evaluated" && new Date(draw.date) <= today);
  const unclosedPastDraws = app.draws.filter((draw) => !draw.closedAt && new Date(draw.date) <= today);
  const openAmountWinnings = app.winnings.filter((winning) => winning.amount <= 0);
  const totalStake = app.tickets.reduce((sum, ticket) => sum + ticket.stake, 0);
  const returnRate = totalStake > 0 ? (app.totals.totalWinnings / totalStake) * 100 : 0;
  const heroTicket = nextDrawTickets[0] ?? app.tickets[0] ?? null;

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Alles Wichtige für die nächste Runde: Ziehung, Tipps, offene Beiträge und Gewinne."
      />

      <AdminWorkflowChecklist app={app} />

      {app.isAdmin && unclosedPastDraws.length > 0 ? (
        <Panel className="mb-5 border-amber-200 bg-amber-50/70">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Eine vergangene Runde ist noch nicht abgeschlossen.</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Prüfe die Checkliste auf der Ziehungsseite und schließe die Runde ab, sobald Auswertung, Beiträge und Gewinnprüfung erledigt sind.
              </p>
            </div>
            <StatusPill status="open" />
          </div>
        </Panel>
      ) : null}

      <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StaggerItem><MetricCard label="Aktueller Jackpot" value={formatCurrency(nextDraw?.jackpot ?? 0)} trend="Eurojackpot" icon={Euro} tone="gold" /></StaggerItem>
        <StaggerItem><MetricCard label="Nächste offene Ziehung" value={nextOpenDraw ? formatDate(nextOpenDraw.date) : "keine"} trend={nextOpenDraw?.status ?? "alles ausgewertet"} icon={CalendarClock} tone="violet" /></StaggerItem>
        <StaggerItem><MetricCard label="Tipps nächste Ziehung" value={`${nextDrawTickets.length}`} trend={nextDraw ? formatDate(nextDraw.date) : "keine Ziehung"} icon={Target} tone="green" /></StaggerItem>
        <StaggerItem><MetricCard label="Aktive Mitspieler" value={`${app.totals.activeMembers}`} trend={app.group?.name ?? "Noch keine Gruppe"} icon={Users} tone="green" /></StaggerItem>
        <StaggerItem><MetricCard label="Offene Zahlungen" value={formatCurrency(app.totals.openPayments)} trend={`${openPayments.length} offene Beiträge`} icon={CreditCard} tone="blue" /></StaggerItem>
        <StaggerItem><MetricCard label="Auswertung offen" value={`${unevaluatedDraws.length}`} trend={openAmountWinnings.length ? `${openAmountWinnings.length} Gewinnbetrag offen` : "keine Beträge offen"} icon={ListChecks} tone="violet" /></StaggerItem>
      </Stagger>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Panel className="premium-ring relative overflow-hidden">
          <HeroRays />
          {heroTicket ? (
            <AnimatedBalls
              numbers={heroTicket.numbers.slice(0, 5)}
              euroNumbers={heroTicket.euroNumbers.slice(0, 2)}
              className="pointer-events-none absolute right-5 top-5 hidden gap-1.5 sm:flex"
            />
          ) : null}
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-600">{app.group?.name ?? "LottoCrew"}</p>
              <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-normal text-slate-900 sm:text-4xl md:text-5xl">
                <CountUpCurrency value={nextDraw?.jackpot ?? 0} /> für eure nächste Eurojackpot-Runde.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                Alle Kennzahlen kommen direkt aus eurer Gruppe.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <MemberAvatars names={app.members.filter((member) => member.status === "active").map((member) => member.name)} />
                <span className="text-xs font-semibold text-slate-500">{app.totals.activeMembers} Mitspieler dabei</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 lg:min-w-56">
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
              <p className="mt-1 text-sm text-slate-500">Offene Beiträge vor der Ziehung.</p>
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
            {openPayments.length === 0 ? (
              <EmptyState
                icon={<CreditCard className="size-5" />}
                title="Keine offenen Zahlungen"
                description="Aktuell ist alles abgehakt. Sobald neue Monatsbeiträge erzeugt werden, erscheinen offene Zahlungen hier."
                className="py-7"
              />
            ) : null}
          </div>
          <PaymentReminderButton openCount={openPayments.length} />
        </Panel>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Aktive Tipps</h2>
              <p className="mt-1 text-sm text-slate-500">Für die nächste relevante Ziehung.</p>
            </div>
            <StatusPill status={nextDraw?.status === "evaluated" ? "evaluated" : "submitted"} />
          </div>
          <div className="mt-5 space-y-3">
            {nextDrawTickets.slice(0, 3).map((ticket) => (
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
            {nextDrawTickets.length === 0 ? (
              <EmptyState
                icon={<Target className="size-5" />}
                title={nextDraw ? "Noch keine Tipps für diese Ziehung" : "Noch keine Ziehung angelegt"}
                description={
                  nextDraw
                    ? "Sobald Tipps für diese Runde gespeichert sind, erscheinen sie hier mit Zahlen und Status."
                    : "Lege zuerst eine Ziehung an. Danach können Tipps erfasst werden."
                }
              />
            ) : null}
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Gewinntrend</h2>
              <p className="mt-1 text-sm text-slate-500">Einsätze und Gewinne im Monatsvergleich.</p>
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
              <p className="text-sm text-slate-500">Gesamteinsätze</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalStake)}</p>
            </Surface>
            <Surface>
              <p className="text-sm text-slate-500">Rückflussquote</p>
              <p className="mt-2 text-2xl font-semibold text-amber-700">{returnRate.toFixed(1)}%</p>
            </Surface>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
