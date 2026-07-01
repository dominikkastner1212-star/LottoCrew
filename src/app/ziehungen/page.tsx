import { CalendarPlus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { CreateDrawForm, EvaluateDrawForm } from "@/components/admin-forms";
import { Button } from "@/components/ui/button";
import { Panel, Surface } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DrawsPage() {
  const app = await requireAppContext();

  return (
    <AppShell>
      <PageHeader
        title="Ziehungen"
        description="Eurojackpot-Jackpots, Ziehungsdaten und Auswertung der gespielten Runden."
        action={<Button disabled={!app.isAdmin}><CalendarPlus className="size-4" />Ziehung anlegen</Button>}
      />
      <Panel>
        {app.group ? (
          <div className="mb-5 grid gap-4">
            <CreateDrawForm groupId={app.group.id} isAdmin={app.isAdmin} />
            <EvaluateDrawForm groupId={app.group.id} draws={app.draws} isAdmin={app.isAdmin} />
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {app.draws.map((draw) => (
            <Surface key={draw.id} className="min-h-52">
              <p className="text-sm font-semibold text-amber-600">Eurojackpot</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(draw.jackpot)}</h2>
              <p className="mt-3 text-sm text-slate-500">{formatDate(draw.date)}</p>
              {draw.resultNumbers.length ? (
                <div className="mt-5 rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Gezogen</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {draw.resultNumbers.join(" ")} <span className="text-amber-600">+ {draw.resultEuroNumbers.join(" ")}</span>
                  </p>
                </div>
              ) : null}
              <div className="mt-8 h-2 rounded-full bg-slate-100">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-300 to-violet-500" />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{draw.status}</p>
            </Surface>
          ))}
          {app.draws.length === 0 ? (
            <Surface className="py-10 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-4">Noch keine Ziehungen vorhanden.</Surface>
          ) : null}
        </div>
      </Panel>
    </AppShell>
  );
}
