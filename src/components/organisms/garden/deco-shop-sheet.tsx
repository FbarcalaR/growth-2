"use client";

import { Coins } from "lucide-react";

import { useBuyDeco, useSession, useShop } from "@/client/hooks";
import { BottomSheet, Spinner } from "@/components/atoms";
import type { DecoItemDto, DecoRarity } from "@/shared/schemas/shop";
import type { GardenDto } from "@/shared/schemas/garden";

import { DecoSprite, type DecoId } from "./deco-sprite";

type DecoShopSheetProps = {
  open: boolean;
  garden: GardenDto;
  onClose: () => void;
  /** Fired when an owned (or just-purchased) item is picked for placement —
   *  parent stores it in `placingDeco` and prompts the user to tap a grass tile. */
  onPickToPlace: (itemId: DecoId) => void;
};

const RARITY_CLASS: Record<DecoRarity, string> = {
  common: "text-[#7AA67D]",
  rare: "text-[#5694C9]",
  epic: "text-[#A06FD0]",
  legendary: "text-[#E0A93A]",
};

/**
 * Bottom sheet listing the deco shop catalog. Owned items show "✓ Owned · place"
 * and tap → `onPickToPlace`. Unowned items show their cost; tap buys the item
 * (`useBuyDeco`) and then enters placement mode for it. Insufficient-coins items
 * are dimmed and disabled.
 */
export function DecoShopSheet({ open, garden, onClose, onPickToPlace }: DecoShopSheetProps) {
  const { user } = useSession();
  const shop = useShop();
  const buy = useBuyDeco();

  const coins = user?.shopCoins ?? 0;

  function handlePick(item: DecoItemDto) {
    const isOwned = garden.owned.includes(item.id);
    if (isOwned) {
      onPickToPlace(item.id as DecoId);
      onClose();
      return;
    }
    if (coins < item.cost || buy.isPending) return;
    buy.mutate(
      { itemId: item.id },
      {
        onSuccess: () => {
          onPickToPlace(item.id as DecoId);
          onClose();
        },
      },
    );
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Decoration shop" className="bg-surface-card">
      <div className="overflow-y-auto px-4 pt-2 pb-9">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-ink-strong text-lg font-extrabold">Decoration shop</h2>
            <p className="text-brand-muted mt-0.5 text-[12px]">
              Buy decorations and place them on grass tiles to make your garden yours.
            </p>
          </div>
          <span className="rounded-pill bg-accent-warm-bg border-accent-warm-border text-accent-warm inline-flex shrink-0 items-center gap-1 border px-2.5 py-1 text-[13px] font-bold tabular-nums">
            <Coins size={13} aria-hidden />
            {coins}
          </span>
        </div>

        {shop.isPending && (
          <div className="flex justify-center py-10">
            <Spinner size="md" className="text-brand-muted" />
          </div>
        )}

        {shop.data && (
          <ul className="mt-4 grid grid-cols-2 gap-2.5">
            {shop.data.map((item) => {
              const isOwned = garden.owned.includes(item.id);
              const canAfford = coins >= item.cost;
              const enabled = isOwned || canAfford;
              const isBusy = buy.isPending && buy.variables?.itemId === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handlePick(item)}
                    disabled={!enabled || buy.isPending}
                    aria-label={
                      isOwned ? `Place ${item.name}` : `Buy ${item.name} for ${item.cost} coins`
                    }
                    className={`bg-surface-card flex w-full flex-col items-center rounded-[14px] border-[1.5px] px-2.5 py-3 text-center transition-colors ${
                      isOwned
                        ? "border-[#C8E6C9]"
                        : enabled
                          ? "border-input-border hover:border-brand-700"
                          : "border-input-border opacity-45"
                    }`}
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center"
                      aria-hidden
                      style={{ imageRendering: "pixelated" }}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 28">
                        <DecoSprite type={item.id as DecoId} cx={12} cy={14} />
                      </svg>
                    </span>
                    <p className="text-ink-strong mt-1 text-[12px] font-bold">{item.name}</p>
                    <p
                      className={`mt-0.5 text-[9px] font-semibold tracking-wide uppercase ${RARITY_CLASS[item.rarity]}`}
                    >
                      {item.rarity}
                    </p>
                    <p
                      className={`mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-[8px] py-1 text-[11px] font-bold tabular-nums ${
                        isOwned
                          ? "text-brand-700 bg-[#F1F8F1]"
                          : canAfford
                            ? "bg-accent-warm-bg text-accent-warm"
                            : "text-brand-muted bg-[#F5F5F5]"
                      }`}
                    >
                      {isBusy ? (
                        "Buying…"
                      ) : isOwned ? (
                        "✓ Owned · place"
                      ) : (
                        <>
                          <Coins size={11} aria-hidden />
                          {item.cost}
                        </>
                      )}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </BottomSheet>
  );
}
