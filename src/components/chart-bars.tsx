import { monthlyStats } from "@/lib/sample-data";

export function ChartBars() {
  const max = Math.max(...monthlyStats.map((item) => item.stake));

  return (
    <div className="mt-5 flex h-48 items-end gap-3">
      {monthlyStats.map((item) => (
        <div key={item.month} className="flex h-full flex-1 flex-col justify-end gap-2">
          <div className="flex flex-1 items-end gap-1.5">
            <div
              className="w-full rounded-t-xl bg-white/[.09]"
              style={{ height: `${Math.max(12, (item.stake / max) * 100)}%` }}
              title={`Einsatz ${item.stake}`}
            />
            <div
              className="w-full rounded-t-xl bg-gradient-to-t from-emerald-500 to-amber-300"
              style={{ height: `${Math.max(8, (item.winnings / max) * 100)}%` }}
              title={`Gewinn ${item.winnings}`}
            />
          </div>
          <span className="text-center text-xs font-semibold text-slate-500">{item.month}</span>
        </div>
      ))}
    </div>
  );
}
