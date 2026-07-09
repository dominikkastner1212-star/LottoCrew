"use client";

import { useState } from "react";
import { addMemberByEmail, addMemberWithPassword } from "@/app/actions";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Surface } from "@/components/ui/panel";

type Mode = "invite" | "password";

export function AddMemberForm({ groupId }: { groupId: string }) {
  const [mode, setMode] = useState<Mode>("invite");

  return (
    <Surface>
      <div className="mb-3 flex gap-1 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode("invite")}
          className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            mode === "invite" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Per E-Mail einladen
        </button>
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            mode === "password" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Mit Startpasswort
        </button>
      </div>

      {mode === "invite" ? (
        <ActionForm
          action={addMemberByEmail}
          successMessage="Einladung gesendet! Der Kollege bekommt eine E-Mail und legt sein Passwort selbst fest."
          className="space-y-3"
        >
          <input type="hidden" name="group_id" value={groupId} />
          <label className="block">
            <span className="text-sm font-semibold text-slate-600">Mitglied per E-Mail hinzufügen</span>
            <input
              name="email"
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none focus:border-amber-400"
              placeholder="kollege@firma.de"
              required
            />
          </label>
          <select
            name="role"
            defaultValue="participant"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-amber-400"
          >
            <option value="participant">Teilnehmer</option>
            <option value="admin">Admin</option>
          </select>
          <SubmitButton className="w-full" pendingLabel="Wird gesendet...">Einladung senden</SubmitButton>
        </ActionForm>
      ) : (
        <ActionForm
          action={addMemberWithPassword}
          successMessage="Mitglied angelegt! Gib dem Kollegen das Startpasswort weiter – beim ersten Login muss er es ändern."
          className="space-y-3"
        >
          <input type="hidden" name="group_id" value={groupId} />
          <label className="block">
            <span className="text-sm font-semibold text-slate-600">Name</span>
            <input
              name="display_name"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none focus:border-amber-400"
              placeholder="Vorname"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-600">E-Mail</span>
            <input
              name="email"
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none focus:border-amber-400"
              placeholder="kollege@firma.de"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-600">Startpasswort</span>
            <input
              name="password"
              type="text"
              minLength={6}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none focus:border-amber-400"
              placeholder="Mind. 6 Zeichen"
              required
            />
          </label>
          <select
            name="role"
            defaultValue="participant"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-amber-400"
          >
            <option value="participant">Teilnehmer</option>
            <option value="admin">Admin</option>
          </select>
          <SubmitButton className="w-full" pendingLabel="Wird angelegt...">Mitglied anlegen</SubmitButton>
        </ActionForm>
      )}
    </Surface>
  );
}
