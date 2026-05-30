import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchProductBySlug, fetchProducts } from "@/lib/catalog";

export function useProducts(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ["products", opts.includeInactive ? "all" : "active"],
    queryFn: () => fetchProducts(opts),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });
}
