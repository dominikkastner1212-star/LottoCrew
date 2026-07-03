import { redirect } from "next/navigation";

// In das Dashboard integriert bzw. unter Admin verwaltet.
export default function LegacyRedirect() {
  redirect("/");
}
