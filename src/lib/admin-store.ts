import { create } from "zustand";
import { persist } from "zustand/middleware";

// Local-only UI preferences for the admin console.
// All catalog / orders / customers data now lives in the database
// (see src/lib/catalog.ts and the supabase tables).

export type PaymentMethod = "Orange Money" | "Wave" | "MTN MoMo" | "Cash à la livraison";

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
  settings: ShopSettings;
  updateSettings: (patch: Partial<ShopSettings>) => void;
  togglePaymentMethod: (m: PaymentMethod) => void;
}

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

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      togglePaymentMethod: (m) =>
        set((s) => ({
          settings: {
            ...s.settings,
            enabledMethods: { ...s.settings.enabledMethods, [m]: !s.settings.enabledMethods[m] },
          },
        })),
    }),
    { name: "hilotik-admin-settings" },
  ),
);
