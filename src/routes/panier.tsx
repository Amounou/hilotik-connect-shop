import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/panier")({
  component: Cart,
  head: () => ({ meta: [{ title: "Panier — HiloTik" }] }),
});

function Cart() {
  const { items, setQty, remove, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-6 font-display text-3xl font-bold">Votre panier est vide</h1>
        <p className="mt-2 text-sm text-muted-foreground">Découvrez nos produits et ajoutez vos favoris.</p>
        <Link to="/boutique" className="mt-8 inline-block rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90">
          Aller à la boutique
        </Link>
      </div>
    );
  }

  const sub = total();
  const shipping = sub > 50000 ? 0 : 2000;

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="font-display text-4xl font-bold md:text-5xl">Panier</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border border-y border-border">
          {items.map((i) => (
            <li key={`${i.slug}-${i.size ?? ""}`} className="flex gap-4 py-6">
              <Link to="/produit/$slug" params={{ slug: i.slug }} className="block h-24 w-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link to="/produit/$slug" params={{ slug: i.slug }} className="text-sm font-medium hover:underline">
                      {i.name}
                    </Link>
                    {i.size && <p className="mt-1 text-xs text-muted-foreground">Taille : {i.size}</p>}
                  </div>
                  <button
                    onClick={() => remove(i.slug, i.size)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Retirer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex items-center rounded-md border border-border">
                    <button onClick={() => setQty(i.slug, i.qty - 1, i.size)} className="px-2 py-1.5 hover:bg-secondary" aria-label="Moins">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm">{i.qty}</span>
                    <button onClick={() => setQty(i.slug, i.qty + 1, i.size)} className="px-2 py-1.5 hover:bg-secondary" aria-label="Plus">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(i.price * i.qty)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-md border border-border p-6">
          <h2 className="font-display text-lg font-bold">Récapitulatif</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Sous-total</dt><dd>{formatPrice(sub)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Livraison</dt><dd>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt><dd>{formatPrice(sub + shipping)}</dd>
            </div>
          </dl>
          <Link
            to="/commande"
            className="mt-6 block w-full rounded-md bg-foreground px-6 py-3.5 text-center text-sm font-medium text-background transition hover:opacity-90"
          >
            Passer la commande
          </Link>
          <Link to="/boutique" className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground">
            ← Continuer mes achats
          </Link>
        </aside>
      </div>
    </div>
  );
}
