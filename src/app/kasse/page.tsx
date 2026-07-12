import { CheckCircle2, Clock3, Download, FileDown, Trophy } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AdminDisclosure } from "@/components/admin-disclosure";
import { CreateMonthlyPaymentsForm, CreatePaymentForm, CreateWinningForm } from "@/components/admin-forms";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { PaymentsBoard } from "@/components/payments-board";
import { WinConfetti } from "@/components/win-confetti";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, Panel, Surface } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function KassePage() {
  const app = await requireAppContext();
  const openPayments = app.payments.filter((payment) => payment.status === "open");
  const paidPayments = app.payments.filter((payment) => payment.status === "paid");
  const openPaymentAmount = openPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidPaymentAmount = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthPayments = app.payments.filter((payment) => payment.month.slice(0, 7) === currentMonth);

  return (
    <AppShell>
      <PageHeader
        title="Kasse"
        description="Beiträge, offene Zahlungen und Gewinne an einem Ort - im bestehenden Zahlungsmodell."
        action={
          <>
            <LinkButton href="/api/export/payments.csv" variant="secondary" className="w-full sm:w-auto"><Download className="size-4" />Beiträge CSV</LinkButton>
            <LinkButton href="/api/export/winnings.pdf" variant="secondary" className="w-full sm:w-auto"><FileDown className="size-4" />Gewinne PDF</LinkButton>
          </>
        }
      />

      <Panel>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Beitragsübersicht</h2>
            <p className="mt-1 text-sm text-slate-500">Monatsbeiträge bleiben vom Gewinnbereich getrennt.</p>
          </div>
        </div>
        <Stagger className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StaggerItem>
            <Surface>
              <Clock3 className="size-5 text-amber-600" />
              <p className="mt-3 text-sm text-slate-500">Offene Beiträge</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(openPaymentAmount)}</p>
              <p className="mt-1 text-xs text-slate-500">{openPayments.length} Zahlung{openPayments.length === 1 ? "" : "en"} offen</p>
            </Surface>
          </StaggerItem>
          <StaggerItem>
            <Surface>
              <CheckCircle2 className="size-5 text-emerald-600" />
              <p className="mt-3 text-sm text-slate-500">Bezahlt</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(paidPaymentAmount)}</p>
              <p className="mt-1 text-xs text-slate-500">{paidPayments.length} Zahlung{paidPayments.length === 1 ? "" : "en"} bezahlt</p>
            </Surface>
          </StaggerItem>
          <StaggerItem>
            <Surface>
              <Clock3 className="size-5 text-sky-600" />
              <p className="mt-3 text-sm text-slate-500">Aktueller Monat</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{currentMonthPayments.length}</p>
              <p className="mt-1 text-xs text-slate-500">Beiträge angelegt</p>
            </Surface>
          </StaggerItem>
          <StaggerItem>
            <Surface>
              <Trophy className="size-5 text-amber-600" />
              <p className="mt-3 text-sm text-slate-500">Gewinne gesamt</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(app.totals.totalWinnings)}</p>
              <p className="mt-1 text-xs text-slate-500">{app.winnings.length} Gewinn{app.winnings.length === 1 ? "" : "e"} erfasst</p>
            </Surface>
          </StaggerItem>
        </Stagger>
        {currentMonthPayments.length === 0 && app.isAdmin ? (
          <EmptyState
            className="mt-4"
            icon={<Clock3 className="size-5" />}
            title="Für diesen Monat fehlen Beiträge"
            description="Erzeuge die Monatsbeiträge, damit offene Zahlungen für alle aktiven Mitglieder sichtbar werden."
          />
        ) : null}
      </Panel>

      <Panel className="mt-5">
        <h2 className="text-lg font-semibold text-slate-900">Beiträge und Zahlungen</h2>
        {app.group && app.isAdmin ? (
          <div className="mt-4 grid gap-3">
            <AdminDisclosure label="Monatsbeiträge erzeugen">
              <CreateMonthlyPaymentsForm app={app} />
            </AdminDisclosure>
            <AdminDisclosure label="Einzelne Zahlung anlegen">
              <CreatePaymentForm groupId={app.group.id} members={app.members} isAdmin={app.isAdmin} />
            </AdminDisclosure>
          </div>
        ) : null}
        <div className="mt-5">
          <PaymentsBoard payments={app.payments} groupId={app.group?.id ?? ""} isAdmin={app.isAdmin} />
        </div>
      </Panel>

      <Panel className="relative mt-5 overflow-hidden">
        {app.winnings.length > 0 ? <WinConfetti /> : null}
        <h2 className="text-lg font-semibold text-slate-900">Gewinne</h2>
        {app.group && app.isAdmin ? (
          <div className="mt-4">
            <AdminDisclosure label="Gewinn erfassen">
              <CreateWinningForm groupId={app.group.id} draws={app.draws} tickets={app.tickets} isAdmin={app.isAdmin} />
            </AdminDisclosure>
          </div>
        ) : null}
        <Stagger className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {app.winnings.map((winning) => (
            <StaggerItem key={winning.id}>
            <Surface>
              <p className="text-sm font-semibold text-emerald-700">{winning.rank}</p>
              <h3 className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(winning.amount)}</h3>
              {winning.amount <= 0 ? (
                <p className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                  Gewinnklasse erkannt, Betrag noch offen
                </p>
              ) : null}
              <p className="mt-2 text-sm text-slate-500">
                {winning.ticket}
                {winning.tippedBy ? <span className="text-slate-400"> - getippt von {winning.tippedBy}</span> : null}
              </p>
              <div className="mt-6 rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Anteil pro Teilnehmer</p>
                <p className="mt-1 font-semibold text-amber-700">{formatCurrency(winning.perMember)}</p>
              </div>
              <p className="mt-4 text-xs text-slate-500">{formatDate(winning.date)}</p>
            </Surface>
            </StaggerItem>
          ))}
          {app.winnings.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-4">
              <EmptyState
                icon={<Trophy className="size-5" />}
                title="Noch keine Gewinne erfasst"
                description={
                  app.isAdmin
                    ? "Wenn eine Ziehung ausgewertet wurde und ein Gewinn feststeht, kannst du ihn hier erfassen."
                    : "Sobald ein Gewinn erfasst wurde, erscheint er hier mit Betrag und Anteil pro Teilnehmer."
                }
              />
            </div>
          ) : null}
        </Stagger>
      </Panel>
    </AppShell>
  );
}
