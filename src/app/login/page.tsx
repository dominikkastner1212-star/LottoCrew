import { Mail, ShieldCheck, Sparkles } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div className="soft-grid pointer-events-none absolute inset-x-0 top-0 h-96 opacity-70" />
      <Panel className="relative w-full max-w-md p-6 md:p-8">
        <AppLogo />
        <div className="mt-10">
          <h1 className="text-4xl font-semibold tracking-normal text-white">Einloggen</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Mit deiner Firmen-E-Mail anmelden und direkt sehen, ob du bezahlt hast, welche Tipps laufen und ob es Gewinne gab.
          </p>
        </div>
        <form className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">E-Mail</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3">
              <Mail className="size-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@firma.de"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
              />
            </div>
          </label>
          <Button className="w-full">
            <Sparkles className="size-4" />
            Magic Link senden
          </Button>
        </form>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-4">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-200" />
          <p className="text-xs leading-5 text-emerald-100/80">
            Rollen und Gruppenzugriff werden ueber Supabase Auth und Row Level Security abgesichert.
          </p>
        </div>
      </Panel>
    </main>
  );
}
