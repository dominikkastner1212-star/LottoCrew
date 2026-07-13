import { Bot, CalendarClock, CheckCircle2, ClipboardList, CreditCard, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { StatusPill } from "@/components/status-pill";
import { EmptyState, Panel, Surface } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";
import { buildAssistantReport, type AssistantTask } from "@/lib/report-assistant";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const metricIcons = [CalendarClock, CreditCard, ClipboardList, Trophy, Sparkles];

function TaskList({ tasks }: { tasks: AssistantTask[] }) {
  const openTasks = tasks.filter((task) => !task.done);

  if (openTasks.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="size-5" />}
        title="Keine offenen To-dos"
        description="Alle aktuell erkennbaren Punkte sind erledigt. Der Bericht aktualisiert sich automatisch mit neuen Ziehungen, Tipps, Zahlungen und Gewinnen."
        className="py-7"
      />
    );
  }

  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <Link
          key={task.title}
          href={task.href}
          className={cn(
            "flex items-start gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5",
            task.done
              ? "border-emerald-200 bg-emerald-50/70"
              : task.urgent
                ? "border-amber-200 bg-amber-50"
                : "border-slate-200 bg-slate-50",
          )}
        >
          <span
            className={cn(
              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
              task.done ? "bg-emerald-100 text-emerald-700" : task.urgent ? "bg-amber-200 text-amber-800" : "bg-white text-slate-500",
            )}
          >
            {task.done ? <CheckCircle2 className="size-4" /> : <ClipboardList className="size-4" />}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-900">{task.title}</span>
            <span className="mt-1 block text-sm leading-5 text-slate-600">{task.detail}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export default async function ReportsPage() {
  const app = await requireAppContext({ includeTicketImageUrls: false });
  const report = buildAssistantReport(app);
  const memberOpenAmount = report.memberOpenPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <AppShell>
      <PageHeader
        title="Berichte"
        description="Smarte Zusammenfassungen aus euren vorhandenen LottoCrew-Daten - regelbasiert und ohne externe KI."
      />

      <Panel className="overflow-hidden border-amber-200">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-start gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-amber-100 text-amber-700">
                <Bot className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-700">Regel-Assistent</p>
                <h2 className="text-2xl font-semibold text-slate-900">Was steht als Nächstes an?</h2>
              </div>
            </div>
            <p className="mt-5 text-base leading-7 text-slate-700 sm:text-lg">{report.summary}</p>
          </div>
          <Surface className="bg-amber-50/70 lg:w-80">
            <p className="text-sm font-semibold text-slate-900">Wichtigste Aufgabe</p>
            <p className="mt-2 text-xl font-semibold leading-7 text-amber-800 sm:text-2xl">{app.isAdmin ? report.adminFocus : "Eigene Übersicht prüfen"}</p>
            <p className="mt-2 text-sm leading-5 text-slate-500">
              {app.isAdmin ? "Aus offenen Datenpunkten berechnet." : "Fokus auf sichtbare Beiträge, Tipps und Ergebnisse."}
            </p>
          </Surface>
        </div>
      </Panel>

      <Stagger className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {report.metrics.map((metric, index) => {
          const Icon = metricIcons[index] ?? Sparkles;
          return (
            <StaggerItem key={metric.label}>
              <Surface className="h-full">
                <Icon className="size-5 text-amber-600" />
                <p className="mt-3 text-sm text-slate-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{metric.detail}</p>
              </Surface>
            </StaggerItem>
          );
        })}
      </Stagger>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_.85fr]">
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{app.isAdmin ? "Admin-To-dos" : "Meine Zusammenfassung"}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {app.isAdmin ? "Aus echten Gruppen-, Tipp-, Zahlungs- und Gewinn-Daten berechnet." : "Deine sichtbaren Punkte für die nächste Runde."}
              </p>
            </div>
            <StatusPill status={app.isAdmin && report.adminTasks.some((task) => !task.done) ? "open" : "paid"} />
          </div>
          <div className="mt-5">
            <TaskList tasks={app.isAdmin ? report.adminTasks : report.memberSummaryItems} />
          </div>
        </Panel>

        <Panel>
          <h2 className="text-xl font-semibold text-slate-900">Details</h2>
          <div className="mt-5 grid gap-3">
            <Surface>
              <p className="text-sm font-semibold text-slate-900">Nächste Ziehung</p>
              <p className="mt-2 text-sm text-slate-600">
                {report.nextDraw
                  ? `${formatDate(report.nextDraw.date)} mit ${report.nextDrawTickets.length} Tipp${report.nextDrawTickets.length === 1 ? "" : "s"}.`
                  : "Keine offene Ziehung vorhanden."}
              </p>
            </Surface>
            <Surface>
              <p className="text-sm font-semibold text-slate-900">Offene Beiträge</p>
              <p className="mt-2 text-sm text-slate-600">
                {app.isAdmin
                  ? `${report.openPayments.length} offen, insgesamt ${formatCurrency(app.totals.openPayments)}.`
                  : `${report.memberOpenPayments.length} für dich sichtbar, insgesamt ${formatCurrency(memberOpenAmount)}.`}
              </p>
            </Surface>
            <Surface>
              <p className="text-sm font-semibold text-slate-900">Letzte Auswertung</p>
              <p className="mt-2 text-sm text-slate-600">
                {report.lastEvaluatedDraw ? formatDate(report.lastEvaluatedDraw.date) : "Noch keine Ziehung ausgewertet."}
              </p>
            </Surface>
            <Surface>
              <p className="text-sm font-semibold text-slate-900">Letzter Gewinn</p>
              <p className="mt-2 text-sm text-slate-600">
                {report.lastWinning ? `${report.lastWinning.rank}: ${formatCurrency(report.lastWinning.amount)}.` : "Noch kein Gewinn erfasst."}
              </p>
            </Surface>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
