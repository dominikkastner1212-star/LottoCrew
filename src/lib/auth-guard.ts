import { redirect } from "next/navigation";
import { getAppContext } from "@/lib/app-data";

export async function requireAppContext() {
  const app = await getAppContext();

  if (!app.userId) {
    redirect("/login");
  }

  return app;
}
