import { Download, FileDown } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AdminDisclosure } from "@/components/admin-disclosure";
import { CreateLedgerTransactionForm, CreateMonthlyPaymentsForm, CreatePaymentForm, CreateWinningForm } from "@/components/admin-forms";
import { CashSummary, MemberBalanceBoard, TransactionHistory } from "@/components/cash-ledger";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { PaymentsBoard } from "@/components/payments-board";
import { WinConfetti } from "@/components/win-confetti";
import { LinkButton } from "@/components/ui/button";
import { Panel, Surface } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function KassePage() {
  const app = await requireAppContext();

  return (
    <AppShell>
      <PageHeader
        title="Kasse"
        description="Guthaben, Beitraege und Gewinne an einem Ort - transparent fuer die ganze Runde."
        action={
          <>
            <LinkButton href="/api/export/payments.csv" variant="secondary"><Download className="size-4" />Beitraege CSV</LinkButton>
            <LinkButton href="/api/export/winnings.pdf" variant="secondary"><FileDown className="size-4" />Gewinne PDF</LinkButton>
          </>
        }
      />

      <Panel>
        <h2 className="text-lg font-semibold text-slate-900">Kassenstand</h2>
        <div className="mt-5">
          <CashSummary totals={app.totals.transactions} />
        </div>
      </Panel>

      <Panel className="mt-5">
        <h2 className="text-lg font-semibold text-slate-900">{app.isAdmin ? "Guthaben je Mitglied" : "Mein Guthaben"}</h2>
        {app.group && app.isAdmin ? (
          <div className="mt-4">
            <AdminDisclosure label="Einzahlung oder Korrektur buchen">
              <CreateLedgerTransactionForm groupId={app.group.id} members={app.members} isAdmin={app.isAdmin} />
            </AdminDisclosure>
          </div>
        ) : null}
        <div className="mt-5">
          <MemberBalanceBoard balances={app.memberBalances} />
        </div>
      </Panel>

      <Panel className="mt-5">
        <h2 className="text-lg font-semibold text-slate-900">Transaktionshistorie</h2>
        <div className="mt-5">
          <TransactionHistory transactions={app.transactions} />
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
                {winning.tippedBy ? <span className="text-slate-400"> · getippt von {winning.tippedBy}</span> : null}
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
            <Surface className="py-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-4">Noch keine Gewinne vorhanden.</Surface>
          ) : null}
        </Stagger>
      </Panel>

      <Panel className="mt-5">
        <h2 className="text-lg font-semibold text-slate-900">Beitraege</h2>
        {app.group && app.isAdmin ? (
          <div className="mt-4 grid gap-3">
            <AdminDisclosure label="Monatsbeitraege fuer alle erzeugen">
              <CreateMonthlyPaymentsForm groupId={app.group.id} isAdmin={app.isAdmin} />
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
    </AppShell>
  );
}
