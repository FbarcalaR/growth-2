import type { Completion } from "../domain/completion/types";
import type { ISODate } from "../domain/clock";
import type { UserId } from "../domain/user/types";

/**
 * Append-only log of task/routine/goal completion events. The History tab
 * reads it through `history-service`; toggle paths in `goal-service` write it.
 *
 * Implementations must keep events ordered by `completedAt` for stable rendering.
 */
export type CompletionRepo = {
  append(event: Completion): Promise<Completion>;
  /**
   * All events for `userId` whose `completedDate` is between `from` and `to`
   * (both inclusive). The History tab queries one calendar month at a time.
   */
  listByUserBetween(userId: UserId, from: ISODate, to: ISODate): Promise<Completion[]>;
  /** Drop every event owned by `userId`. Used by the reset / import flows. */
  deleteAllByUser(userId: UserId): Promise<void>;
};
