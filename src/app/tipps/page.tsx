import { Printer, Upload } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { TicketDocumentUploadForm } from "@/components/admin-forms";
import { TicketEntryForm } from "@/components/ticket-entry-form";
import { TipsBoard } from "@/components/tips-board";
import { LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function TipsPage() {
  const app = await requireAppContext();

  return (
    <AppShell>
      <PageHeader
        title="Tipps"
        description="Eigene Eurojackpot-Tipps abgeben, Zufallszahlen nutzen und Spielscheine sauber nachhalten."
        action={
          <>
            <LinkButton href="/druck" variant="secondary"><Printer className="size-4" />Druck</LinkButton>
            {app.isAdmin ? <LinkButton href="#spielschein-upload" variant="secondary"><Upload className="size-4" />Upload</LinkButton> : null}
          </>
        }
      />
      <Panel>
        {app.group ? (
          <div className="mb-5">
            <TicketEntryForm groupId={app.group.id} draws={app.draws} isAdmin={app.isAdmin} />
          </div>
        ) : null}
        <TipsBoard tickets={app.tickets} />
      </Panel>
      {app.group && app.isAdmin ? (
        <Panel id="spielschein-upload" className="mt-5">
          <h2 className="text-xl font-semibold text-white">Spielschein hinterlegen</h2>
          <p className="mt-1 text-sm text-slate-400">Foto oder PDF zum passenden Tipp speichern.</p>
          <div className="mt-5">
            <TicketDocumentUploadForm groupId={app.group.id} tickets={app.tickets} isAdmin={app.isAdmin} />
          </div>
        </Panel>
      ) : null}
    </AppShell>
  );
}
