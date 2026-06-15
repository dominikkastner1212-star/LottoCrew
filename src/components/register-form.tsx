"use client";

import { Building2, Mail, Sparkles, UserRound } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";

type RegisterState = "idle" | "loading" | "success" | "error";

export function RegisterForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [groupName, setGroupName] = useState("AbteilungsJackpot");
  const [monthlyAmount, setMonthlyAmount] = useState("24");
  const [state, setState] = useState<RegisterState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    try {
      const supabase = createClient();
      const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const normalizedAmount = Number(monthlyAmount.replace(",", "."));
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/confirm?next=/`,
          shouldCreateUser: true,
          data: {
            display_name: displayName.trim(),
            group_name: groupName.trim(),
            monthly_amount: Number.isFinite(normalizedAmount) ? normalizedAmount : 24,
          },
        },
      });

      if (error) {
        setState("error");
        setMessage(error.message);
        return;
      }

      setState("success");
      setMessage("Bestaetigungslink wurde gesendet. Nach dem Klick bist du direkt in der App.");
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
        <span className="text-sm font-semibold text-slate-300">Dein Name</span>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3">
          <UserRound className="size-4 text-slate-500" />
          <input
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Dominik Kastner"
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />
        </div>
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-300">E-Mail</span>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3">
          <Mail className="size-4 text-slate-500" />
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@firma.de"
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />
        </div>
      </label>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Gruppe</span>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3">
            <Building2 className="size-4 text-slate-500" />
            <input
              required
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Beitrag</span>
          <input
            required
            inputMode="decimal"
            value={monthlyAmount}
            onChange={(event) => setMonthlyAmount(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none"
          />
        </label>
      </div>
      <Button className="w-full" disabled={state === "loading"}>
        <Sparkles className="size-4" />
        {state === "loading" ? "Wird vorbereitet..." : "Registrieren und bestaetigen"}
      </Button>
      {message ? (
        <div
          className={`rounded-2xl border p-4 text-sm font-medium ${
            state === "success"
              ? "border-emerald-300/15 bg-emerald-400/10 text-emerald-100"
              : "border-rose-300/15 bg-rose-400/10 text-rose-100"
          }`}
        >
          {message}
        </div>
      ) : null}
    </form>
  );
}
