import { redirect } from "next/navigation";
import { getAppContext, type AppContextOptions } from "@/lib/app-data";
import { createClient } from "@/lib/supabase/server";

export async function requireAppContext(options?: AppContextOptions) {
  const app = await getAppContext(options);

  if (!app.userId) {
    redirect("/login");
  }

  // Vom Admin mit Startpasswort angelegte Mitglieder müssen es beim ersten
  // Login ändern, bevor sie die App nutzen können.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.user_metadata?.must_change_password) {
    redirect("/passwort-festlegen?first=1");
  }

  return app;
}
