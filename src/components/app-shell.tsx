"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Command, LogOut, Menu, Search } from "lucide-react";
import type { ReactNode } from "react";
import { AppLogo } from "@/components/app-logo";
import { Button, LinkButton } from "@/components/ui/button";
import { navigation, quickActions } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="soft-grid pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60" />
      <div className="mx-auto flex min-h-screen w-full max-w-[1540px] gap-5 px-4 py-4 sm:px-5 lg:px-6">
        <aside className="glass-panel sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 flex-col rounded-[32px] p-4 lg:flex">
          <div className="px-2 py-2">
            <AppLogo />
          </div>
          <nav className="mt-8 flex flex-1 flex-col gap-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition",
                    active
                      ? "bg-white text-slate-950 shadow-[0_16px_45px_rgba(255,255,255,.14)]"
                      : "text-slate-300 hover:bg-white/[.08] hover:text-white",
                  )}
                >
                  <Icon className={cn("size-4", active ? "text-violet-600" : "text-slate-400 group-hover:text-amber-200")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-sm font-semibold text-amber-100">Admin-Fokus</p>
            <p className="mt-1 text-xs leading-5 text-amber-100/70">Ziehungen, Tipps und Beitrage in wenigen Klicks pflegen.</p>
            <LinkButton href="/einstellungen" className="mt-4 w-full" variant="secondary">
              Aktionen
            </LinkButton>
          </div>
        </aside>

        <main className="relative flex min-w-0 flex-1 flex-col pb-24 lg:pb-4">
          <header className="glass-panel sticky top-4 z-30 mb-5 flex items-center gap-3 rounded-[28px] px-4 py-3 lg:top-4">
            <div className="lg:hidden">
              <Button variant="ghost" className="size-11 rounded-2xl p-0" aria-label="Menue">
                <Menu className="size-5" />
              </Button>
            </div>
            <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.055] px-3 py-2 md:flex">
              <Search className="size-4 text-slate-400" />
              <input
                aria-label="Suchen"
                placeholder="Suchen nach Tipp, Mitglied, Zahlung..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
              />
              <kbd className="rounded-lg border border-white/10 bg-white/[.06] px-2 py-1 text-[0.68rem] text-slate-400">
                <Command className="mr-1 inline size-3" />K
              </kbd>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="secondary" className="hidden sm:inline-flex">
                <Bell className="size-4" />
                2 offen
              </Button>
              <LinkButton href="/login" variant="ghost" className="size-11 rounded-2xl p-0" aria-label="Abmelden">
                <LogOut className="size-5" />
              </LinkButton>
            </div>
          </header>
          {children}
        </main>
      </div>

      <nav className="glass-panel fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-1 rounded-[28px] p-2 lg:hidden">
        {navigation.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.68rem] font-semibold transition",
                active ? "bg-white text-slate-950" : "text-slate-400 hover:bg-white/[.08] hover:text-white",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-white md:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">{description}</p>
      </div>
      {action ? <div className="flex shrink-0 gap-2">{action}</div> : null}
    </div>
  );
}

export function QuickActionRail() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            className="group flex items-center justify-between rounded-3xl border border-white/10 bg-white/[.055] p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[.09]"
          >
            <span className="text-sm font-semibold text-white">{action.label}</span>
            <span className="grid size-10 place-items-center rounded-2xl bg-white/[.08] text-amber-200 transition group-hover:bg-amber-300 group-hover:text-slate-950">
              <Icon className="size-4" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
