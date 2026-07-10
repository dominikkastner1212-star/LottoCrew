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
2. Alle SQL-Dateien aus `supabase/migrations` in Reihenfolge ausfuhren, oder mit Supabase CLI `supabase db push` verwenden. Nur `001_initial_schema.sql` reicht nicht aus.
3. `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` setzen.
4. In Supabase Auth E-Mail-Login aktivieren.

Die RLS-Policies erlauben Teilnehmern nur Zugriff auf ihre Gruppen. Gruppen-Admins durfen Mitglieder, Tipps, Zahlungen und Gewinne verwalten.

Beim ersten Login kann der erste Nutzer im Admin-Bereich eine Gruppe erstellen und wird automatisch Admin.
Zum Hinzufuegen von Mitgliedern per E-Mail braucht die Server-App `SUPABASE_SECRET_KEY` mit dem Supabase `service_role` Key. Dieser Key darf niemals als `NEXT_PUBLIC_` Variable gesetzt werden.

Neue Admins starten ueber `/registrieren`: Name, E-Mail, Passwort, Gruppenname und Monatsbeitrag werden erfasst. Danach melden sie sich klassisch mit E-Mail und Passwort an.

Geschuetzte App-Seiten leiten ohne Session zu `/login` weiter. Admins koennen Ziehungen, Tipps, Zahlungen, Gewinne und Rollen direkt in der App pflegen.

Automatische Ziehungspruefung nutzt serverseitig `EUROJACKPOT_RESULTS_API_URL`. Die URL kann `{date}` enthalten, sonst haengt die App `?date=YYYY-MM-DD` an. Erwartet wird JSON mit 5 Hauptzahlen und 2 Eurozahlen, optional mit Gewinnbetraegen pro Gewinnklasse.

## Railway Deployment

1. Repository mit Railway verbinden.
2. Umgebungsvariablen aus `.env.example` in Railway setzen.
3. Railway nutzt `npm run build` und `npm run start` aus `railway.json`.

## Seiten

- `/login`
- `/registrieren`
- `/`
- `/tipps`
- `/ziehungen`
- `/teilnehmer`
- `/zahlungen`
- `/gewinne`
- `/statistiken`
- `/einstellungen`
