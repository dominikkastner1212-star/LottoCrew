import { AppShell, PageHeader } from "@/components/app-shell";
import { AdminDisclosure } from "@/components/admin-disclosure";
import { CreateDrawForm, EvaluateDrawForm } from "@/components/admin-forms";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { Panel, Surface } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";
import type { AppDraw, AppTicket } from "@/lib/app-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function getDrawCheckStatus(draw: AppDraw, tickets: AppTicket[]) {
  const checked = draw.status === "evaluated" || draw.resultNumbers.length > 0 || draw.resultEuroNumbers.length > 0;
  if (!checked) {
    return { label: "noch nicht geprueft", className: "border-slate-200 bg-slate-50 text-slate-600" };
  }

  const drawTickets = tickets.filter((ticket) => ticket.drawId === draw.id);
  const prizeTickets = drawTickets.filter((ticket) => ticket.prizeRank);

  if (prizeTickets.length === 0) {
    return { label: "kein Gewinn", className: "border-slate-200 bg-slate-50 text-slate-600" };
  }

  if (prizeTickets.some((ticket) => ticket.winnings <= 0)) {
    return { label: "Gewinnklasse erkannt, Betrag offen", className: "border-amber-200 bg-amber-50 text-amber-800" };
  }

  return { label: "geprueft", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
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
            const checkStatus = getDrawCheckStatus(draw, app.tickets);
            return (
              <StaggerItem key={draw.id}>
            <Surface className="min-h-52">
              <p className="text-sm font-semibold text-amber-600">Eurojackpot</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(draw.jackpot)}</h2>
              <p className="mt-3 text-sm text-slate-500">{formatDate(draw.date)}</p>
              <span className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${checkStatus.className}`}>
                {checkStatus.label}
              </span>
              {draw.resultNumbers.length ? (
                <div className="mt-5 rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Gezogen</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {draw.resultNumbers.join(" ")} <span className="text-amber-600">+ {draw.resultEuroNumbers.join(" ")}</span>
                  </p>
                </div>
              ) : null}
              <div className="mt-8 h-2 rounded-full bg-slate-100">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-300 to-violet-500" />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{draw.status}</p>
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
