import { z } from "zod";

import { AREA_KEYS } from "@/shared/areas";
import { PLANT_IDS } from "@/shared/plants";

import { GardenDtoSchema } from "./garden";
import { RoutineDtoSchema, TaskDtoSchema } from "./goal";
import { WheelOfLifeDtoSchema } from "./user";

const PlantIdSchema = z.enum(PLANT_IDS);
const StageSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

/** Schema version — bumped if we ever break the shape. Importer rejects unknown versions. */
export const EXPORT_VERSION = 1;

const AreaSchema = z.enum(AREA_KEYS);
const ResourceKeysSchema = z.string();

/**
 * Goal as exported. Strips the server-derived health fields (recomputed on
 * the next read) and keeps the persistent shape only — same fields a fresh
 * goal carries on disk.
 */
const GoalExportSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  area: AreaSchema,
  plantType: PlantIdSchema,
  stage: StageSchema,
  plantRes: z.record(ResourceKeysSchema, z.number()),
  planted: z.boolean(),
  tileCol: z.number().int().min(0).max(7).nullable(),
  tileRow: z.number().int().min(0).max(5).nullable(),
  tasks: z.array(TaskDtoSchema),
  routines: z.array(RoutineDtoSchema),
  completed: z.boolean().optional(),
  completedAt: z.number().optional(),
  trophyId: z.string().optional(),
});

export type GoalExport = z.infer<typeof GoalExportSchema>;

const CompletionExportSchema = z.object({
  id: z.string(),
  goalId: z.string(),
  kind: z.enum(["task", "routine", "goal"]),
  itemId: z.string().nullable(),
  title: z.string(),
  completedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completedAt: z.number(),
});

export type CompletionExport = z.infer<typeof CompletionExportSchema>;

const UserExportSchema = z.object({
  name: z.string().min(1),
  shopCoins: z.number().int().min(0),
  totalCoinsEarned: z.number().int().min(0),
  streak: z.number().int().min(0),
  wheelOfLife: WheelOfLifeDtoSchema,
  prioritiesLocked: z.boolean(),
});

export type UserExport = z.infer<typeof UserExportSchema>;

/**
 * Full export payload — what `GET /api/me/export` returns and what
 * `POST /api/me/import` accepts. Versioned so we can break the shape later.
 *
 * The healthState/health-derived fields are *not* exported: they're recomputed
 * on the next goal read. IDs are kept for fidelity but the importer
 * regenerates them so a snapshot from another account doesn't collide.
 */
export const ExportPayloadSchema = z.object({
  version: z.literal(EXPORT_VERSION),
  exportedAt: z.number(),
  user: UserExportSchema,
  goals: z.array(GoalExportSchema),
  garden: GardenDtoSchema,
  completions: z.array(CompletionExportSchema),
});

export type ExportPayload = z.infer<typeof ExportPayloadSchema>;
