import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { useProducts, useCategories } from "@/hooks/use-catalog";
import hero from "@/assets/hero.jpg";
import { ArrowRight, Truck, ShieldCheck, Smartphone } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "HiloTik — Mode & accessoires en ligne" },
      { name: "description", content: "Découvrez la nouvelle collection HiloTik. Vêtements, chaussures et accessoires. Paiement Mobile Money & livraison." },
      { property: "og:title", content: "HiloTik — Le détail qui fait toute la différence" },
    ],
  }),
});

function Index() {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();

  const featured = products.slice(0, 4);
  const newArrivals = products.filter((p) => p.isNew);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
          <div className="order-2 md:order-1">
            <span className="inline-block rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
              Nouvelle collection
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
              Le détail<br />
              qui fait toute<br />
              la <span className="text-brand">différence.</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground">
              Mode, chaussures et accessoires choisis avec soin. Livrés partout, payés en Mobile Money ou à la livraison.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/boutique"
                className="inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
              >
                Découvrir la boutique <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/boutique"
                search={{ cat: "chaussures" }}
                className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium transition hover:bg-secondary"
              >
                Voir les chaussures
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-secondary">
              <img
                src={hero}
                alt="Collection HiloTik"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau valeurs */}
      <section className="border-b border-border bg-secondary/30">
        <div className="container-page grid gap-6 py-8 md:grid-cols-3">
          {[
            { icon: Truck, t: "Livraison rapide", d: "Partout, sous 24–72h" },
            { icon: Smartphone, t: "Mobile Money", d: "Orange, MTN, Wave" },
            { icon: ShieldCheck, t: "Paiement à la livraison", d: "Payez à la réception" },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-background">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Catégories */}
      {categories.length > 0 && (
        <section className="container-page py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Catégories</h2>
            <Link to="/boutique" className="text-sm text-muted-foreground hover:text-foreground">Voir tout →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.map((c) => {
              const p = products.find((x) => x.categorySlug === c.slug);
              return (
                <Link
                  key={c.id}
                  to="/boutique"
                  search={{ cat: c.slug }}
                  className="group relative aspect-[4/5] overflow-hidden rounded-md bg-secondary"
                >
                  {p?.image && (
                    <img src={p.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                  <span className="absolute bottom-4 left-4 font-display text-xl font-bold text-background">
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container-page py-8">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Produits populaires</h2>
            <Link to="/boutique" className="text-sm text-muted-foreground hover:text-foreground">Voir tout →</Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="container-page py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Nouveautés</h2>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page pb-16">
        <div className="rounded-lg bg-foreground px-8 py-14 text-background md:px-14 md:py-20">
          <h2 className="font-display text-3xl font-bold md:text-5xl">Rejoignez HiloTik.</h2>
          <p className="mt-3 max-w-xl text-sm text-background/70 md:text-base">
            Créez un compte et profitez d'offres exclusives, du suivi de vos commandes et de livraisons express.
          </p>
          <Link
            to="/compte"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-background px-6 py-3 text-sm font-medium text-foreground transition hover:opacity-90"
          >
            Créer mon compte <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
