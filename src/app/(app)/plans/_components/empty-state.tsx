import { Sprout } from "lucide-react";

export function EmptyState() {
  return (
    <div className="bg-surface-card mt-2 flex flex-col items-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#C8E6C9] px-6 py-12 text-center">
      <Sprout size={36} className="text-brand-muted" aria-hidden />
      <p className="text-brand-700 text-sm font-bold">Plant your first goal</p>
      <p className="text-brand-muted max-w-xs text-xs">
        Create a goal to get started. Each goal grows a unique plant in your garden.
      </p>
    </div>
  );
}
