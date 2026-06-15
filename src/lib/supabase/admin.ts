import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { assertSupabaseEnv } from "@/lib/supabase/env";

function cleanEnv(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

export function createAdminClient() {
  const { url } = assertSupabaseEnv();
  const secretKey = cleanEnv(process.env.SUPABASE_SECRET_KEY);

  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY fehlt. Setze den Supabase service_role Key in Railway Variables.");
  }

  return createSupabaseClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
