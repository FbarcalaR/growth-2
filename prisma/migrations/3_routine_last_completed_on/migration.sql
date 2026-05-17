-- Replace the `routines.completed_today` boolean with `last_completed_on`
-- (ISO date). The old field couldn't roll over at midnight — once flipped
-- true, it stayed true forever. The new field carries the actual day the
-- routine was last marked complete; the wire `completedToday` boolean is
-- derived against the current date at the DTO boundary.
--
-- Backfill: any row that has `completed_today = true` is treated as
-- "completed on the day this migration ran" (UTC). Slight TZ inaccuracy
-- is fine — the field was effectively meaningless under the old contract,
-- so the worst case is the user sees one stale "completed today" carry
-- over from the migration.

-- 1) Add the new column.
ALTER TABLE "routines" ADD COLUMN "last_completed_on" TEXT;

-- 2) Backfill from the old boolean. Tomorrow's reads then compute
--    `completedToday = false` (different day) and the routine looks
--    uncompleted, which is exactly the new contract.
UPDATE "routines"
SET    "last_completed_on" = TO_CHAR((NOW() AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD')
WHERE  "completed_today" = true;

-- 3) Drop the deprecated boolean.
ALTER TABLE "routines" DROP COLUMN "completed_today";
