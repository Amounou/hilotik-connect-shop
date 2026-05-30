// Legacy module kept only for back-compat. Catalog data now lives in the database.
// See src/lib/catalog.ts for the live queries used by the storefront and admin.
export { formatPrice, type UIProduct as Product } from "@/lib/catalog";
