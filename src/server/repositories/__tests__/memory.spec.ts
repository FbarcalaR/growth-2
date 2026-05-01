import { describe } from "vitest";

import { createInMemoryRepositories } from "../memory";

import { runRepositoryConformance } from "./conformance";

describe("In-memory repositories", () => {
  runRepositoryConformance(() => createInMemoryRepositories());
});
