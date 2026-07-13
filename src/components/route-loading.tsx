import { AppShell, PageHeader } from "@/components/app-shell";
import { Panel, Surface } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn("h-3 rounded-full bg-slate-200", className)} />;
}

function SkeletonCard() {
  return (
    <Surface className="min-h-36">
      <SkeletonLine className="w-16" />
      <SkeletonLine className="mt-6 h-7 w-28" />
      <SkeletonLine className="mt-4 w-full" />
      <SkeletonLine className="mt-2 w-2/3" />
    </Surface>
  );
}

export function RouteLoading({
  title,
  description,
  cards = 6,
}: {
  title: string;
  description: string;
  cards?: number;
}) {
  return (
    <AppShell>
      <PageHeader title={title} description={description} />
      <Panel>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: cards }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
