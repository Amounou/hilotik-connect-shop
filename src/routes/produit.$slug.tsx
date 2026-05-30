import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useProduct, useProducts } from "@/hooks/use-catalog";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/site/ProductCard";
import { toast } from "sonner";
import { ShoppingBag, Truck, ShieldCheck, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/produit/$slug")({
  component: ProductPage,
  head: () => ({
    meta: [
      { title: "Produit — HiloTik" },
    ],
  }),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useProduct(slug);
  const { data: allProducts = [] } = useProducts();
  const add = useCart((s) => s.add);
  const [size, setSize] = useState<string | undefined>(undefined);

  if (isLoading) {
    return <div className="container-page py-20 text-center text-sm text-muted-foreground">Chargement…</div>;
  }

  if (!product) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Produit introuvable</h1>
        <Link to="/boutique" className="mt-6 inline-block text-sm underline">Retour à la boutique</Link>
      </div>
    );
  }

  const selectedSize = size ?? product.sizes[0];
  const related = allProducts
    .filter((p) => p.categorySlug === product.categorySlug && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div>
      <div className="container-page pt-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Accueil</Link>
        <span className="mx-2">/</span>
        <Link to="/boutique" className="hover:text-foreground">Boutique</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="container-page grid gap-10 py-10 md:grid-cols-2 md:py-14">
        <div className="aspect-square overflow-hidden rounded-md bg-secondary">
          {product.image && (
            <img src={product.image} alt={product.name} width={800} height={800} className="h-full w-full object-cover" />
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">{product.name}</h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-base text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {product.sizes.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider">Taille</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-12 rounded-md border px-4 py-2 text-sm transition ${
                      selectedSize === s
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                add(product, { size: selectedSize });
                toast.success("Ajouté au panier", { description: product.name });
              }}
              disabled={product.stock <= 0}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-foreground px-6 py-3.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" /> Ajouter au panier
            </button>
            <Link
              to="/panier"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3.5 text-sm font-medium transition hover:bg-secondary"
            >
              Voir le panier
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {product.stock > 5 ? "En stock" : product.stock > 0 ? `Plus que ${product.stock} en stock` : "Rupture"}
          </p>

          <ul className="mt-8 space-y-3 border-t border-border pt-6 text-sm">
            <li className="flex items-center gap-3 text-muted-foreground"><Truck className="h-4 w-4" /> Livraison sous 24–72h</li>
            <li className="flex items-center gap-3 text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Paiement sécurisé Mobile Money</li>
            <li className="flex items-center gap-3 text-muted-foreground"><RotateCcw className="h-4 w-4" /> Retours sous 14 jours</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-page pb-16">
          <h2 className="mb-8 font-display text-3xl font-bold">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
