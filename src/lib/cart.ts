import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  size?: string;
}

interface CartProductInput {
  slug: string;
  name: string;
  price: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  add: (p: CartProductInput, opts?: { size?: string; qty?: number }) => void;
  remove: (slug: string, size?: string) => void;
  setQty: (slug: string, qty: number, size?: string) => void;
  clear: () => void;
  count: () => number;
  total: () => number;
}

const key = (slug: string, size?: string) => `${slug}__${size ?? ""}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p, opts) =>
        set((s) => {
          const size = opts?.size;
          const qty = opts?.qty ?? 1;
          const existing = s.items.find(
            (i) => key(i.slug, i.size) === key(p.slug, size),
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                key(i.slug, i.size) === key(p.slug, size)
                  ? { ...i, qty: i.qty + qty }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...s.items,
              { slug: p.slug, name: p.name, price: p.price, image: p.image, qty, size },
            ],
          };
        }),
      remove: (slug, size) =>
        set((s) => ({
          items: s.items.filter((i) => key(i.slug, i.size) !== key(slug, size)),
        })),
      setQty: (slug, qty, size) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              key(i.slug, i.size) === key(slug, size) ? { ...i, qty } : i,
            )
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((a, i) => a + i.qty, 0),
      total: () => get().items.reduce((a, i) => a + i.qty * i.price, 0),
    }),
    { name: "hilotik-cart" },
  ),
);
