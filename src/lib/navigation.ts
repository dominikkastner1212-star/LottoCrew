import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Crown,
  Gauge,
  Printer,
  Settings,
  Sparkles,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";

export const appName = "LottoCrew";

export const navigation = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/tipps", label: "Tipps", icon: Ticket },
  { href: "/ziehungen", label: "Ziehungen", icon: CalendarDays },
  { href: "/teilnehmer", label: "Teilnehmer", icon: Users },
  { href: "/zahlungen", label: "Zahlungen", icon: CreditCard },
  { href: "/gewinne", label: "Gewinne", icon: Trophy },
  { href: "/statistiken", label: "Statistiken", icon: BarChart3 },
  { href: "/druck", label: "Druck", icon: Printer },
  { href: "/einstellungen", label: "Admin", icon: Settings },
] as const;

export const quickActions = [
  { label: "Tipp anlegen", icon: Ticket },
  { label: "Zahlung abhaken", icon: CreditCard },
  { label: "Gewinn erfassen", icon: Sparkles },
  { label: "Mitglied einladen", icon: Crown },
];
