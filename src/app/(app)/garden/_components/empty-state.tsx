import { Button } from "@/components/atoms";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-surface-card border-input-border mt-2 flex flex-col items-center gap-3 rounded-[20px] border-2 border-dashed px-7 py-7 text-center">
      <div className="text-4xl" aria-hidden>
        🌱
      </div>
      <div>
        <p className="text-brand-700 text-[15px] font-bold">Plant your first goal</p>
        <p className="text-brand-muted mt-1.5 max-w-xs text-[13px] leading-snug">
          Create a goal to get started. Each goal grows a unique plant in your garden.
        </p>
      </div>
      <Button onClick={onCreate} className="rounded-[14px]">
        Create First Goal
      </Button>
    </div>
  );
}
