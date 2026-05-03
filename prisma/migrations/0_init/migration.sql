-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" BIGINT NOT NULL,
    "shop_coins" INTEGER NOT NULL DEFAULT 0,
    "total_coins_earned" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "wheel_of_life" JSONB NOT NULL DEFAULT '{}',
    "priorities_locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "plant_type" TEXT NOT NULL,
    "stage" INTEGER NOT NULL DEFAULT 0,
    "plant_res" JSONB NOT NULL DEFAULT '{}',
    "planted" BOOLEAN NOT NULL DEFAULT false,
    "tile_col" INTEGER,
    "tile_row" INTEGER,
    "completed" BOOLEAN DEFAULT false,
    "completed_at" BIGINT,
    "trophy_id" TEXT,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "due_date" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routines" (
    "id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed_today" BOOLEAN NOT NULL DEFAULT false,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "repeat_days" JSONB NOT NULL,
    "permanently_completed" BOOLEAN DEFAULT false,
    "position" INTEGER NOT NULL,

    CONSTRAINT "routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "garden_tiles" (
    "user_id" TEXT NOT NULL,
    "tile_col" INTEGER NOT NULL,
    "tile_row" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "goal_id" TEXT,
    "deco_id" TEXT,

    CONSTRAINT "garden_tiles_pkey" PRIMARY KEY ("user_id","tile_col","tile_row")
);

-- CreateTable
CREATE TABLE "owned_decos" (
    "user_id" TEXT NOT NULL,
    "deco_id" TEXT NOT NULL,

    CONSTRAINT "owned_decos_pkey" PRIMARY KEY ("user_id","deco_id")
);

-- CreateTable
CREATE TABLE "trophies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,

    CONSTRAINT "trophies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "item_id" TEXT,
    "title" TEXT NOT NULL,
    "completed_date" TEXT NOT NULL,
    "completed_at" BIGINT NOT NULL,

    CONSTRAINT "completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- CreateIndex
CREATE INDEX "goals_user_id_idx" ON "goals"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "goals_user_id_tile_col_tile_row_key" ON "goals"("user_id", "tile_col", "tile_row");

-- CreateIndex
CREATE INDEX "tasks_goal_id_idx" ON "tasks"("goal_id");

-- CreateIndex
CREATE INDEX "routines_goal_id_idx" ON "routines"("goal_id");

-- CreateIndex
CREATE UNIQUE INDEX "trophies_goal_id_key" ON "trophies"("goal_id");

-- CreateIndex
CREATE INDEX "trophies_user_id_idx" ON "trophies"("user_id");

-- CreateIndex
CREATE INDEX "completions_user_id_completed_date_idx" ON "completions"("user_id", "completed_date");

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routines" ADD CONSTRAINT "routines_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garden_tiles" ADD CONSTRAINT "garden_tiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owned_decos" ADD CONSTRAINT "owned_decos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trophies" ADD CONSTRAINT "trophies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trophies" ADD CONSTRAINT "trophies_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completions" ADD CONSTRAINT "completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

