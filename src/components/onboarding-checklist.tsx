import { ArrowRight, Check, ListChecks } from "lucide-react";
import Link from "next/link";
import type { AppContext } from "@/lib/app-data";
import { cn } from "@/lib/utils";

type Step = {
  title: string;
  description: string;
  href: string;
  done: boolean;
};

/**
 * Geführter Erststart für neue Gruppen.
 *
 * Zeigt auf dem Dashboard eine Checkliste, die sich anhand echter Daten
 * selbst abhakt und automatisch verschwindet, sobald alles erledigt ist.
 * Kein gespeicherter Zustand nötig - die Daten SIND der Zustand.
 *
 * So weiß jeder neue Admin sofort, was als Nächstes zu tun ist,
 * ohne Handbuch und ohne Rumsuchen.
 */
export function OnboardingChecklist({ app }: { app: AppContext }) {
  // Ohne Gruppe zeigt das Dashboard ohnehin den Gruppe-erstellen-Flow.
  if (!app.group) {
    return null;
  }

  const steps: Step[] = [
    {
      title: "Gruppe erstellen",
      description: `"${app.group.name}" ist angelegt.`,
      href: "/einstellungen",
      done: true,
    },
    {
      title: "Kollegen einladen",
      description:
        app.totals.activeMembers > 1
          ? `${app.totals.activeMembers} Mitspieler sind dabei.`
          : "Lade mindestens einen Kollegen ein - per E-Mail oder Einladungscode.",
      href: "/einstellungen",
      done: app.totals.activeMembers > 1,
    },
    {
      title: "Erste Ziehung anlegen",
      description:
        app.draws.length > 0
          ? "Eure erste Ziehung steht."
          : "Lege Datum und Jackpot der nächsten Eurojackpot-Ziehung fest.",
      href: "/ziehungen",
      done: app.draws.length > 0,
    },
    {
      title: "Ersten Tipp abgeben",
      description:
        app.tickets.length > 0
          ? "Der erste Tipp ist gespeichert. Viel Glück!"
          : "Zahlen antippen oder den Zufall entscheiden lassen.",
      href: "/tipps",
      done: app.tickets.length > 0,
    },
  ];

  const openSteps = steps.filter((step) => !step.done);

  // Alles erledigt? Dann verschwindet die Checkliste von selbst.
  if (openSteps.length === 0) {
    return null;
  }

  // Nicht-Admins können Mitglieder/Ziehungen nicht anlegen - ihnen
  // zeigen wir die Liste nur, wenn ihr eigener Schritt (Tipp) offen ist.
  if (!app.isAdmin) {
    const tipStep = steps[3];
    if (tipStep.done) return null;
    return (
      <section className="glass-panel mb-5 rounded-[28px] border border-amber-200 p-5">
        <p className="text-sm font-semibold text-amber-700">Los geht&apos;s!</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">Gib deinen ersten Tipp ab</h2>
        <p className="mt-1 text-base text-slate-600">Zahlen antippen oder den Zufall entscheiden lassen - dauert keine Minute.</p>
        <Link
          href="/tipps"
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-amber-400 px-5 text-sm font-semibold text-slate-950 shadow-[0_14px_32px_rgba(232,166,0,.28)] transition hover:bg-amber-300 active:scale-[0.97]"
        >
          Zum Tippschein <ArrowRight className="size-4" />
        </Link>
      </section>
    );
  }

  const firstOpenIndex = steps.findIndex((step) => !step.done);
  const doneCount = steps.length - openSteps.length;

  return (
    <section className="glass-panel mb-5 rounded-[28px] border border-amber-200 p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <ListChecks className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Eure Runde einrichten</h2>
            <p className="text-sm text-slate-600">
              Schritt {doneCount + 1} von {steps.length} - gleich seid ihr startklar.
            </p>
          </div>
        </div>
        {/* Fortschrittsbalken */}
        <div className="h-2 w-full max-w-40 overflow-hidden rounded-full bg-slate-100" aria-hidden>
          <div
            className="h-full rounded-full bg-amber-400 transition-all"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <ol className="mt-5 grid gap-2.5">
        {steps.map((step, index) => {
          const isNext = index === firstOpenIndex;
          const content = (
            <>
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                  step.done
                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                    : isNext
                      ? "border-amber-400 bg-amber-400 text-slate-950"
                      : "border-slate-200 bg-white text-slate-400",
                )}
              >
                {step.done ? <Check className="size-4" /> : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-base font-semibold",
                    step.done ? "text-slate-400 line-through decoration-slate-300" : "text-slate-900",
                  )}
                >
                  {step.title}
                </span>
                <span className={cn("block text-sm", step.done ? "text-slate-400" : "text-slate-600")}>
                  {step.description}
                </span>
              </span>
              {isNext ? <ArrowRight className="size-5 shrink-0 text-amber-600" /> : null}
            </>
          );

          return (
            <li key={step.title}>
              {step.done ? (
                <div className="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5">{content}</div>
              ) : (
                <Link
                  href={step.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition",
                    isNext
                      ? "border-amber-300 bg-amber-50 hover:bg-amber-100"
                      : "border-slate-200 bg-white hover:bg-slate-50",
                  )}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
