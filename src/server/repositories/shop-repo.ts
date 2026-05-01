import type { DecoItem } from "../domain/garden/types";

export type ShopRepo = {
  /** The shop catalog is global (not per-user); listed here so the boundary stays uniform. */
  list(): Promise<DecoItem[]>;
};
