"use client";

import { Dices, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { createMemberTicket, createTicket } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/panel";
import type { AppDraw } from "@/lib/app-data";
import { formatDate } from "@/lib/utils";

function pickUnique(max: number, count: number) {
  const values = Array.from({ length: max }, (_, index) => index + 1);
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }

  return values.slice(0, count).sort((a, b) => a - b);
}

export function TicketEntryForm({
  groupId,
  draws,
  isAdmin,
}: {
  groupId: string;
  draws: AppDraw[];
  isAdmin: boolean;
}) {
  const nextDraw = useMemo(() => {
    const today = new Date();
    return draws.find((draw) => new Date(draw.date) >= today) ?? draws[0];
  }, [draws]);
  const [mainNumbers, setMainNumbers] = useState(["", "", "", "", ""]);
  const [euroNumbers, setEuroNumbers] = useState(["", ""]);

  function randomize() {
    setMainNumbers(pickUnique(50, 5).map(String));
    setEuroNumbers(pickUnique(12, 2).map(String));
  }

  function updateMain(index: number, value: string) {
    setMainNumbers((current) => current.map((number, currentIndex) => (currentIndex === index ? value : number)));
  }

  function updateEuro(index: number, value: string) {
    setEuroNumbers((current) => current.map((number, currentIndex) => (currentIndex === index ? value : number)));
  }

  return (
    <Surface>
      <form action={isAdmin ? createTicket : createMemberTicket} className="space-y-4">
        <input type="hidden" name="group_id" value={groupId} />
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_10rem]">
          <label className="block">
            <span className="text-sm font-semibold text-slate-500">Tippname</span>
            <input
              name="label"
              required
              defaultValue={isAdmin ? "Eurojackpot Runde" : "Mein Eurojackpot-Tipp"}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-500">Ziehung</span>
            <select
              name="draw_id"
              required
              defaultValue={nextDraw?.id ?? ""}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
            >
              <option value="">Auswaehlen</option>
              {draws.map((draw) => (
                <option key={draw.id} value={draw.id}>
                  {formatDate(draw.date)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-500">Einsatz</span>
            <input
              name="stake_amount"
              inputMode="decimal"
              required
              defaultValue="2"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          {mainNumbers.map((number, index) => (
            <input
              key={`main-${index}`}
              name={`main_${index + 1}`}
              inputMode="numeric"
              min={1}
              max={50}
              required
              value={number}
              onChange={(event) => updateMain(index, event.target.value)}
              placeholder={`Zahl ${index + 1}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
            />
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
          {euroNumbers.map((number, index) => (
            <input
              key={`euro-${index}`}
              name={`extra_${index + 1}`}
              inputMode="numeric"
              min={1}
              max={12}
              required
              value={number}
              onChange={(event) => updateEuro(index, event.target.value)}
              placeholder={`Eurozahl ${index + 1}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
            />
          ))}
          <Button type="button" variant="secondary" onClick={randomize}>
            <Dices className="size-4" />
            Zufall
          </Button>
          <Button disabled={draws.length === 0}>
            <Save className="size-4" />
            Tipp speichern
          </Button>
        </div>
      </form>
    </Surface>
  );
}
