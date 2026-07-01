"use client";

import { Building2, KeyRound, Mail, UserPlus, UserRound } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { registerWithEmailPassword } from "@/lib/auth/password-auth";
import { createClient } from "@/lib/supabase/browser";

type RegisterState = "idle" | "loading" | "success" | "error";

export function RegisterForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [groupName, setGroupName] = useState("AbteilungsJackpot");
  const [monthlyAmount, setMonthlyAmount] = useState("24");
  const [state, setState] = useState<RegisterState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    if (password !== passwordConfirm) {
      setState("error");
      setMessage("Die Passwoerter stimmen nicht ueberein.");
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await registerWithEmailPassword(supabase, {
        displayName,
        email,
        groupName,
        monthlyAmount,
        password,
      });

      if (error) {
        setState("error");
        setMessage(error.message);
        return;
      }

      setState("success");
      setMessage("Registrierung erstellt. Du kannst dich jetzt mit E-Mail und Passwort einloggen.");
    } catch (error) {
      setState("error");
      const errorMessage = error instanceof Error ? error.message : "";
      setMessage(
        errorMessage === "Failed to fetch"
          ? "Supabase ist nicht erreichbar. Bitte Railway-Variablen pruefen und neu deployen."
          : errorMessage || "Registrierung konnte nicht gestartet werden.",
      );
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-semibold text-slate-500">Dein Name</span>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <UserRound className="size-4 text-slate-500" />
          <input
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Dominik Kastner"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 outline-none"
          />
        </div>
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-500">E-Mail</span>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Mail className="size-4 text-slate-500" />
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@firma.de"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 outline-none"
          />
        </div>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Passwort</span>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <KeyRound className="size-4 text-slate-500" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mind. 6 Zeichen"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 outline-none"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Passwort wiederholen</span>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <KeyRound className="size-4 text-slate-500" />
            <input
              type="password"
              required
              minLength={6}
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              placeholder="Nochmal eingeben"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 outline-none"
            />
          </div>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Gruppe</span>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Building2 className="size-4 text-slate-500" />
            <input
              required
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 outline-none"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Beitrag</span>
          <input
            required
            inputMode="decimal"
            value={monthlyAmount}
            onChange={(event) => setMonthlyAmount(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>
      <Button className="w-full" disabled={state === "loading"}>
        <UserPlus className="size-4" />
        {state === "loading" ? "Wird registriert..." : "Registrieren"}
      </Button>
      {message ? (
        <div
          className={`rounded-2xl border p-4 text-sm font-medium ${
            state === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message}
        </div>
      ) : null}
    </form>
  );
}
