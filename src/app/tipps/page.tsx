import { Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { TipsBoard } from "@/components/tips-board";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { getAppContext } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function TipsPage() {
  const app = await getAppContext();

  return (
    <AppShell>
      <PageHeader
        title="Tipps"
        description="Tippfelder planen, Zahlen erfassen und Status pro Ziehung nachhalten."
        action={<Button disabled={!app.isAdmin}><Plus className="size-4" />Neuer Tipp</Button>}
      />
      <Panel>
        <TipsBoard tickets={app.tickets} />
      </Panel>
    </AppShell>
  );
}
