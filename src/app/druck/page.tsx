import { Printer } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { PrintSheet } from "@/components/print-sheet";
import { Panel, Surface } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function PrintPage() {
  const app = await requireAppContext();

  return (
    <AppShell>
      <PageHeader
        title="Lottoschein-Druck"
        description="Kreuze fuer Eurojackpot-Tippfelder drucken und die Position fuer echte Scheine feinjustieren."
      />
      <Panel>
        {app.draws.length && app.tickets.length ? (
          <PrintSheet draws={app.draws} tickets={app.tickets} />
        ) : (
          <Surface className="py-10 text-center text-sm text-slate-500">
            <Printer className="mx-auto mb-3 size-6 text-amber-600" />
            Lege zuerst eine Ziehung und mindestens einen Tipp an.
          </Surface>
        )}
      </Panel>
    </AppShell>
  );
}
