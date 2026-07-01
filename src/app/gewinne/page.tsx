import { FileDown, Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { CreateWinningForm } from "@/components/admin-forms";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { WinConfetti } from "@/components/win-confetti";
import { Button, LinkButton } from "@/components/ui/button";
import { Panel, Surface } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WinningsPage() {
  const app = await requireAppContext();

  return (
    <AppShell>
      <PageHeader
        title="Gewinne"
        description="Gewinne erfassen, Historie sehen und Anteil pro Teilnehmer transparent berechnen."
        action={
          <>
            <LinkButton href="/api/export/winnings.pdf" variant="secondary"><FileDown className="size-4" />PDF</LinkButton>
            <Button disabled={!app.isAdmin}><Plus className="size-4" />Gewinn erfassen</Button>
          </>
        }
      />
      <Panel className="relative overflow-hidden">
        {app.winnings.length > 0 ? <WinConfetti /> : null}
        {app.group ? (
          <div className="mb-5">
            <CreateWinningForm groupId={app.group.id} draws={app.draws} tickets={app.tickets} isAdmin={app.isAdmin} />
          </div>
        ) : null}
        <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {app.winnings.map((winning) => (
            <StaggerItem key={winning.id}>
            <Surface>
              <p className="text-sm font-semibold text-emerald-700">{winning.rank}</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(winning.amount)}</h2>
              <p className="mt-2 text-sm text-slate-500">{winning.ticket}</p>
              <div className="mt-6 rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Anteil pro Teilnehmer</p>
                <p className="mt-1 font-semibold text-amber-700">{formatCurrency(winning.perMember)}</p>
              </div>
              <p className="mt-4 text-xs text-slate-500">{formatDate(winning.date)}</p>
            </Surface>
            </StaggerItem>
          ))}
          {app.winnings.length === 0 ? (
            <Surface className="py-10 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-4">Noch keine Gewinne vorhanden.</Surface>
          ) : null}
        </Stagger>
      </Panel>
    </AppShell>
  );
}
