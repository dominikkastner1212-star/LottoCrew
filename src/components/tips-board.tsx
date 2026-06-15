"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { NumberRow } from "@/components/number-row";
import { StatusPill } from "@/components/status-pill";
import { Surface } from "@/components/ui/panel";
import type { AppTicket } from "@/lib/app-data";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusOptions = ["alle", "planned", "submitted", "evaluated"] as const;
const statusLabels = {
  alle: "alle",
  planned: "geplant",
  submitted: "abgegeben",
  evaluated: "ausgewertet",
};

export function TipsBoard({ tickets }: { tickets: AppTicket[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("alle");

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesQuery = `${ticket.label} ${ticket.id}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "alle" || ticket.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, tickets]);

  return (
    <div>
      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.055] px-4 py-3">
          <Search className="size-4 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tipp oder ID suchen..."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[.055] p-1.5">
          <SlidersHorizontal className="ml-2 size-4 shrink-0 text-slate-500" />
          {statusOptions.map((option) => (
            <button
              key={option}
              onClick={() => setStatus(option)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                status === option ? "bg-white text-slate-950" : "text-slate-400 hover:bg-white/[.08] hover:text-white"
              }`}
            >
              {statusLabels[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <Surface key={ticket.id} className="transition hover:bg-white/[.085]">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-white">{ticket.label}</h2>
                  <StatusPill status={ticket.status as "planned" | "submitted" | "evaluated"} />
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {ticket.id} - Ziehung {ticket.date ? formatDate(ticket.date) : "noch nicht zugeordnet"}
                </p>
              </div>
              <NumberRow numbers={ticket.numbers} euroNumbers={ticket.euroNumbers} />
              <div className="grid grid-cols-2 gap-3 text-right sm:min-w-52">
                <div>
                  <p className="text-xs text-slate-500">Einsatz</p>
                  <p className="font-semibold text-white">{formatCurrency(ticket.stake)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Gewinn</p>
                  <p className="font-semibold text-emerald-100">{formatCurrency(ticket.winnings)}</p>
                </div>
              </div>
            </div>
          </Surface>
        ))}
        {filteredTickets.length === 0 ? (
          <Surface className="py-10 text-center text-sm text-slate-500">
            Keine Tipps vorhanden. Admins koennen neue Eurojackpot-Tipps anlegen.
          </Surface>
        ) : null}
      </div>
    </div>
  );
}
