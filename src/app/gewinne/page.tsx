import { redirect } from "next/navigation";

// Zusammengelegt: Beiträge und Gewinne leben jetzt gemeinsam unter /kasse.
export default function LegacyRedirect() {
  redirect("/kasse");
}
