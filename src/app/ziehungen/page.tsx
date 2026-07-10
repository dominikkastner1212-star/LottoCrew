import { AppShell, PageHeader } from "@/components/app-shell";
import { AdminDisclosure } from "@/components/admin-disclosure";
import { CreateDrawForm, EvaluateDrawForm } from "@/components/admin-forms";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { StatusPill } from "@/components/status-pill";
import { Panel, Surface } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";
import type { AppDraw, AppTicket } from "@/lib/app-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function getDrawCheckStatus(draw: AppDraw, tickets: AppTicket[]) {
  const checked = draw.status === "evaluated" || draw.resultNumbers.length > 0 || draw.resultEuroNumbers.length > 0;
  if (!checked) {
    return "unchecked" as const;
  }

  const drawTickets = tickets.filter((ticket) => ticket.drawId === draw.id);
  const prizeTickets = drawTickets.filter((ticket) => ticket.prizeRank);

  if (prizeTickets.length === 0) {
    return "no_win" as const;
  }

  if (prizeTickets.some((ticket) => ticket.winnings <= 0)) {
    return "amount_open" as const;
  }

  return "evaluated" as const;
}

function getAdminHint(draw: AppDraw, drawTickets: AppTicket[]) {
  if (drawTickets.length === 0) {
    return "Noch keine Tipps fuer diese Ziehung eingetragen.";
  }
  if (draw.status !== "evaluated") {
    return "Tipps sind vorhanden. Nach der Ziehung manuell auswerten.";
  }
  if (drawTickets.some((ticket) => ticket.prizeRank && ticket.winnings <= 0)) {
    return "Gewinnklasse erkannt. Betrag noch unter Kasse erfassen.";
  }
  return "Diese Ziehung ist abgearbeitet.";
}

export default async function DrawsPage() {
  const app = await requireAppContext();

  return (
    <AppShell>
      <PageHeader
        title="Ziehungen"
        description="Eurojackpot-Jackpots, Ziehungsdaten und Auswertung der gespielten Runden."
      />
      <Panel>
        {app.group && app.isAdmin ? (
          <div className="mb-5 grid gap-3">
            <AdminDisclosure label="Ziehung anlegen">
              <CreateDrawForm groupId={app.group.id} isAdmin={app.isAdmin} />
            </AdminDisclosure>
            <AdminDisclosure label="Manuell auswerten">
              <EvaluateDrawForm groupId={app.group.id} draws={app.draws} isAdmin={app.isAdmin} />
            </AdminDisclosure>
          </div>
        ) : null}
        <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {app.draws.map((draw) => {
            const drawTickets = app.tickets.filter((ticket) => ticket.drawId === draw.id);
            const checkStatus = getDrawCheckStatus(draw, app.tickets);
            const openTickets = drawTickets.filter((ticket) => ticket.status !== "evaluated").length;
            const evaluatedTickets = drawTickets.length - openTickets;
            return (
              <StaggerItem key={draw.id}>
            <Surface className="min-h-52">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-amber-600">Eurojackpot</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">{formatCurrency(draw.jackpot)}</h2>
                  <p className="mt-2 text-sm text-slate-500">{formatDate(draw.date)}</p>
                </div>
                <StatusPill status={draw.status as "planned" | "submitted" | "evaluated"} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill status={checkStatus} />
              </div>
              {draw.resultNumbers.length ? (
                <div className="mt-5 rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Gezogen</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {draw.resultNumbers.join(" ")} <span className="text-amber-600">+ {draw.resultEuroNumbers.join(" ")}</span>
                  </p>
                </div>
              ) : null}
              <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{drawTickets.length}</p>
                  <p className="text-xs text-slate-500">Tipps</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{openTickets}</p>
                  <p className="text-xs text-slate-500">offen</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{evaluatedTickets}</p>
                  <p className="text-xs text-slate-500">geprueft</p>
                </div>
              </div>
              {app.isAdmin ? <p className="mt-4 text-sm leading-5 text-slate-600">{getAdminHint(draw, drawTickets)}</p> : null}
            </Surface>
            </StaggerItem>
            );
          })}
          {app.draws.length === 0 ? (
            <Surface className="py-10 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-4">Noch keine Ziehungen vorhanden.</Surface>
          ) : null}
        </Stagger>
      </Panel>
    </AppShell>
  );
}
