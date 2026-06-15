import { CalendarPlus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Panel, Surface } from "@/components/ui/panel";
import { draws } from "@/lib/sample-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DrawsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Ziehungen"
        description="Jackpots, Ziehungsdaten und Auswertung der gespielten Runden."
        action={<Button><CalendarPlus className="size-4" />Ziehung anlegen</Button>}
      />
      <Panel>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {draws.map((draw) => (
            <Surface key={draw.id} className="min-h-52">
              <p className="text-sm font-semibold text-amber-200">{draw.lottery}</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">{formatCurrency(draw.jackpot)}</h2>
              <p className="mt-3 text-sm text-slate-400">{formatDate(draw.date)}</p>
              <div className="mt-8 h-2 rounded-full bg-white/[.08]">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-300 to-violet-500" />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{draw.status}</p>
            </Surface>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
