"use client";

import { CheckCircle2, Dices, Eraser, Save } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { createMemberTicket, createTicket } from "@/app/actions";
import { NumberGrid } from "@/components/number-grid";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Surface } from "@/components/ui/panel";
import type { AppDraw } from "@/lib/app-data";
import { cn, formatDate } from "@/lib/utils";

/** Zufällige, eindeutige Zahlen ziehen (Fisher-Yates). */
function pickUnique(max: number, count: number) {
  const values = Array.from({ length: max }, (_, index) => index + 1);
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values.slice(0, count).sort((a, b) => a - b);
}

type SaveState = { status: "idle" } | { status: "saved"; at: number } | { status: "error"; message: string };

/**
 * Tippeingabe mit antippbarem Zahlenraster - wie ein echter Lottoschein.
 *
 * UX-Prinzipien für die Zielgruppe (auch ältere Kollegen):
 * 1. Kein Freitext für Zahlen -> keine Tippfehler, keine Duplikate möglich
 * 2. Der Speichern-Button ist erst aktiv, wenn alles vollständig ist,
 *    und ein Hinweistext sagt IMMER, was noch fehlt
 * 3. Nach dem Speichern gibt es eine unübersehbare grüne Bestätigung
 *    und das Raster wird für den nächsten Tipp geleert
 */
export function TicketEntryForm({
  groupId,
  draws,
  isAdmin,
}: {
  groupId: string;
  draws: AppDraw[];
  isAdmin: boolean;
}) {
  const nextDraw = useMemo(() => {
    const today = new Date();
    return draws.find((draw) => new Date(draw.date) >= today) ?? draws[0];
  }, [draws]);

  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [euroNumbers, setEuroNumbers] = useState<number[]>([]);

  const mainComplete = mainNumbers.length === 5;
  const euroComplete = euroNumbers.length === 2;
  const complete = mainComplete && euroComplete;

  // Wrapper um die Server Action: liefert nach dem Speichern einen
  // Erfolgs-Status zurück, damit wir eine Bestätigung anzeigen können.
  const action = isAdmin ? createTicket : createMemberTicket;
  const [saveState, formAction] = useActionState<SaveState, FormData>(
    async (_previous, formData) => {
      try {
        await action(formData);
        setMainNumbers([]);
        setEuroNumbers([]);
        return { status: "saved", at: Date.now() };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unbekannter Fehler";
        return { status: "error", message };
      }
    },
    { status: "idle" },
  );

  function toggle(list: number[], setList: (next: number[]) => void, limit: number, value: number) {
    if (list.includes(value)) {
      setList(list.filter((entry) => entry !== value));
    } else if (list.length < limit) {
      setList([...list, value].sort((a, b) => a - b));
    }
  }

  function randomize() {
    setMainNumbers(pickUnique(50, 5));
    setEuroNumbers(pickUnique(12, 2));
  }

  function clearAll() {
    setMainNumbers([]);
    setEuroNumbers([]);
  }

  // Verständlicher Hinweis, was noch fehlt - statt eines stumm
  // deaktivierten Buttons.
  const missingHint = !mainComplete
    ? `Noch ${5 - mainNumbers.length} von 5 Hauptzahlen antippen`
    : !euroComplete
      ? `Noch ${2 - euroNumbers.length} von 2 Eurozahlen antippen`
      : null;

  return (
    <Surface>
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="group_id" value={groupId} />
        {mainNumbers.map((value, index) => (
          <input key={`main-${index}`} type="hidden" name={`main_${index + 1}`} value={value} />
        ))}
        {euroNumbers.map((value, index) => (
          <input key={`euro-${index}`} type="hidden" name={`extra_${index + 1}`} value={value} />
        ))}

        {/* Schritt 1: Grunddaten */}
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_9rem]">
          <label className="block">
            <span className="text-sm font-semibold text-slate-600">Tippname</span>
            <input
              name="label"
              required
              defaultValue={isAdmin ? "Eurojackpot Runde" : "Mein Eurojackpot-Tipp"}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none focus:border-amber-400"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-600">Ziehung</span>
            <select
              name="draw_id"
              required
              defaultValue={nextDraw?.id ?? ""}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none focus:border-amber-400"
            >
              <option value="">Auswählen</option>
              {draws.map((draw) => (
                <option key={draw.id} value={draw.id}>
                  {formatDate(draw.date)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-600">Einsatz (€)</span>
            <input
              name="stake_amount"
              inputMode="decimal"
              required
              defaultValue="2"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none focus:border-amber-400"
            />
          </label>
        </div>

        {/* Schritt 2: Hauptzahlen antippen */}
        <NumberGrid
          label="5 Hauptzahlen wählen (1-50)"
          max={50}
          limit={5}
          selected={mainNumbers}
          onToggle={(value) => toggle(mainNumbers, setMainNumbers, 5, value)}
          columns={10}
          tone="amber"
        />

        {/* Schritt 3: Eurozahlen antippen */}
        <NumberGrid
          label="2 Eurozahlen wählen (1-12)"
          max={12}
          limit={2}
          selected={euroNumbers}
          onToggle={(value) => toggle(euroNumbers, setEuroNumbers, 2, value)}
          columns={6}
          tone="violet"
        />

        {/* Aktionen + Status. aria-live sorgt dafür, dass Screenreader
            Erfolg und Fehler mit vorlesen. */}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={randomize}>
            <Dices className="size-4" />
            Zufallszahlen
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={clearAll}
            disabled={mainNumbers.length === 0 && euroNumbers.length === 0}
          >
            <Eraser className="size-4" />
            Leeren
          </Button>
          <div className="ml-auto flex items-center gap-3">
            {missingHint ? <span className="text-sm font-medium text-slate-500">{missingHint}</span> : null}
            <SubmitButton disabled={!complete || draws.length === 0} pendingLabel="Wird gespeichert...">
              <Save className="size-4" />
              Tipp speichern
            </SubmitButton>
          </div>
        </div>

        <div aria-live="polite">
          {saveState.status === "saved" ? (
            <div
              key={saveState.at}
              className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
            >
              <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
              Tipp gespeichert! Er erscheint jetzt unten in der Liste.
            </div>
          ) : null}
          {saveState.status === "error" ? (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
              Speichern hat nicht geklappt: {saveState.message}. Bitte noch einmal versuchen.
            </div>
          ) : null}
        </div>

        {draws.length === 0 ? (
          <p className={cn("rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900")}>
            Es gibt noch keine Ziehung. Ein Admin muss zuerst unter &quot;Ziehungen&quot; eine anlegen.
          </p>
        ) : null}
      </form>
    </Surface>
  );
}
