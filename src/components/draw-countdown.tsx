"use client";

import { useEffect, useMemo, useState } from "react";

function getParts(targetDate: string | null, now: number) {
  if (!targetDate) {
    return ["--", "--", "--"];
  }

  const target = new Date(`${targetDate}T20:00:00`);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  return [days, hours, minutes].map((part) => String(part).padStart(2, "0"));
}

export function DrawCountdown({ date }: { date: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  const parts = useMemo(() => getParts(date, now), [date, now]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 flex items-stretch justify-center gap-2">
      {parts.map((part, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="min-w-[3.5rem] rounded-2xl bg-slate-50 p-4 text-center">
            <p className="font-mono text-2xl font-semibold text-slate-900">{part}</p>
            <p className="mt-1 text-[0.65rem] text-slate-500">{["Tage", "Std", "Min"][index]}</p>
          </div>
          {index < parts.length - 1 ? (
            <span className="pb-4 text-2xl font-semibold text-amber-500">:</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
