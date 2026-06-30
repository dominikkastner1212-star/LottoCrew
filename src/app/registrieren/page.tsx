import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { RegisterForm } from "@/components/register-form";
import { Panel } from "@/components/ui/panel";

export default function RegisterPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div className="soft-grid pointer-events-none absolute inset-x-0 top-0 h-96 opacity-70" />
      <Panel className="relative w-full max-w-xl p-6 md:p-8">
        <AppLogo />
        <div className="mt-10">
          <h1 className="text-4xl font-semibold tracking-normal text-white">Registrieren</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Gib deine Daten einmal ein. Danach meldest du dich klassisch mit E-Mail und Passwort an.
          </p>
        </div>
        <RegisterForm />
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-4">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-200" />
          <p className="text-xs leading-5 text-emerald-100/80">
            Bereits registriert? <Link href="/login" className="font-semibold text-white">Einloggen</Link>
          </p>
        </div>
      </Panel>
    </main>
  );
}
