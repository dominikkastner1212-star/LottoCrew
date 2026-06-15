import { Check, Download } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { PaymentsBoard } from "@/components/payments-board";
import { Button, LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { getAppContext } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const app = await getAppContext();

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
        <PaymentsBoard payments={app.payments} groupId={app.group?.id ?? ""} isAdmin={app.isAdmin} />
      </Panel>
    </AppShell>
  );
}
