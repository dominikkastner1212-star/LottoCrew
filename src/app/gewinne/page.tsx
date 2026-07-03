import { redirect } from "next/navigation";

// Zusammengelegt: Beitraege und Gewinne leben jetzt gemeinsam unter /kasse.
export default function LegacyRedirect() {
  redirect("/kasse");
}
