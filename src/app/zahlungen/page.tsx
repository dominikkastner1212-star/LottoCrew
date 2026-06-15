import { Check, Download } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { CreateMonthlyPaymentsForm, CreatePaymentForm } from "@/components/admin-forms";
import { PaymentsBoard } from "@/components/payments-board";
import { Button, LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const app = await requireAppContext();

  return (
    <AppShell>
      <PageHeader
        title="Zahlungen"
        description="Offene und bezahlte Monatsbeitraege mit schneller Admin-Bestaetigung."
        action={
          <>
            <LinkButton href="/api/export/payments.csv" variant="secondary"><Download className="size-4" />CSV</LinkButton>
            <Button disabled={!app.isAdmin}><Check className="size-4" />Beitrag anlegen</Button>
          </>
        }
      />
      <Panel>
        {app.group ? (
          <div className="mb-5 grid gap-4">
            <CreateMonthlyPaymentsForm groupId={app.group.id} isAdmin={app.isAdmin} />
            <CreatePaymentForm groupId={app.group.id} members={app.members} isAdmin={app.isAdmin} />
          </div>
        ) : null}
        <PaymentsBoard payments={app.payments} groupId={app.group?.id ?? ""} isAdmin={app.isAdmin} />
      </Panel>
    </AppShell>
  );
}
