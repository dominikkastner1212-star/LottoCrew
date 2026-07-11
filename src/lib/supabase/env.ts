function cleanEnv(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

export function getSupabaseEnv() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  return { url, key };
}

export function assertSupabaseEnv() {
  const env = getSupabaseEnv();

  if (!env.url || !env.key) {
    throw new Error("Supabase ist nicht konfiguriert. Bitte Railway Variables prüfen.");
  }

  if (!env.url.startsWith("https://") || !env.url.includes(".supabase.co")) {
    throw new Error("Supabase URL ist ungültig. Erwartet wird https://projekt-ref.supabase.co");
  }

  return {
    url: env.url,
    key: env.key,
  };
}
