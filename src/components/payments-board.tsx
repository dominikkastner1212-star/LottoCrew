"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/panel";
import { payments as seedPayments, type PaymentStatus } from "@/lib/sample-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export function PaymentsBoard() {
  const [paidIds, setPaidIds] = useState(() => new Set(seedPayments.filter((payment) => payment.status === "bezahlt").map((payment) => payment.id)));

  const payments = useMemo(() => {
    return seedPayments.map((payment) => ({
      ...payment,
      status: paidIds.has(payment.id) ? "bezahlt" as PaymentStatus : "offen" as PaymentStatus,
      paidAt: paidIds.has(payment.id) ? payment.paidAt ?? new Date().toISOString() : null,
    }));
  }, [paidIds]);

  return (
    <div className="grid gap-3">
      {payments.map((payment) => (
        <Surface key={payment.id} className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center">
          <div>
            <p className="font-semibold text-white">{payment.member}</p>
            <p className="mt-1 text-sm text-slate-500">{payment.month}</p>
          </div>
          <StatusPill status={payment.status} />
          <p className="font-semibold text-white md:text-right">{formatCurrency(payment.amount)}</p>
          <p className="text-sm text-slate-400 md:text-right">{payment.paidAt ? formatDate(payment.paidAt) : "Noch offen"}</p>
          <Button
            variant={payment.status === "bezahlt" ? "secondary" : "primary"}
            className="min-w-36"
            onClick={() => {
              setPaidIds((current) => {
                const next = new Set(current);
                if (next.has(payment.id)) {
                  next.delete(payment.id);
                } else {
                  next.add(payment.id);
                }
                return next;
              });
            }}
          >
            <Check className="size-4" />
            {payment.status === "bezahlt" ? "Bezahlt" : "Abhaken"}
          </Button>
        </Surface>
      ))}
    </div>
  );
}
