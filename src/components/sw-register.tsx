"use client";

import { useEffect } from "react";

/**
 * Registriert den Service Worker (public/sw.js).
 * Rendert nichts – einfach einmal im RootLayout einbinden.
 *
 * Nur in Produktion aktiv: im Dev-Modus wuerde der Cache sonst
 * staendig veraltete Turbopack-Chunks ausliefern.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service Worker Registrierung fehlgeschlagen:", error);
    });
  }, []);

  return null;
}
