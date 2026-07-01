"use client";

import { Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AppDraw, AppTicket } from "@/lib/app-data";
import { formatDate } from "@/lib/utils";

const layout = {
  startX: 1.22,
  startY: 2.08,
  colGap: 5.08,
  rowGap: 2.9,
  stepX: 0.48,
  stepY: 0.38,
  euroOffsetY: 1.52,
};

function mainPosition(number: number, tipIndex: number, adjustX: number, adjustY: number) {
  const col = tipIndex % 2;
  const row = Math.floor(tipIndex / 2);
  const numIndex = number - 1;
  return {
    x: layout.startX + col * layout.colGap + (numIndex % 10) * layout.stepX + adjustX,
    y: layout.startY + row * layout.rowGap + Math.floor(numIndex / 10) * layout.stepY + adjustY,
  };
}

function euroPosition(number: number, tipIndex: number, adjustX: number, adjustY: number) {
  const col = tipIndex % 2;
  const row = Math.floor(tipIndex / 2);
  const numIndex = number - 1;
  return {
    x: layout.startX + col * layout.colGap + (numIndex % 6) * layout.stepX + adjustX,
    y: layout.startY + row * layout.rowGap + layout.euroOffsetY + Math.floor(numIndex / 6) * layout.stepY + adjustY,
  };
}

export function PrintSheet({ draws, tickets }: { draws: AppDraw[]; tickets: AppTicket[] }) {
  const initialDrawId = draws.find((draw) => new Date(draw.date) >= new Date())?.id ?? draws[0]?.id ?? "";
  const [drawId, setDrawId] = useState(initialDrawId);
  const [adjustX, setAdjustX] = useState(0);
  const [adjustY, setAdjustY] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAdjustX(Number(window.localStorage.getItem("lottocrew_print_x") ?? "0"));
      setAdjustY(Number(window.localStorage.getItem("lottocrew_print_y") ?? "0"));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  function saveAdjustments(nextX: number, nextY: number) {
    setAdjustX(nextX);
    setAdjustY(nextY);
    window.localStorage.setItem("lottocrew_print_x", String(nextX));
    window.localStorage.setItem("lottocrew_print_y", String(nextY));
  }

  const printTickets = useMemo(() => tickets.filter((ticket) => ticket.drawId === drawId).slice(0, 14), [drawId, tickets]);

  return (
    <div>
      <div className="print-controls mb-5 grid gap-3 rounded-[28px] border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_8rem_8rem_auto] lg:items-end">
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Ziehung</span>
          <select
            value={drawId}
            onChange={(event) => setDrawId(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
          >
            {draws.map((draw) => (
              <option key={draw.id} value={draw.id}>
                {formatDate(draw.date)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">X cm</span>
          <input
            value={adjustX}
            onChange={(event) => saveAdjustments(Number(event.target.value), adjustY)}
            step="0.01"
            type="number"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Y cm</span>
          <input
            value={adjustY}
            onChange={(event) => saveAdjustments(adjustX, Number(event.target.value))}
            step="0.01"
            type="number"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
          />
        </label>
        <Button type="button" onClick={() => window.print()}>
          <Printer className="size-4" />
          Drucken
        </Button>
      </div>

      <div className="mx-auto w-fit rounded-[28px] bg-white p-4 shadow-2xl shadow-black/30">
        <div className="print-page relative h-[23cm] w-[10.6cm] overflow-hidden bg-white text-black">
          {printTickets.map((ticket, tipIndex) => (
            <div key={ticket.id}>
              {ticket.numbers.map((number) => {
                const pos = mainPosition(number, tipIndex, adjustX, adjustY);
                return <span key={`${ticket.id}-m-${number}`} className="absolute text-[0.34cm] font-black leading-none" style={{ left: `${pos.x}cm`, top: `${pos.y}cm` }}>X</span>;
              })}
              {ticket.euroNumbers.map((number) => {
                const pos = euroPosition(number, tipIndex, adjustX, adjustY);
                return <span key={`${ticket.id}-e-${number}`} className="absolute text-[0.34cm] font-black leading-none" style={{ left: `${pos.x}cm`, top: `${pos.y}cm` }}>X</span>;
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="print-controls mt-4 text-center text-sm text-slate-500">
        {printTickets.length} Tippfelder fuer diesen Schein. Maximal 14 passen auf eine Druckseite.
      </p>
    </div>
  );
}
