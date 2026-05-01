import type { GardenState } from "../../domain/garden/types";
import type { GardenDto } from "@/shared/schemas/garden";

/** Domain `GardenState` → wire `GardenDto`. Drops `userId` (the wire is already user-scoped). */
export function gardenToDto(garden: GardenState): GardenDto {
  return {
    decoGrid: garden.decoGrid.map((c) => [...c]) as GardenDto["decoGrid"],
    owned: [...garden.owned],
  };
}
