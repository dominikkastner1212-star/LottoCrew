import { UserPlus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Panel, Surface } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const app = await requireAppContext();

  return (
    <AppShell>
      <PageHeader
        title="Teilnehmer"
        description="Rollen, monatliche Beitraege und Zahlungsstand der Tippgemeinschaft."
        action={<Button disabled={!app.isAdmin}><UserPlus className="size-4" />Einladen</Button>}
      />
      <Panel>
        <Stagger className="grid gap-3">
          {app.members.filter((member) => member.status === "active").map((member) => (
            <StaggerItem key={member.id}>
            <Surface className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
              <div>
                <p className="font-semibold text-slate-900">{member.name}</p>
                <p className="mt-1 text-sm text-slate-500">{member.email || "ohne E-Mail"}</p>
              </div>
              <StatusPill status={member.role} />
              <div className="md:text-right">
                <p className="text-xs text-slate-500">Monatlich</p>
                <p className="font-semibold text-slate-900">{formatCurrency(member.monthlyAmount)}</p>
              </div>
              <div className="md:text-right">
                <p className="text-xs text-slate-500">Seit</p>
                <p className="font-semibold text-slate-600">{formatDate(member.joinedAt)}</p>
              </div>
            </Surface>
            </StaggerItem>
          ))}
          {app.members.filter((member) => member.status === "active").length === 0 ? <Surface className="py-10 text-center text-sm text-slate-500">Noch keine Teilnehmer vorhanden.</Surface> : null}
        </Stagger>
      </Panel>
    </AppShell>
  );
}
