import { Link } from "@tanstack/react-router";
import { type Product, formatPrice } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/produit/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.isNew && (
          <span className="absolute left-3 top-3 rounded-sm bg-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
            Nouveau
          </span>
        )}
        {product.oldPrice && (
          <span className="absolute right-3 top-3 rounded-sm bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-foreground">
            Promo
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <h3 className="truncate text-sm font-medium text-foreground">{product.name}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</p>
          {product.oldPrice && (
            <p className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
