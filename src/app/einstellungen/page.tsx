import { Database, Shield, UsersRound } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Panel, Surface } from "@/components/ui/panel";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Admin"
        description="Gruppeneinstellungen, Rollen, Standardbeitraege und Supabase-Status."
      />
      <section className="grid gap-5 xl:grid-cols-3">
        <Panel>
          <UsersRound className="size-5 text-amber-200" />
          <h2 className="mt-5 text-xl font-semibold text-white">Gruppe</h2>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">Name</span>
              <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50" defaultValue="AbteilungsJackpot" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">Monatsbeitrag</span>
              <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50" defaultValue="24,00 EUR" />
            </label>
            <Button className="w-full">Speichern</Button>
          </div>
        </Panel>
        <Panel>
          <Shield className="size-5 text-emerald-200" />
          <h2 className="mt-5 text-xl font-semibold text-white">Rollen</h2>
          <div className="mt-5 space-y-3">
            {["Admins verwalten Tipps", "Teilnehmer sehen eigene Zahlungen", "Gruppen-Daten sind isoliert"].map((item) => (
              <Surface key={item} className="text-sm font-semibold text-slate-200">{item}</Surface>
            ))}
          </div>
        </Panel>
        <Panel>
          <Database className="size-5 text-violet-200" />
          <h2 className="mt-5 text-xl font-semibold text-white">Supabase</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Schema und RLS liegen unter `supabase/migrations`. Keys werden ueber Railway-Umgebungsvariablen gesetzt.
          </p>
          <div className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-100">
            Bereit fuer Verbindung
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
