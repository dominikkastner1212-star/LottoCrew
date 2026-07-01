import type { MonthlyStat } from "@/lib/app-data";

export function ChartBars({ monthlyStats }: { monthlyStats: MonthlyStat[] }) {
  if (monthlyStats.length === 0) {
    return (
      <div className="mt-5 grid h-48 place-items-center rounded-3xl border border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
        Noch keine Statistikdaten vorhanden.
      </div>
    );
  }

  const max = Math.max(...monthlyStats.map((item) => Math.max(item.stake, item.winnings)), 1);

  return (
    <div className="mt-5 flex h-48 items-end gap-3">
      {monthlyStats.map((item) => (
        <div key={item.month} className="flex h-full flex-1 flex-col justify-end gap-2">
          <div className="flex flex-1 items-end gap-1.5">
            <div
              className="w-full rounded-t-xl bg-slate-100"
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
