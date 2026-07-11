"use client";

import { FileText, Search, SlidersHorizontal, Target } from "lucide-react";
import { useMemo, useState } from "react";

import { NumberRow } from "@/components/number-row";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
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
    const normalizedQuery = query.toLowerCase();
    return tickets.filter((ticket) => {
      const matchesQuery = `${ticket.label} ${ticket.id} ${ticket.createdByName}`.toLowerCase().includes(normalizedQuery);
      const matchesStatus = status === "alle" || ticket.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, tickets]);

  return (
    <div>
      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Search className="size-4 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tipp, ID oder Mitglied suchen..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
          <SlidersHorizontal className="ml-2 size-4 shrink-0 text-slate-500" />
          {statusOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatus(option)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                status === option ? "bg-amber-100 text-slate-900" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {statusLabels[option]}
            </button>
          ))}
        </div>
      </div>

      <Stagger key={`${status}-${query}`} className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <StaggerItem key={ticket.id}>
            <Surface className="transition hover:bg-slate-100">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">{ticket.label}</h2>
                    <StatusPill status={ticket.status as "planned" | "submitted" | "evaluated"} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {ticket.createdByName ? `von ${ticket.createdByName}` : "Gemeinschaftstipp"} - Ziehung{" "}
                    {ticket.date ? formatDate(ticket.date) : "noch nicht zugeordnet"}
                  </p>
                </div>
                <NumberRow numbers={ticket.numbers} euroNumbers={ticket.euroNumbers} />
                <div className="grid grid-cols-2 gap-3 text-right sm:min-w-52">
                  <div>
                    <p className="text-xs text-slate-500">Einsatz</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(ticket.stake)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Gewinn</p>
                    <p className="font-semibold text-emerald-700">{formatCurrency(ticket.winnings)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {ticket.prizeRank ? (
                  ticket.winnings <= 0 ? (
                    <StatusPill status="amount_open" />
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                      <Target className="size-3.5" />
                      {ticket.prizeRank} - {ticket.mainMatches}+{ticket.euroMatches}
                    </span>
                  )
                ) : ticket.status === "evaluated" ? (
                  <StatusPill status="no_win" />
                ) : null}
                {ticket.imageUrl ? (
                  <a
                    href={ticket.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-semibold text-amber-700 transition hover:bg-amber-300 hover:text-slate-950"
                  >
                    <FileText className="size-3.5" />
                    Spielschein
                  </a>
                ) : null}
              </div>
            </Surface>
          </StaggerItem>
        ))}
        {filteredTickets.length === 0 ? (
          <Surface className="py-10 text-center text-sm text-slate-500">
            Keine Tipps für diese Auswahl vorhanden.
          </Surface>
        ) : null}
      </Stagger>
    </div>
  );
}
