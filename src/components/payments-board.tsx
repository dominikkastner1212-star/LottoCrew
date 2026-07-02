import { Check } from "lucide-react";
import { updatePaymentStatus } from "@/app/actions";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { StatusPill } from "@/components/status-pill";
import { SubmitButton } from "@/components/ui/submit-button";
import { Surface } from "@/components/ui/panel";
import type { AppPayment } from "@/lib/app-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export function PaymentsBoard({ payments, groupId, isAdmin }: { payments: AppPayment[]; groupId: string; isAdmin: boolean }) {
  return (
    <Stagger className="grid gap-3">
      {payments.map((payment) => (
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
                {payment.status === "paid" ? "Bezahlt" : "Abhaken"}
              </SubmitButton>
            </form>
          ) : null}
        </Surface>
        </StaggerItem>
      ))}
      {payments.length === 0 ? (
        <Surface className="py-10 text-center text-sm text-slate-500">
          Noch keine Zahlungen vorhanden.
        </Surface>
      ) : null}
    </Stagger>
  );
}
