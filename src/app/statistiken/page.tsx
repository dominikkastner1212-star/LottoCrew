import { TrendingUp } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ChartBars } from "@/components/chart-bars";
import { Panel, Surface } from "@/components/ui/panel";
import { monthlyStats, totals } from "@/lib/sample-data";
import { formatCurrency } from "@/lib/utils";

export default function StatsPage() {
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
              <h2 className="text-xl font-semibold text-white">Monatsverlauf</h2>
              <p className="mt-1 text-sm text-slate-400">Einsaetze gegen Gewinne.</p>
            </div>
            <TrendingUp className="size-5 text-emerald-200" />
          </div>
          <ChartBars />
        </Panel>
        <Panel>
          <div className="grid gap-3">
            <Surface>
              <p className="text-sm text-slate-400">Gesamteinsaetze</p>
              <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(monthlyStats.reduce((sum, item) => sum + item.stake, 0))}</p>
            </Surface>
            <Surface>
              <p className="text-sm text-slate-400">Gewinnsumme</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-100">{formatCurrency(totals.totalWinnings)}</p>
            </Surface>
            <Surface>
              <p className="text-sm text-slate-400">Rueckflussquote</p>
              <p className="mt-2 text-3xl font-semibold text-amber-100">18,6%</p>
            </Surface>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
