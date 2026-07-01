import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AppLogo } from "@/components/app-logo";
import { LoginForm } from "@/components/login-form";
import { Panel } from "@/components/ui/panel";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div className="soft-grid pointer-events-none absolute inset-x-0 top-0 h-96 opacity-70" />
      <Panel className="relative w-full max-w-md p-6 md:p-8">
        <AppLogo />
        <div className="mt-10">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-900">Einloggen</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Mit E-Mail und Passwort anmelden und direkt sehen, ob du bezahlt hast, welche Tipps laufen und ob es Gewinne gab.
          </p>
        </div>
        <LoginForm />
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <p className="text-xs leading-5 text-emerald-800/80">
            Noch kein Konto? <Link href="/registrieren" className="font-semibold text-slate-900">Jetzt registrieren</Link>
          </p>
        </div>
      </Panel>
    </main>
  );
}
