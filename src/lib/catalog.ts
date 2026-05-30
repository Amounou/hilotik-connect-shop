import { supabase } from "@/integrations/supabase/client";

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

export interface UICategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

export interface UIProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  image: string;
  categoryId: string | null;
  categorySlug: string | null;
  sizes: string[];
  colors: string[];
  isNew: boolean;
  active: boolean;
}

type RawProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  description: string | null;
  price: number | string;
  old_price: number | string | null;
  stock: number;
  image_url: string | null;
  category_id: string | null;
  sizes: string[] | null;
  colors: string[] | null;
  is_new: boolean;
  active: boolean;
  category?: { slug: string; name: string } | null;
};

export function mapProduct(row: RawProduct): UIProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand ?? "HiloTik",
    description: row.description ?? "",
    price: Number(row.price),
    oldPrice: row.old_price != null ? Number(row.old_price) : null,
    stock: row.stock,
    image: row.image_url ?? "",
    categoryId: row.category_id,
    categorySlug: row.category?.slug ?? null,
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    isNew: !!row.is_new,
    active: row.active,
  };
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ---------- Queries ----------

export async function fetchProducts(opts: { includeInactive?: boolean } = {}) {
  let q = supabase
    .from("products")
    .select("*, category:categories(slug, name)")
    .order("created_at", { ascending: false });
  if (!opts.includeInactive) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data as RawProduct[]).map(mapProduct);
}

export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(slug, name)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as RawProduct) : null;
}

export async function fetchCategories(): Promise<UICategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description")
    .order("name");
  if (error) throw error;
  return data;
}

// ---------- Mutations (admin) ----------

export interface ProductInput {
  slug: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  image_url: string;
  category_id: string | null;
  sizes: string[];
  colors: string[];
  is_new: boolean;
  active: boolean;
}

function toDbProduct(p: ProductInput) {
  return {
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    description: p.description,
    price: p.price,
    old_price: p.oldPrice,
    stock: p.stock,
    image_url: p.image_url,
    category_id: p.category_id,
    sizes: p.sizes,
    colors: p.colors,
    is_new: p.is_new,
    active: p.active,
  };
}

export async function createProduct(p: ProductInput) {
  const { error } = await supabase.from("products").insert(toDbProduct(p));
  if (error) throw error;
}

export async function updateProduct(id: string, p: ProductInput) {
  const { error } = await supabase.from("products").update(toDbProduct(p)).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function createCategory(name: string, description?: string) {
  const slug = slugify(name);
  const { error } = await supabase
    .from("categories")
    .insert({ name, slug, description: description ?? null });
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
