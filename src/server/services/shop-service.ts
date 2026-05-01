import "server-only";

import { type AppContainer } from "../container";
import { DomainError } from "../domain/errors";
import type { DecoItem } from "../domain/garden/types";
import type { User } from "../domain/user/types";

export type ShopService = ReturnType<typeof createShopService>;

export function createShopService({ repos }: AppContainer) {
  return {
    list(): Promise<DecoItem[]> {
      return repos.shop.list();
    },

    /**
     * Buy a decoration. Rejects insufficient coins or duplicate purchases.
     * Side-effects: debit the wallet, append to garden.owned.
     */
    async buy(user: User, itemId: string): Promise<{ user: User }> {
      const items = await repos.shop.list();
      const item = items.find((i) => i.id === itemId);
      if (!item) throw new DomainError("DECO_NOT_OWNED", "No such item");

      const garden = await repos.gardens.getOrCreate(user.id);
      if (garden.owned.includes(itemId)) throw new DomainError("DECO_ALREADY_OWNED");
      if (user.shopCoins < item.cost) throw new DomainError("INSUFFICIENT_COINS");

      await repos.gardens.update({ ...garden, owned: [...garden.owned, itemId] });
      const updatedUser = await repos.users.update({
        ...user,
        shopCoins: user.shopCoins - item.cost,
      });
      return { user: updatedUser };
    },
  };
}
