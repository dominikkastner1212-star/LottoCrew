"use client";

import { KeyRound, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";

type SetPasswordState = "idle" | "loading" | "success" | "error";

export function SetPasswordForm({ next }: { next: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [state, setState] = useState<SetPasswordState>("idle");
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
      const { error } = await supabase.auth.updateUser({
        password,
        data: { must_change_password: false },
      });

      if (error) {
        setState("error");
        setMessage(error.message);
        return;
      }

      setState("success");
      setMessage("Passwort gespeichert. Du wirst weitergeleitet.");
      router.replace(next);
      router.refresh();
    } catch (error) {
      setState("error");
      const errorMessage = error instanceof Error ? error.message : "";
      setMessage(
        errorMessage === "Failed to fetch"
          ? "Supabase ist nicht erreichbar. Bitte spaeter erneut versuchen."
          : errorMessage || "Passwort konnte nicht gespeichert werden.",
      );
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-semibold text-slate-500">Neues Passwort</span>
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
      <Button className="w-full" disabled={state === "loading"}>
        <ShieldCheck className="size-4" />
        {state === "loading" ? "Wird gespeichert..." : "Passwort speichern"}
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
