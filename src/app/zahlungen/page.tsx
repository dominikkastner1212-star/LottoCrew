import { Check, Download } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { PaymentsBoard } from "@/components/payments-board";
import { Button, LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export default function PaymentsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Zahlungen"
        description="Offene und bezahlte Monatsbeitraege mit schneller Admin-Bestaetigung."
        action={
          <>
            <LinkButton href="/api/export/payments.csv" variant="secondary"><Download className="size-4" />CSV</LinkButton>
            <Button><Check className="size-4" />Beitrag abhaken</Button>
          </>
        }
      />
      <Panel>
        <PaymentsBoard />
      </Panel>
    </AppShell>
  );
}
