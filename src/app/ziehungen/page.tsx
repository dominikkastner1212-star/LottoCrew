import { CalendarPlus, CheckCircle2, CircleAlert, CircleDashed } from "lucide-react";
import { closeDraw } from "@/app/actions";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AdminDisclosure } from "@/components/admin-disclosure";
import { CreateDrawForm, EvaluateDrawForm } from "@/components/admin-forms";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { StatusPill } from "@/components/status-pill";
import { ActionForm } from "@/components/ui/action-form";
import { EmptyState, Panel, Surface } from "@/components/ui/panel";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAppContext } from "@/lib/auth-guard";
import type { AppDraw, AppTicket } from "@/lib/app-data";
import { buildDrawCompletion } from "@/lib/draw-completion";
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
    return "Lege oder sammle zuerst Tipps für diese Ziehung. Erst danach lohnt sich die Auswertung.";
  }
  if (draw.status !== "evaluated") {
    return "Tipps sind vorhanden. Nach der Ziehung kannst du diese Runde auswerten.";
  }
  if (drawTickets.some((ticket) => ticket.prizeRank && ticket.winnings <= 0)) {
    return "Gewinnklasse erkannt. Trage den Betrag unter Kasse nach, sobald er feststeht.";
  }
  return "Diese Ziehung ist abgearbeitet.";
}

export default async function DrawsPage() {
  const app = await requireAppContext({ includeTicketImageUrls: false, includeWinnings: false });

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
            const completion = buildDrawCompletion({
              draw,
              tickets: app.tickets,
              payments: app.payments,
              activeMemberCount: app.totals.activeMembers,
            });
            return (
              <StaggerItem key={draw.id}>
            <Surface className="min-h-52">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-amber-600">Eurojackpot</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">{formatCurrency(draw.jackpot)}</h2>
                  <p className="mt-2 text-sm text-slate-500">{formatDate(draw.date)}</p>
                </div>
                <StatusPill status={draw.closedAt ? "closed" : draw.status as "planned" | "submitted" | "evaluated"} />
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
              <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-white p-3 text-center">
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
                  <p className="text-xs text-slate-500">geprüft</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">Rundenabschluss</p>
                  <span className="text-xs font-semibold text-slate-500">
                    {completion.isClosed ? "abgeschlossen" : completion.canClose ? "bereit zum Abschluss" : `${completion.missingItems.length} offen`}
                  </span>
                </div>
                <ol className="mt-3 grid gap-2">
                  {completion.items.map((item) => (
                    <li key={item.key} className="flex gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
                      {item.done ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      ) : item.key === "draw_closed" ? (
                        <CircleDashed className="mt-0.5 size-4 shrink-0 text-slate-400" />
                      ) : (
                        <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                      )}
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">{item.description}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{completion.paymentSummary.existing}</p>
                    <p className="text-xs text-slate-500">Beiträge</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-amber-700">{completion.paymentSummary.open}</p>
                    <p className="text-xs text-slate-500">offen</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-emerald-700">{completion.paymentSummary.paid}</p>
                    <p className="text-xs text-slate-500">bezahlt</p>
                  </div>
                </div>
                {app.isAdmin ? (
                  <div className="mt-3">
                    <ActionForm action={closeDraw} successMessage="Runde abgeschlossen." resetOnSuccess={false}>
                      <input type="hidden" name="group_id" value={app.group?.id ?? ""} />
                      <input type="hidden" name="draw_id" value={draw.id} />
                      <SubmitButton disabled={!completion.canClose} pendingLabel="Wird abgeschlossen...">
                        Runde abschließen
                      </SubmitButton>
                    </ActionForm>
                    {!completion.canClose && !completion.isClosed ? (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Noch offen: {completion.missingItems.map((item) => item.label).join(", ")}.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {app.isAdmin ? <p className="mt-4 text-sm leading-5 text-slate-600">{getAdminHint(draw, drawTickets)}</p> : null}
            </Surface>
            </StaggerItem>
            );
          })}
          {app.draws.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-4">
              <EmptyState
                icon={<CalendarPlus className="size-5" />}
                title="Noch keine Ziehung angelegt"
                description={
                  app.isAdmin
                    ? "Lege zuerst die nächste Eurojackpot-Ziehung an. Danach können Tipps erfasst und später ausgewertet werden."
                    : "Es ist noch keine Ziehung sichtbar. Sobald ein Admin eine Runde anlegt, erscheinen Datum, Jackpot und Tipps hier."
                }
              />
            </div>
          ) : null}
        </Stagger>
      </Panel>
    </AppShell>
  );
}
