"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { signOut } from "@/app/actions";
import { AppLogo } from "@/components/app-logo";
import { InstallHint } from "@/components/install-hint";
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
                      ? "bg-amber-100 text-slate-900 shadow-[0_10px_28px_rgba(232,166,0,.14)]"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <Icon className={cn("size-4", active ? "text-amber-600" : "text-slate-400 group-hover:text-amber-500")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">Admin-Fokus</p>
            <p className="mt-1 text-xs leading-5 text-amber-800/80">Ziehungen, Tipps und Beiträge in wenigen Klicks pflegen.</p>
            <LinkButton href="/einstellungen" className="mt-4 w-full" variant="secondary">
              Aktionen
            </LinkButton>
          </div>
        </aside>

        <main className="relative flex min-w-0 flex-1 flex-col pb-24 lg:pb-4">
          <header className="glass-panel sticky top-3 z-30 mb-4 flex items-center gap-3 rounded-[24px] px-3 py-2.5 sm:px-4 sm:py-3 lg:top-4 lg:mb-5 lg:rounded-[28px]">
            <div className="lg:hidden">
              <AppLogo />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <form action={signOut}>
                <Button variant="ghost" className="size-11 rounded-2xl p-0" aria-label="Abmelden">
                  <LogOut className="size-5" />
                </Button>
              </form>
            </div>
          </header>
          <InstallHint />
          <PageTransition pathname={pathname}>{children}</PageTransition>
        </main>
      </div>

      <nav
        className="fixed inset-x-3 bottom-3 z-40 flex gap-1 overflow-x-auto rounded-[28px] border border-white/60 bg-white/70 p-2 shadow-[0_18px_45px_rgba(26,29,36,0.16)] backdrop-blur-xl lg:hidden"
        style={{ WebkitBackdropFilter: "blur(20px)" }}
      >
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-14 min-w-20 select-none touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl text-[0.68rem] font-semibold transition active:scale-95",
                active ? "text-slate-900" : "text-slate-500",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="dock-active"
                  className="absolute inset-0 rounded-2xl bg-amber-100"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              ) : null}
              <motion.span
                className="relative"
                animate={{ scale: active ? 1.18 : 1, y: active ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 20 }}
              >
                <Icon className={cn("size-4", active ? "text-amber-600" : "")} />
              </motion.span>
              <span className="relative">{item.label}</span>
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
    <div className="mb-5 flex flex-col gap-4 md:mb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-900 sm:text-4xl md:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">{description}</p>
      </div>
      {action ? <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap md:justify-end">{action}</div> : null}
    </div>
  );
}

export function QuickActionRail() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            href={action.href}
            className="group flex select-none touch-manipulation items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:bg-slate-100 active:scale-[0.98]"
          >
            <span className="text-sm font-semibold text-slate-900">{action.label}</span>
            <span className="grid size-10 place-items-center rounded-2xl bg-amber-100 text-amber-600 transition group-hover:bg-amber-300 group-hover:text-slate-950">
              <Icon className="size-4" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function PageTransition({ pathname, children }: { pathname: string; children: ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.22, 0.8, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
