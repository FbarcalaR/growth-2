export type DomainErrorCode =
  | "GOAL_NOT_FOUND"
  | "TASK_NOT_FOUND"
  | "ROUTINE_NOT_FOUND"
  | "TILE_OUT_OF_BOUNDS"
  | "TILE_OCCUPIED"
  | "GOAL_ALREADY_PLANTED"
  | "GOAL_ALREADY_COMPLETED"
  | "GOAL_NOT_PLANTED"
  | "INSUFFICIENT_COINS"
  | "DECO_NOT_OWNED"
  | "DECO_ALREADY_OWNED"
  | "PRIORITIES_ALREADY_LOCKED"
  | "INVALID_INPUT";

/**
 * A broken business invariant (programmer error or boundary-validation failure).
 * Services let these bubble; the HTTP error mapper turns them into 4xx responses.
 */
export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message?: string) {
    super(message ?? code);
    this.name = "DomainError";
    this.code = code;
  }
}
