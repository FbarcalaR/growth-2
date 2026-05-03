// @vitest-environment jsdom
import { fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { GardenDto } from "@/shared/schemas/garden";
import type { DecoItemDto } from "@/shared/schemas/shop";
import type { UserDto } from "@/shared/schemas/user";
import { setupFetchMock } from "@/test/fetch-mock";
import { renderWithQuery } from "@/test/render";

import { DecoShopSheet } from "../deco-shop-sheet";

vi.mock("next/navigation", () => ({
  usePathname: () => "/garden",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

function emptyGarden(owned: string[] = []): GardenDto {
  return {
    decoGrid: Array.from({ length: 8 }, () => Array.from({ length: 6 }, () => null)),
    owned,
  };
}

const CATALOG: DecoItemDto[] = [
  { id: "stone_path", name: "Stone Path", cost: 25, emoji: "🪨", rarity: "common" },
  { id: "fountain", name: "Fountain", cost: 300, emoji: "⛲", rarity: "legendary" },
];

function user(overrides: Partial<UserDto> = {}): UserDto {
  return {
    id: "u1",
    name: "Ada",
    createdAt: 1,
    shopCoins: 50,
    totalCoinsEarned: 50,
    streak: 0,
    wheelOfLife: {
      health: 1,
      career: 1,
      finances: 1,
      relationships: 1,
      personal: 1,
      fun: 1,
      spirituality: 1,
    },
    prioritiesLocked: false,
    ...overrides,
  };
}

function mountSheet(opts: {
  garden?: GardenDto;
  shopCoins?: number;
  onPickToPlace?: (id: string) => void;
  onClose?: () => void;
}) {
  const fm = setupFetchMock();
  fm.json("/api/me", user({ shopCoins: opts.shopCoins ?? 50 }));
  fm.json("/api/shop", { items: CATALOG });
  return {
    fm,
    ...renderWithQuery(
      <DecoShopSheet
        open
        garden={opts.garden ?? emptyGarden()}
        onClose={opts.onClose ?? (() => undefined)}
        onPickToPlace={opts.onPickToPlace ?? (() => undefined)}
      />,
    ),
  };
}

describe("<DecoShopSheet />", () => {
  it("buys an unowned item then enters placement mode", async () => {
    const onPickToPlace = vi.fn();
    const onClose = vi.fn();
    const { fm, findByRole } = mountSheet({ shopCoins: 50, onPickToPlace, onClose });
    fm.mock("/api/shop/buy", {
      method: "POST",
      status: 200,
      body: { user: user({ shopCoins: 25 }) },
    });

    fireEvent.click(await findByRole("button", { name: /buy stone path for 25 coins/i }));

    await waitFor(() => expect(fm.calls("POST", "/api/shop/buy")).toHaveLength(1));
    expect(fm.calls("POST", "/api/shop/buy")[0]?.body).toEqual({ itemId: "stone_path" });
    await waitFor(() => expect(onPickToPlace).toHaveBeenCalledWith("stone_path"));
    expect(onClose).toHaveBeenCalled();
  });

  it("skips the purchase for owned items and enters placement mode directly", async () => {
    const onPickToPlace = vi.fn();
    const onClose = vi.fn();
    const { fm, findByRole } = mountSheet({
      garden: emptyGarden(["stone_path"]),
      shopCoins: 0,
      onPickToPlace,
      onClose,
    });

    fireEvent.click(await findByRole("button", { name: /place stone path/i }));

    expect(fm.calls("POST", "/api/shop/buy")).toHaveLength(0);
    expect(onPickToPlace).toHaveBeenCalledWith("stone_path");
    expect(onClose).toHaveBeenCalled();
  });

  it("disables items the user can't afford", async () => {
    const { findByRole } = mountSheet({ shopCoins: 50 });
    const fountainBtn = (await findByRole("button", {
      name: /buy fountain for 300 coins/i,
    })) as HTMLButtonElement;
    expect(fountainBtn.disabled).toBe(true);
  });
});
