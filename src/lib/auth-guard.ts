import { redirect } from "next/navigation";
import { getAppContext } from "@/lib/app-data";
import { createClient } from "@/lib/supabase/server";

export async function requireAppContext() {
  const app = await getAppContext();

  if (!app.userId) {
    redirect("/login");
  }

  // Vom Admin mit Startpasswort angelegte Mitglieder muessen es beim ersten
  // Login aendern, bevor sie die App nutzen koennen.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.user_metadata?.must_change_password) {
    redirect("/passwort-festlegen?first=1");
  }

  return app;
}
