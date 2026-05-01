import type { PlantDef, PlantId } from "./types";

export const PLANT_DEFS: Record<PlantId, PlantDef> = {
  herb: {
    id: "herb",
    name: "Herb",
    primary: "water",
    secondary: "nutrients",
    requirements: [
      { water: 8, nutrients: 4 },
      { water: 16, nutrients: 8 },
      { water: 28, nutrients: 14 },
      { water: 44, nutrients: 22 },
    ],
  },
  sunflower: {
    id: "sunflower",
    name: "Sunflower",
    primary: "sunlight",
    secondary: "water",
    requirements: [
      { sunlight: 8, water: 4 },
      { sunlight: 16, water: 8 },
      { sunlight: 28, water: 14 },
      { sunlight: 44, water: 22 },
    ],
  },
  money_tree: {
    id: "money_tree",
    name: "Money Tree",
    primary: "gold",
    secondary: "sunlight",
    requirements: [
      { gold: 6, sunlight: 4 },
      { gold: 12, sunlight: 8 },
      { gold: 22, sunlight: 14 },
      { gold: 35, sunlight: 22 },
    ],
  },
  rose: {
    id: "rose",
    name: "Rose",
    primary: "love",
    secondary: "water",
    requirements: [
      { love: 8, water: 4 },
      { love: 16, water: 8 },
      { love: 28, water: 14 },
      { love: 44, water: 22 },
    ],
  },
  mushroom: {
    id: "mushroom",
    name: "Mushroom",
    primary: "nutrients",
    secondary: "moonlight",
    requirements: [
      { nutrients: 8, moonlight: 4 },
      { nutrients: 16, moonlight: 8 },
      { nutrients: 28, moonlight: 14 },
      { nutrients: 44, moonlight: 22 },
    ],
  },
  crystal: {
    id: "crystal",
    name: "Crystal",
    primary: "magic",
    secondary: "love",
    requirements: [
      { magic: 8, love: 4 },
      { magic: 16, love: 8 },
      { magic: 28, love: 14 },
      { magic: 44, love: 22 },
    ],
  },
  moon_flower: {
    id: "moon_flower",
    name: "Moon Flower",
    primary: "moonlight",
    secondary: "magic",
    requirements: [
      { moonlight: 8, magic: 4 },
      { moonlight: 16, magic: 8 },
      { moonlight: 28, magic: 14 },
      { moonlight: 44, magic: 22 },
    ],
  },
};

export const STAGE_NAMES = ["Seed", "Sprout", "Seedling", "Mature", "Blooming"] as const;
