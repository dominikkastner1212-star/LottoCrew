"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Fängt Fehler aus Seiten und Server-Actions ab und zeigt statt des rohen
// Crash-Screens eine freundliche Meldung mit Wiederholen-Option.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // In Production maskiert Next.js Server-Fehlermeldungen. Erkennbare, bewusst
  // geworfene Validierungsmeldungen (deutsch, kurz) zeigen wir an, alles andere
  // bekommt einen generischen Text.
  const isReadableMessage =
    error.message && !error.message.includes("Server Components") && !error.message.includes("digest") && error.message.length < 160;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="glass-panel w-full max-w-md rounded-[28px] p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-100">
          <TriangleAlert className="size-7 text-amber-600" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">Das hat nicht geklappt</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {isReadableMessage
            ? error.message
            : "Beim Verarbeiten ist ein Fehler aufgetreten. Deine Daten sind sicher - versuch es einfach nochmal."}
        </p>
        <div className="mt-8 grid gap-2">
          <Button onClick={reset} className="w-full">
            <RotateCcw className="size-4" />
            Nochmal versuchen
          </Button>
          <Link href="/" className="text-sm font-semibold text-slate-500 transition hover:text-slate-900">
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
