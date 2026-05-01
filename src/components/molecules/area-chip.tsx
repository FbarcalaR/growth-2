import { Chip } from "@/components/atoms";
import { AREA_META, type Area } from "@/shared/areas";

type AreaChipProps = {
  area: Area;
  className?: string;
};

export function AreaChip({ area, className }: AreaChipProps) {
  const meta = AREA_META[area];
  return (
    <Chip tone={area} leadingIcon={meta.icon} className={className}>
      {meta.label}
    </Chip>
  );
}
