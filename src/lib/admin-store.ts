import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRODUCTS, CATEGORIES, type Product, type Category } from "./products";

export type OrderStatus = "En attente" | "En préparation" | "Payée" | "Livrée" | "Annulée";
export type PaymentMethod = "Orange Money" | "Wave" | "MTN MoMo" | "Cash à la livraison";

export interface Order {
  id: string;
  client: string;
  email: string;
  date: string;
  items: number;
  total: number;
  status: OrderStatus;
  method: PaymentMethod;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  since: string;
}

export interface ShopSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  shippingStandard: number;
  shippingExpress: number;
  freeShippingThreshold: number;
  enabledMethods: Record<PaymentMethod, boolean>;
}

interface AdminState {
  products: Product[];
  categories: { id: Category | string; label: string }[];
  orders: Order[];
  customers: Customer[];
  settings: ShopSettings;

  // products
  addProduct: (p: Product) => void;
  updateProduct: (slug: string, patch: Partial<Product>) => void;
  deleteProduct: (slug: string) => void;

  // categories
  addCategory: (label: string) => void;
  deleteCategory: (id: string) => void;

  // orders
  setOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;

  // customers
  deleteCustomer: (id: string) => void;

  // settings
  updateSettings: (patch: Partial<ShopSettings>) => void;
  togglePaymentMethod: (m: PaymentMethod) => void;

  resetAll: () => void;
}

const DEFAULT_ORDERS: Order[] = [
  { id: "HT-10245", client: "Aïcha Ndiaye", email: "aicha.n@mail.com", date: "2026-05-19", items: 3, total: 49500, status: "Payée", method: "Orange Money" },
  { id: "HT-10244", client: "Mamadou Diallo", email: "m.diallo@mail.com", date: "2026-05-19", items: 1, total: 28000, status: "En préparation", method: "Wave" },
  { id: "HT-10243", client: "Fatou Sow", email: "fatou.sow@mail.com", date: "2026-05-18", items: 2, total: 67000, status: "Livrée", method: "Cash à la livraison" },
  { id: "HT-10242", client: "Ibrahima Ba", email: "iba@mail.com", date: "2026-05-18", items: 1, total: 19500, status: "En attente", method: "MTN MoMo" },
  { id: "HT-10241", client: "Khadija Touré", email: "khadija.t@mail.com", date: "2026-05-17", items: 4, total: 105000, status: "Payée", method: "Orange Money" },
  { id: "HT-10240", client: "Sékou Camara", email: "sekou.c@mail.com", date: "2026-05-17", items: 1, total: 18500, status: "Annulée", method: "Wave" },
  { id: "HT-10239", client: "Mariam Kane", email: "mariam.k@mail.com", date: "2026-05-16", items: 2, total: 54000, status: "Livrée", method: "Cash à la livraison" },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Aïcha Ndiaye", email: "aicha.n@mail.com", phone: "+221 77 123 45 67", orders: 8, spent: 245000, since: "2025-08" },
  { id: "c2", name: "Mamadou Diallo", email: "m.diallo@mail.com", phone: "+221 76 888 22 11", orders: 3, spent: 92000, since: "2025-11" },
  { id: "c3", name: "Fatou Sow", email: "fatou.sow@mail.com", phone: "+221 70 555 99 00", orders: 12, spent: 410500, since: "2025-03" },
  { id: "c4", name: "Ibrahima Ba", email: "iba@mail.com", phone: "+221 77 234 56 78", orders: 1, spent: 19500, since: "2026-04" },
  { id: "c5", name: "Khadija Touré", email: "khadija.t@mail.com", phone: "+221 78 111 22 33", orders: 6, spent: 187000, since: "2025-09" },
];

const DEFAULT_SETTINGS: ShopSettings = {
  name: "HiloTik",
  email: "contact@hilotik.com",
  phone: "+221 77 000 00 00",
  address: "Dakar, Sénégal",
  shippingStandard: 2000,
  shippingExpress: 5000,
  freeShippingThreshold: 50000,
  enabledMethods: {
    "Orange Money": true,
    "Wave": true,
    "MTN MoMo": true,
    "Cash à la livraison": true,
  },
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      products: PRODUCTS,
      categories: CATEGORIES,
      orders: DEFAULT_ORDERS,
      customers: DEFAULT_CUSTOMERS,
      settings: DEFAULT_SETTINGS,

      addProduct: (p) =>
        set((s) => ({ products: [{ ...p, slug: p.slug || slugify(p.name) }, ...s.products] })),
      updateProduct: (slug, patch) =>
        set((s) => ({ products: s.products.map((p) => (p.slug === slug ? { ...p, ...patch } : p)) })),
      deleteProduct: (slug) =>
        set((s) => ({ products: s.products.filter((p) => p.slug !== slug) })),

      addCategory: (label) =>
        set((s) => {
          const id = slugify(label);
          if (s.categories.find((c) => c.id === id)) return s;
          return { categories: [...s.categories, { id, label }] };
        }),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      setOrderStatus: (id, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
      deleteOrder: (id) =>
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),

      deleteCustomer: (id) =>
        set((s) => ({ customers: s.customers.filter((c) => c.id !== id) })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      togglePaymentMethod: (m) =>
        set((s) => ({
          settings: {
            ...s.settings,
            enabledMethods: { ...s.settings.enabledMethods, [m]: !s.settings.enabledMethods[m] },
          },
        })),

      resetAll: () =>
        set({
          products: PRODUCTS,
          categories: CATEGORIES,
          orders: DEFAULT_ORDERS,
          customers: DEFAULT_CUSTOMERS,
          settings: DEFAULT_SETTINGS,
        }),
    }),
    { name: "hilotik-admin" },
  ),
);

export { slugify };
