import { Sparkles } from "lucide-react";
import { appName } from "@/lib/navigation";

export function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-11 place-items-center rounded-[1.35rem] bg-gradient-to-br from-amber-200 via-amber-400 to-violet-500 text-slate-950 shadow-[0_16px_40px_rgba(251,191,36,.2)]">
        <Sparkles className="size-5" />
      </div>
      <div>
        <p className="text-[1.05rem] font-semibold tracking-normal text-slate-900">{appName}</p>
        <p className="text-xs font-medium text-slate-500">AbteilungsJackpot</p>
      </div>
    </div>
  );
}
