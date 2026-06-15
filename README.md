# LottoCrew

Premium-PWA fur Eurojackpot-Tippgemeinschaften in Teams und Abteilungen.

## Stack

- Next.js App Router mit TypeScript
- Tailwind CSS
- Supabase Auth, Database und RLS
- Railway Deployment
- Installierbare PWA via Web App Manifest
- Eurojackpot-only: 5 Hauptzahlen von 1-50 und 2 Eurozahlen von 1-12

## Lokal starten

Benotigt Node.js 22 oder neuer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Danach `http://localhost:3000` offnen.

## Supabase einrichten

1. Neues Supabase-Projekt erstellen.
2. SQL aus `supabase/migrations/001_initial_schema.sql` im SQL Editor ausfuhren.
3. `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` setzen.
4. In Supabase Auth E-Mail-Login aktivieren.
5. Optional Demo-Daten aus `supabase/seed.sql` einspielen.

Die RLS-Policies erlauben Teilnehmern nur Zugriff auf ihre Gruppen. Gruppen-Admins durfen Mitglieder, Tipps, Zahlungen und Gewinne verwalten.

## Railway Deployment

1. Repository mit Railway verbinden.
2. Umgebungsvariablen aus `.env.example` in Railway setzen.
3. Railway nutzt `npm run build` und `npm run start` aus `railway.json`.

## Seiten

- `/login`
- `/`
- `/tipps`
- `/ziehungen`
- `/teilnehmer`
- `/zahlungen`
- `/gewinne`
- `/statistiken`
- `/einstellungen`
