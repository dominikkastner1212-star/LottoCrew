"use client";

import { useEffect, useMemo, useState } from "react";

function getParts(targetDate: string | null) {
  if (!targetDate) {
    return ["--", "--", "--"];
  }

  const target = new Date(`${targetDate}T20:00:00`);
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  return [days, hours, minutes].map((part) => String(part).padStart(2, "0"));
}

export function DrawCountdown({ date }: { date: string | null }) {
  const initialParts = useMemo(() => getParts(date), [date]);
  const [parts, setParts] = useState(initialParts);

  useEffect(() => {
    setParts(getParts(date));
    const interval = window.setInterval(() => setParts(getParts(date)), 30_000);
    return () => window.clearInterval(interval);
  }, [date]);

  return (
    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
      {parts.map((part, index) => (
        <div key={index} className="rounded-2xl bg-white/[.07] p-4">
          <p className="font-mono text-2xl font-semibold text-white">{part}</p>
          <p className="mt-1 text-[0.65rem] text-slate-500">{["Tage", "Std", "Min"][index]}</p>
        </div>
      ))}
    </div>
  );
}
