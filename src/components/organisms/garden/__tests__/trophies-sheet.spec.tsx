// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { GardenDto } from "@/shared/schemas/garden";
import { makeGoalDto } from "@/test/fixtures/dto";

import { TrophiesSheet } from "../trophies-sheet";

function emptyGarden(owned: string[] = []): GardenDto {
  return {
    decoGrid: Array.from({ length: 8 }, () => Array.from({ length: 6 }, () => null)),
    owned,
  };
}

describe("<TrophiesSheet />", () => {
  it("renders an empty-state when no trophies are owned", () => {
    const { getByText } = render(
      <TrophiesSheet open goals={[]} garden={emptyGarden()} onClose={() => undefined} />,
    );
    expect(getByText(/Complete a goal to earn your first trophy/i)).not.toBeNull();
  });

  it("lists each `trophy_<goalId>` resolved to its goal title", () => {
    const goal = makeGoalDto({ id: "g1", title: "Run a 5K", completed: true });
    const { getByText, queryByText } = render(
      <TrophiesSheet
        open
        goals={[goal]}
        garden={emptyGarden(["trophy_g1", "fountain"])}
        onClose={() => undefined}
      />,
    );
    expect(getByText("Run a 5K")).not.toBeNull();
    expect(queryByText(/Complete a goal/)).toBeNull();
  });

  it("ignores trophy ids whose goal no longer exists", () => {
    const { queryByText, getByText } = render(
      <TrophiesSheet
        open
        goals={[]}
        garden={emptyGarden(["trophy_missing"])}
        onClose={() => undefined}
      />,
    );
    expect(getByText(/0 unlocked/)).not.toBeNull();
    expect(queryByText("Run a 5K")).toBeNull();
  });
});
