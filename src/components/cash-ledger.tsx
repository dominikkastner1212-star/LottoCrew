import { ArrowDownCircle, ArrowUpCircle, CircleDollarSign, RotateCcw } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { Surface } from "@/components/ui/panel";
import type { AppMemberBalance, AppMemberTransaction, AppTransactionTotals, AppTransactionType } from "@/lib/app-data";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const typeLabels: Record<AppTransactionType, string> = {
  deposit: "Einzahlung",
  ticket_stake: "Einsatz",
  winning_share: "Gewinnanteil",
  correction: "Korrektur",
};

const typeStyles: Record<AppTransactionType, string> = {
  deposit: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ticket_stake: "border-rose-200 bg-rose-50 text-rose-700",
  winning_share: "border-amber-200 bg-amber-50 text-amber-700",
  correction: "border-sky-200 bg-sky-50 text-sky-700",
};

function formatSignedCurrency(value: number) {
  if (value < 0) {
    return `-${formatCurrency(Math.abs(value))}`;
  }
  return `+${formatCurrency(value)}`;
}

export function CashSummary({ totals }: { totals: AppTransactionTotals }) {
  const items = [
    { label: "Gruppenguthaben", value: formatCurrency(totals.balance), detail: "Aktueller Saldo", icon: CircleDollarSign, tone: "text-slate-900" },
    { label: "Einzahlungen", value: formatCurrency(totals.deposits), detail: "Zufluss", icon: ArrowUpCircle, tone: "text-emerald-700" },
    { label: "Einsaetze", value: formatCurrency(totals.ticketStakes), detail: "Abfluss", icon: ArrowDownCircle, tone: "text-rose-700" },
    { label: "Gewinnanteile", value: formatCurrency(totals.winningShares), detail: "Zufluss", icon: ArrowUpCircle, tone: "text-amber-700" },
    { label: "Korrekturen", value: formatSignedCurrency(totals.corrections), detail: "Saldoanpassung", icon: RotateCcw, tone: totals.corrections < 0 ? "text-rose-700" : "text-sky-700" },
  ];

  return (
    <Stagger className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <StaggerItem key={item.label}>
            <Surface className="min-h-32">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                <Icon className={cn("size-5", item.tone)} />
              </div>
              <p className={cn("mt-4 text-2xl font-semibold", item.tone)}>{item.value}</p>
              <p className="mt-2 text-xs text-slate-500">{item.detail}</p>
            </Surface>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

export function MemberBalanceBoard({ balances }: { balances: AppMemberBalance[] }) {
  return (
    <Stagger className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {balances.map((balance) => (
        <StaggerItem key={balance.memberId}>
          <Surface>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{balance.member}</p>
                <p className="mt-1 text-xs text-slate-500">Saldo</p>
              </div>
              <p className={cn("text-lg font-semibold", balance.balance < 0 ? "text-rose-700" : "text-emerald-700")}>
                {formatCurrency(balance.balance)}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <p>Ein {formatCurrency(balance.deposits)}</p>
              <p>Einsatz {formatCurrency(balance.ticketStakes)}</p>
              <p>Gew. {formatCurrency(balance.winningShares)}</p>
              <p>Korr. {formatSignedCurrency(balance.corrections)}</p>
            </div>
          </Surface>
        </StaggerItem>
      ))}
      {balances.length === 0 ? (
        <Surface className="py-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-4">
          Noch keine Guthaben vorhanden.
        </Surface>
      ) : null}
    </Stagger>
  );
}

export function TransactionHistory({ transactions }: { transactions: AppMemberTransaction[] }) {
  return (
    <Stagger className="grid gap-3">
      {transactions.map((transaction) => (
        <StaggerItem key={transaction.id}>
          <Surface className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", typeStyles[transaction.type])}>
                  {typeLabels[transaction.type]}
                </span>
                <p className="font-semibold text-slate-900">{transaction.member}</p>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {transaction.description ?? transaction.ticket ?? transaction.winning ?? "Buchung"}
              </p>
              {transaction.ticket || transaction.winning ? (
                <p className="mt-1 text-xs text-slate-400">
                  {[transaction.ticket, transaction.winning].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>
            <p className="text-sm text-slate-500 md:text-right">{formatDate(transaction.createdAt)}</p>
            <p className={cn("text-lg font-semibold md:text-right", transaction.effect < 0 ? "text-rose-700" : "text-emerald-700")}>
              {formatSignedCurrency(transaction.effect)}
            </p>
          </Surface>
        </StaggerItem>
      ))}
      {transactions.length === 0 ? (
        <Surface className="py-10 text-center text-sm text-slate-500">
          Noch keine Transaktionen vorhanden.
        </Surface>
      ) : null}
    </Stagger>
  );
}
