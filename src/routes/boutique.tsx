import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { useProducts, useCategories } from "@/hooks/use-catalog";

type Sort = "popular" | "price-asc" | "price-desc" | "new";

interface Search {
  cat?: string;
  sort?: Sort;
}

export const Route = createFileRoute("/boutique")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    cat: (s.cat as string) || "all",
    sort: (s.sort as Sort) || "popular",
  }),
  component: Boutique,
  head: () => ({
    meta: [
      { title: "Boutique — HiloTik" },
      { name: "description", content: "Parcourez tous les produits HiloTik : vêtements, chaussures et accessoires." },
    ],
  }),
});

function Boutique() {
  const { cat, sort } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [maxPrice, setMaxPrice] = useState<number>(100000);

  const { data: allProducts = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const products = useMemo(() => {
    let list = [...allProducts];
    if (cat && cat !== "all") {
      const selected = categories.find((c) => c.slug === cat);
      const childSlugs = selected
        ? categories.filter((c) => c.parentId === selected.id).map((c) => c.slug)
        : [];
      const allowed = new Set<string>([cat, ...childSlugs]);
      list = list.filter((p) => p.categorySlug && allowed.has(p.categorySlug));
    }
    list = list.filter((p) => p.price <= maxPrice);
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "new": list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew)); break;
    }
    return list;
  }, [allProducts, cat, sort, maxPrice, categories]);


  const currentCat = categories.find((c) => c.slug === cat);

  return (
    <div className="container-page py-10 md:py-14">
      <header className="mb-8 border-b border-border pb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Collection</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          {cat === "all" || !cat ? "Tous les produits" : currentCat?.name ?? "Catégorie"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{products.length} produit{products.length > 1 ? "s" : ""}</p>
      </header>

      <div className="grid gap-10 md:grid-cols-[220px_1fr]">
        {/* Filtres */}
        <aside className="space-y-8">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider">Catégories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/boutique" search={{ cat: "all", sort }} className={`block ${cat === "all" || !cat ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                  Toutes
                </Link>
              </li>
              {categories.filter((c) => !c.parentId).map((c) => {
                const subs = categories.filter((s) => s.parentId === c.id);
                return (
                  <li key={c.id}>
                    <Link to="/boutique" search={{ cat: c.slug, sort }} className={`block ${cat === c.slug ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                      {c.name}
                    </Link>
                    {subs.length > 0 && (
                      <ul className="ml-3 mt-1 space-y-1 border-l border-border pl-3">
                        {subs.map((s) => (
                          <li key={s.id}>
                            <Link to="/boutique" search={{ cat: s.slug, sort }} className={`block text-xs ${cat === s.slug ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                              {s.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}

            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider">Prix max</h3>
            <input
              type="range"
              min={5000}
              max={100000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-foreground"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Jusqu'à {new Intl.NumberFormat("fr-FR").format(maxPrice)} FCFA
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider">Trier par</h3>
            <select
              value={sort}
              onChange={(e) => navigate({ search: { cat, sort: e.target.value as Sort } })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="popular">Popularité</option>
              <option value="new">Nouveautés</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>
        </aside>

        {/* Grille */}
        <section>
          {isLoading ? (
            <div className="rounded-md border border-dashed border-border py-20 text-center text-sm text-muted-foreground">
              Chargement…
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-md border border-dashed border-border py-20 text-center text-sm text-muted-foreground">
              Aucun produit ne correspond à votre filtre.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 lg:gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
