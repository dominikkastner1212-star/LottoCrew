/*
 * LottoCrew Service Worker
 *
 * Strategie (bewusst einfach und nachvollziehbar, ohne Build-Tool):
 * - Statische Assets (/_next/static, Icons, Fonts): Cache First
 *   -> aendern sich nie (gehashte Dateinamen), also sicher cachebar
 * - Seiten-Navigation: Network First mit Offline-Fallback
 *   -> Nutzer sehen immer frische Daten; ohne Netz kommt die
 *      zuletzt gesehene Version oder die Offline-Seite
 * - API-/Auth-Requests (POST, /api/, supabase): werden NIE gecacht
 *
 * WICHTIG: Bei Aenderungen an dieser Datei die CACHE_VERSION hochzaehlen,
 * damit alte Caches aufgeraeumt werden.
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `lottocrew-static-${CACHE_VERSION}`;
const PAGES_CACHE = `lottocrew-pages-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

// Beim Installieren: Offline-Seite und Icons vorab in den Cache legen.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        cache.addAll([
          OFFLINE_URL,
          "/icons/icon-192.png",
          "/icons/icon-512.png",
          "/manifest.webmanifest",
        ]),
      )
      .then(() => self.skipWaiting()),
  );
});

// Beim Aktivieren: alte Cache-Versionen loeschen.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("lottocrew-") && !key.includes(CACHE_VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Nur GET-Requests der eigenen Domain behandeln.
  // POST (Server Actions!), Supabase, externe Domains: unangetastet lassen.
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
    return;
  }

  // Statische, gehashte Assets: Cache First.
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname === "/manifest.webmanifest";

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Seiten-Navigation: Network First, Fallback auf Cache, dann Offline-Seite.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        }),
    );
  }
});
