"use client";

import { Mail, Sparkles } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";

type LoginState = "idle" | "loading" | "success" | "error";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<LoginState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    try {
      const supabase = createClient();
      const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/confirm?next=/`,
          shouldCreateUser: false,
        },
      });

      if (error) {
        setState("error");
        setMessage(error.message);
        return;
      }

      setState("success");
      setMessage("Magic Link wurde versendet. Nach dem Klick bist du direkt in der App.");
    } catch (error) {
      setState("error");
      const message = error instanceof Error ? error.message : "";
      setMessage(
        message === "Failed to fetch"
          ? "Supabase ist nicht erreichbar. Bitte NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Railway pruefen und danach neu deployen."
          : message || "Der Magic Link konnte nicht gesendet werden.",
      );
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
      <Button className="w-full" disabled={state === "loading"}>
        <Sparkles className="size-4" />
        {state === "loading" ? "Wird gesendet..." : "Magic Link senden"}
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
