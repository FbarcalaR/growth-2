import type { ShopRepo } from "../types";

const CATALOG = [
  { id: "fountain", name: "Stone Fountain", cost: 30, emoji: "⛲" },
  { id: "bench", name: "Garden Bench", cost: 20, emoji: "🪑" },
  { id: "lantern", name: "Lantern", cost: 15, emoji: "🏮" },
  { id: "mushroom_ring", name: "Mushroom Ring", cost: 10, emoji: "🍄" },
  { id: "rock", name: "Mossy Rock", cost: 8, emoji: "🪨" },
  { id: "butterfly", name: "Butterfly", cost: 12, emoji: "🦋" },
  { id: "rainbow", name: "Rainbow", cost: 100, emoji: "🌈" },
];

export function createInMemoryShopRepo(): ShopRepo {
  return {
    async list() {
      return CATALOG.map((item) => ({ ...item }));
    },
  };
}
