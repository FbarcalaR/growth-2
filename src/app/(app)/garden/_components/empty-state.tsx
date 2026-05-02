import { Sprout } from "lucide-react";

import { Button } from "@/components/atoms";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-surface-card border-input-border mt-2 flex flex-col items-center gap-3 rounded-xl border-[1.5px] border-dashed px-6 py-12 text-center">
      <Sprout size={36} className="text-brand-muted" aria-hidden />
      <div>
        <p className="text-brand-700 text-sm font-bold">Plant your first goal</p>
        <p className="text-brand-muted mt-1 max-w-xs text-xs">
          Create a goal to get started. Each goal grows a unique plant in your garden.
        </p>
      </div>
      <Button onClick={onCreate}>Create first goal</Button>
    </div>
  );
}
