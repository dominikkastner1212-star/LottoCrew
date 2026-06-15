import { UserPlus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Panel, Surface } from "@/components/ui/panel";
import { getAppContext } from "@/lib/app-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const app = await getAppContext();

  return (
    <AppShell>
      <PageHeader
        title="Teilnehmer"
        description="Rollen, monatliche Beitraege und Zahlungsstand der Tippgemeinschaft."
        action={<Button disabled={!app.isAdmin}><UserPlus className="size-4" />Einladen</Button>}
      />
      <Panel>
        <div className="grid gap-3">
          {app.members.map((member) => (
            <Surface key={member.id} className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
              <div>
                <p className="font-semibold text-white">{member.name}</p>
                <p className="mt-1 text-sm text-slate-500">{member.email || "ohne E-Mail"}</p>
              </div>
              <StatusPill status={member.role} />
              <div className="md:text-right">
                <p className="text-xs text-slate-500">Monatlich</p>
                <p className="font-semibold text-white">{formatCurrency(member.monthlyAmount)}</p>
              </div>
              <div className="md:text-right">
                <p className="text-xs text-slate-500">Seit</p>
                <p className="font-semibold text-slate-200">{formatDate(member.joinedAt)}</p>
              </div>
            </Surface>
          ))}
          {app.members.length === 0 ? <Surface className="py-10 text-center text-sm text-slate-500">Noch keine Teilnehmer vorhanden.</Surface> : null}
        </div>
      </Panel>
    </AppShell>
  );
}
