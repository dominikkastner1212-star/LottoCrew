"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";

import { updatePaymentStatus } from "@/app/actions";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { StatusPill } from "@/components/status-pill";
import { SubmitButton } from "@/components/ui/submit-button";
import { Surface } from "@/components/ui/panel";
import type { AppPayment } from "@/lib/app-data";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusFilters = ["alle", "open", "paid"] as const;
const statusLabels = {
  alle: "alle",
  open: "offen",
  paid: "bezahlt",
};

export function PaymentsBoard({ payments, groupId, isAdmin }: { payments: AppPayment[]; groupId: string; isAdmin: boolean }) {
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("alle");
  const [month, setMonth] = useState("alle");
  const months = useMemo(() => Array.from(new Set(payments.map((payment) => payment.month.slice(0, 7)))).sort().reverse(), [payments]);
  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) => {
        const matchesStatus = status === "alle" || payment.status === status;
        const matchesMonth = month === "alle" || payment.month.slice(0, 7) === month;
        return matchesStatus && matchesMonth;
      }),
    [month, payments, status],
  );
  const visibleOpenAmount = filteredPayments
    .filter((payment) => payment.status === "open")
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div>
      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
          {statusFilters.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatus(option)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                status === option ? "bg-amber-100 text-slate-900" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {statusLabels[option]}
            </button>
          ))}
        </div>
        <select
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-amber-400"
        >
          <option value="alle">Alle Monate</option>
          {months.map((monthValue) => (
            <option key={monthValue} value={monthValue}>
              {formatDate(`${monthValue}-01`)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span>{filteredPayments.length} Zahlung{filteredPayments.length === 1 ? "" : "en"} sichtbar</span>
        <span className="font-semibold text-amber-700">Offen sichtbar: {formatCurrency(visibleOpenAmount)}</span>
      </div>

      <Stagger className="grid gap-3">
      {filteredPayments.map((payment) => (
        <StaggerItem key={payment.id}>
        <Surface className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center">
          <div>
            <p className="font-semibold text-slate-900">{payment.member}</p>
            <p className="mt-1 text-sm text-slate-500">{payment.month}</p>
          </div>
          <StatusPill status={payment.status} />
          <p className="font-semibold text-slate-900 md:text-right">{formatCurrency(payment.amount)}</p>
          <p className="text-sm text-slate-500 md:text-right">{payment.paidAt ? formatDate(payment.paidAt) : "Noch offen"}</p>
          {isAdmin ? (
            <form action={updatePaymentStatus}>
              <input type="hidden" name="group_id" value={groupId} />
              <input type="hidden" name="payment_id" value={payment.id} />
              <input type="hidden" name="status" value={payment.status === "paid" ? "open" : "paid"} />
              <SubmitButton variant={payment.status === "paid" ? "secondary" : "primary"} className="min-w-36" pendingLabel="...">
                <Check className="size-4" />
                {payment.status === "paid" ? "Wieder offen" : "Als bezahlt markieren"}
              </SubmitButton>
            </form>
          ) : null}
        </Surface>
        </StaggerItem>
      ))}
      {filteredPayments.length === 0 ? (
        <Surface className="py-10 text-center text-sm text-slate-500">
          Keine Zahlungen für diese Auswahl vorhanden.
        </Surface>
      ) : null}
    </Stagger>
    </div>
  );
}
