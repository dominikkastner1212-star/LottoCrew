"use client";

import { Share, SquarePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "lottocrew-install-hint-dismissed";

// Chrome/Edge auf Android feuern dieses Event, wenn die App
// installierbar ist. Safari/iOS kennt es nicht.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Einmaliger, wegklickbarer Hinweis: "Du kannst LottoCrew installieren."
 *
 * Gerade ältere Kollegen wissen oft nicht, dass eine Website als App
 * auf den Startbildschirm kann - dieser Banner erklärt es ihnen genau
 * für ihr Gerät:
 * - Android/Chrome: echter Install-Knopf (nativer Prompt)
 * - iPhone/iPad:    kurze Anleitung mit den richtigen Symbolen
 * - Bereits installiert oder mal weggeklickt: erscheint nie wieder
 */
export function InstallHint() {
  const [mode, setMode] = useState<"hidden" | "android" | "ios">("hidden");
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Läuft die App schon als installierte PWA? Dann nichts anzeigen.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);
    if (standalone) return;

    // Schon mal weggeklickt? Entscheidung respektieren.
    try {
      if (window.localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // localStorage gesperrt (z. B. strikte Privatsphäre) - Banner
      // trotzdem zeigen, er lässt sich ja pro Sitzung wegklicken.
    }

    // iOS erkennen (iPadOS meldet sich teils als "MacIntel" mit Touch).
    const ua = window.navigator.userAgent;
    const isIos =
      /iPhone|iPad|iPod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIos) {
      const timeoutId = window.setTimeout(() => setMode("ios"), 0);
      return () => window.clearTimeout(timeoutId);
    }

    // Android/Chrome: auf das Install-Event warten.
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setMode("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setMode("hidden");
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Ohne localStorage merken wir es uns eben nur für diese Sitzung.
    }
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setMode("hidden");
    }
    // Bei "dismissed" bleibt der Banner offen - vielleicht war es ein
    // Versehen. Das X ist der bewusste Weg, ihn loszuwerden.
  }

  if (mode === "hidden") return null;

  return (
    <div className="glass-panel relative mb-5 rounded-[28px] border border-amber-200 p-5">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Hinweis schließen"
        className="absolute right-3 top-3 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-start gap-4 pr-8">
        <div className="hidden sm:block">
          <AppLogo />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">LottoCrew als App aufs Handy</h2>

          {mode === "android" ? (
            <>
              <p className="mt-1 text-base leading-6 text-slate-600">
                Ein Tipp genügt - danach findest du LottoCrew wie jede andere App auf deinem Startbildschirm.
              </p>
              <Button onClick={install} className="mt-3">
                <SquarePlus className="size-4" />
                App installieren
              </Button>
            </>
          ) : (
            <>
              <p className="mt-1 text-base leading-6 text-slate-600">
                So geht&apos;s auf dem iPhone - dauert 10 Sekunden:
              </p>
              <ol className="mt-3 space-y-2 text-base text-slate-700">
                <li className="flex items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">1</span>
                  <span>
                    Unten in Safari auf <Share className="mx-0.5 inline size-4 align-[-2px] text-sky-600" aria-hidden />{" "}
                    <strong>Teilen</strong> tippen
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">2</span>
                  <span>
                    <SquarePlus className="mx-0.5 inline size-4 align-[-2px] text-slate-600" aria-hidden />{" "}
                    <strong>&quot;Zum Home-Bildschirm&quot;</strong> wählen
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">3</span>
                  <span>
                    Oben rechts <strong>&quot;Hinzufügen&quot;</strong> tippen - fertig!
                  </span>
                </li>
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
