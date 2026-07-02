import { TrendingUp } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ChartBars } from "@/components/chart-bars";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { Panel, Surface } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const app = await requireAppContext();
  const totalStake = app.monthlyStats.reduce((sum, item) => sum + item.stake, 0);
  const returnRate = totalStake > 0 ? (app.totals.totalWinnings / totalStake) * 100 : 0;

  return (
    <AppShell>
      <PageHeader
        title="Statistiken"
        description="Gewinnhistorie, Einsatzentwicklung und Teamquote auf einen Blick."
      />
      <section className="grid gap-5 xl:grid-cols-[1fr_.7fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Monatsverlauf</h2>
              <p className="mt-1 text-sm text-slate-500">Einsaetze gegen Gewinne.</p>
            </div>
            <TrendingUp className="size-5 text-emerald-600" />
          </div>
          <ChartBars monthlyStats={app.monthlyStats} />
        </Panel>
        <Panel>
          <Stagger className="grid gap-3">
            <StaggerItem>
            <Surface>
              <p className="text-sm text-slate-500">Gesamteinsaetze</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(totalStake)}</p>
            </Surface>
            </StaggerItem>
            <StaggerItem>
            <Surface>
              <p className="text-sm text-slate-500">Gewinnsumme</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-700">{formatCurrency(app.totals.totalWinnings)}</p>
            </Surface>
            </StaggerItem>
            <StaggerItem>
            <Surface>
              <p className="text-sm text-slate-500">Rueckflussquote</p>
              <p className="mt-2 text-3xl font-semibold text-amber-700">{returnRate.toFixed(1)}%</p>
            </Surface>
            </StaggerItem>
          </Stagger>
        </Panel>
      </section>
    </AppShell>
  );
}
