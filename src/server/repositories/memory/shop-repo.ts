import type { DecoItem } from "../../domain/garden/types";
import type { ShopRepo } from "../shop-repo";

const CATALOG: DecoItem[] = [
  { id: "stone_path", name: "Stone Path", cost: 25, emoji: "🪨", rarity: "common" },
  { id: "fence", name: "Picket Fence", cost: 30, emoji: "🪵", rarity: "common" },
  { id: "bench", name: "Garden Bench", cost: 40, emoji: "🪑", rarity: "common" },
  { id: "lantern", name: "Lantern", cost: 75, emoji: "🏮", rarity: "rare" },
  { id: "birdbath", name: "Bird Bath", cost: 90, emoji: "🐦", rarity: "rare" },
  { id: "windmill", name: "Windmill", cost: 110, emoji: "🌀", rarity: "rare" },
  { id: "arch", name: "Flower Arch", cost: 160, emoji: "🌸", rarity: "epic" },
  { id: "koi_pond", name: "Koi Pond", cost: 200, emoji: "🐠", rarity: "epic" },
  { id: "fountain", name: "Fountain", cost: 300, emoji: "⛲", rarity: "legendary" },
  { id: "pagoda", name: "Pagoda", cost: 420, emoji: "⛩️", rarity: "legendary" },
];

export function createInMemoryShopRepo(): ShopRepo {
  return {
    async list() {
      return CATALOG.map((item) => ({ ...item }));
    },
  };
}
