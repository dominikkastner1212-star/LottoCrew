import { Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { CreateTicketForm } from "@/components/admin-forms";
import { TipsBoard } from "@/components/tips-board";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function TipsPage() {
  const app = await requireAppContext();

  return (
    <AppShell>
      <PageHeader
        title="Tipps"
        description="Tippfelder planen, Zahlen erfassen und Status pro Ziehung nachhalten."
        action={<Button disabled={!app.isAdmin}><Plus className="size-4" />Neuer Tipp</Button>}
      />
      <Panel>
        {app.group ? (
          <div className="mb-5">
            <CreateTicketForm groupId={app.group.id} draws={app.draws} isAdmin={app.isAdmin} />
          </div>
        ) : null}
        <TipsBoard tickets={app.tickets} />
      </Panel>
    </AppShell>
  );
}
