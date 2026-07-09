"use client";

import { CheckCircle2, TriangleAlert } from "lucide-react";
import { useActionState, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionState =
  | { status: "idle" }
  | { status: "success"; at: number }
  | { status: "error"; message: string; at: number };

/**
 * Wrapper fuer Server-Action-Formulare mit eingebautem Feedback.
 *
 * Loest zwei UX-Probleme auf einen Schlag:
 * 1. FEEDBACK: Nach jeder Aktion erscheint eine gruene Bestaetigung
 *    bzw. eine verstaendliche Fehlermeldung (mit aria-live fuer
 *    Screenreader). Nie wieder "hat das jetzt geklappt?".
 * 2. RUECKFRAGE: Ueber das optionale `confirm`-Prop fragt das Formular
 *    vor dem Absenden nach ("Wirklich alle Beitraege anlegen?") –
 *    schuetzt vor Versehen-Klicks bei folgenreichen Aktionen.
 *
 * Verwendung (Markup bleibt wie bei einem normalen <form>):
 *   <ActionForm action={createDraw} successMessage="Ziehung angelegt!">
 *     ...inputs + submit button...
 *   </ActionForm>
 */
export function ActionForm({
  action,
  successMessage,
  confirm,
  resetOnSuccess = true,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  successMessage: string;
  confirm?: { question: string; confirmLabel: string };
  resetOnSuccess?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedRef = useRef(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [state, formAction] = useActionState<ActionState, FormData>(
    async (_previous, formData) => {
      try {
        await action(formData);
        if (resetOnSuccess) {
          formRef.current?.reset();
        }
        return { status: "success", at: Date.now() };
      } catch (error) {
        return { status: "error", message: toFriendlyMessage(error), at: Date.now() };
      }
    },
    { status: "idle" },
  );

  // Faengt das Absenden ab, wenn eine Rueckfrage gewuenscht ist.
  // Erst nach Klick auf "Ja, ..." wird wirklich abgeschickt.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!confirm) return;
    if (confirmedRef.current) {
      confirmedRef.current = false;
      return;
    }
    event.preventDefault();
    setShowConfirm(true);
  }

  function confirmAndSubmit() {
    confirmedRef.current = true;
    setShowConfirm(false);
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className={className}>
      {children}

      {confirm && showConfirm ? (
        <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">{confirm.question}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" onClick={confirmAndSubmit}>
              {confirm.confirmLabel}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowConfirm(false)}>
              Abbrechen
            </Button>
          </div>
        </div>
      ) : null}

      <div aria-live="polite">
        {state.status === "success" ? (
          <div
            key={state.at}
            className={cn(
              "mt-3 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3",
              "text-sm font-semibold text-emerald-800",
            )}
          >
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
            {successMessage}
          </div>
        ) : null}
        {state.status === "error" ? (
          <div
            key={state.at}
            className="mt-3 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
          >
            <TriangleAlert className="size-5 shrink-0 text-rose-600" />
            <span>{state.message}</span>
          </div>
        ) : null}
      </div>
    </form>
  );
}

/**
 * Macht aus technischen Fehlern verstaendliche Saetze.
 * Die Server Actions werfen bereits deutsche Meldungen – die reichen
 * wir durch. Nur generische/maskierte Meldungen (Next.js versteckt
 * Details in Produktion) ersetzen wir durch einen freundlichen Hinweis.
 */
function toFriendlyMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "";

  // In Produktion maskiert Next.js Server-Fehler ("An error occurred...").
  const looksMasked =
    !raw ||
    raw.includes("Server Components") ||
    raw.includes("An error occurred") ||
    raw.includes("digest");

  if (looksMasked) {
    return "Das hat leider nicht geklappt. Bitte prüfe deine Eingaben und versuche es noch einmal.";
  }

  // Haeufige Datenbank-Meldungen uebersetzen.
  if (raw.includes("duplicate key")) {
    return "Diesen Eintrag gibt es schon.";
  }
  if (raw.toLowerCase().includes("already registered")) {
    return "Diese E-Mail ist bereits registriert.";
  }

  return raw;
}
