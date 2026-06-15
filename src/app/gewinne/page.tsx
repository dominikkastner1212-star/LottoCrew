import { FileDown, Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button, LinkButton } from "@/components/ui/button";
import { Panel, Surface } from "@/components/ui/panel";
import { winnings } from "@/lib/sample-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function WinningsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Gewinne"
        description="Gewinne erfassen, Historie sehen und Anteil pro Teilnehmer transparent berechnen."
        action={
          <>
            <LinkButton href="/api/export/winnings.pdf" variant="secondary"><FileDown className="size-4" />PDF</LinkButton>
            <Button><Plus className="size-4" />Gewinn erfassen</Button>
          </>
        }
      />
      <Panel>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {winnings.map((winning) => (
            <Surface key={winning.id}>
              <p className="text-sm font-semibold text-emerald-100">{winning.rank}</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">{formatCurrency(winning.amount)}</h2>
              <p className="mt-2 text-sm text-slate-400">{winning.ticket}</p>
              <div className="mt-6 rounded-2xl bg-white/[.06] p-3">
                <p className="text-xs text-slate-500">Anteil pro Teilnehmer</p>
                <p className="mt-1 font-semibold text-amber-100">{formatCurrency(winning.perMember)}</p>
              </div>
              <p className="mt-4 text-xs text-slate-500">{formatDate(winning.date)}</p>
            </Surface>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
