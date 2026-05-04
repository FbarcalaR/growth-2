/**
 * Database seed (Epic A). Drops every row owned by users named "Ada" or
 * "Demo" and re-creates a tiny demo state so a fresh Postgres branch lights
 * up the UI immediately. Idempotent — running it twice on the same database
 * produces the same end state.
 *
 * Usage: `pnpm db:seed` (requires `DATABASE_URL` in the env).
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Wipe the demo accounts (cascade-deletes their goals / tiles / completions).
  await prisma.user.deleteMany({ where: { name: { in: ["Ada", "Demo"] } } });

  const ada = await prisma.user.create({
    data: {
      id: "user_seed_ada",
      name: "Ada",
      createdAt: BigInt(Date.now()),
      shopCoins: 50,
      totalCoinsEarned: 120,
      streak: 3,
      wheelOfLife: {
        health: 5,
        career: 5,
        finances: 4,
        relationships: 5,
        personal: 4,
        fun: 4,
        spirituality: 3,
      },
      prioritiesLocked: true,
      goals: {
        create: [
          {
            id: "goal_seed_5k",
            title: "Run a 5K",
            area: "health",
            plantType: "herb",
            stage: 1,
            plantRes: { water: 4, sunlight: 2 },
            planted: true,
            tileCol: 0,
            tileRow: 4,
            tasks: {
              create: [
                {
                  id: "task_seed_shoes",
                  title: "Buy running shoes",
                  completed: true,
                  position: 0,
                },
                {
                  id: "task_seed_route",
                  title: "Map a 5K route",
                  completed: false,
                  position: 1,
                },
              ],
            },
            routines: {
              create: [
                {
                  id: "routine_seed_run",
                  title: "Run twice a week",
                  completedToday: false,
                  streak: 1,
                  repeatDays: [true, false, true, false, true, false, false],
                  position: 0,
                },
              ],
            },
          },
          {
            id: "goal_seed_books",
            title: "Read 12 books",
            area: "personal",
            plantType: "rose",
            stage: 0,
            plantRes: {},
            planted: false,
            routines: {
              create: [
                {
                  id: "routine_seed_read",
                  title: "Read 30 minutes",
                  completedToday: false,
                  streak: 0,
                  repeatDays: [true, true, true, true, true, true, true],
                  position: 0,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded user "${ada.name}" (id=${ada.id}) with 2 goals.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
