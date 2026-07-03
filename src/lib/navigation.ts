import {
  CalendarDays,
  CreditCard,
  Crown,
  Gauge,
  Settings,
  Sparkles,
  Ticket,
  Wallet,
} from "lucide-react";

export const appName = "LottoCrew";

export const navigation = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/tipps", label: "Tipps", icon: Ticket },
  { href: "/ziehungen", label: "Ziehungen", icon: CalendarDays },
  { href: "/kasse", label: "Kasse", icon: Wallet },
  { href: "/einstellungen", label: "Admin", icon: Settings },
] as const;

export const quickActions = [
  { label: "Tipp anlegen", icon: Ticket, href: "/tipps" },
  { label: "Zahlung abhaken", icon: CreditCard, href: "/kasse" },
  { label: "Gewinn erfassen", icon: Sparkles, href: "/kasse" },
  { label: "Mitglied einladen", icon: Crown, href: "/einstellungen" },
];
