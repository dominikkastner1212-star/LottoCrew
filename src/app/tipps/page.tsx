import { Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { TipsBoard } from "@/components/tips-board";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export default function TipsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Tipps"
        description="Tippfelder planen, Zahlen erfassen und Status pro Ziehung nachhalten."
        action={
          <Button><Plus className="size-4" />Neuer Tipp</Button>
        }
      />
      <Panel>
        <TipsBoard />
      </Panel>
    </AppShell>
  );
}
