import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ProductCard } from "@/components/site/ProductCard";
import { useProducts, useCategories } from "@/hooks/use-catalog";
import hero from "@/assets/hero.jpg";
import pCoat from "@/assets/p-coat.jpg";
import pSneaker from "@/assets/p-sneaker.jpg";
import pBag from "@/assets/p-bag.jpg";
import pWatch from "@/assets/p-watch.jpg";
import { ArrowRight, Truck, ShieldCheck, Smartphone, ChevronRight, HelpCircle, Phone, Store } from "lucide-react";

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

  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplay.current]);

  const slides = [
    { img: hero, title: "Le détail qui fait toute la différence", subtitle: "Nouvelle collection HiloTik", cta: "Découvrir", to: "/boutique" as const },
    { img: pCoat, title: "Mode & vêtements", subtitle: "Trouvez votre style", cta: "Voir les vêtements", to: "/boutique" as const },
    { img: pSneaker, title: "Chaussures tendance", subtitle: "Sneakers, mocassins et plus", cta: "Voir les chaussures", to: "/boutique" as const },
    { img: pBag, title: "Sacs & accessoires", subtitle: "Complétez votre look", cta: "Voir les accessoires", to: "/boutique" as const },
    { img: pWatch, title: "Montres premium", subtitle: "Élégance au poignet", cta: "Voir les montres", to: "/boutique" as const },
  ];

  return (
    <div>
      {/* Hero Jumia-style: sidebar + slider + info cards */}
      <section className="bg-secondary/30">
        <div className="container-page py-6">
          <div className="grid gap-4 lg:grid-cols-[240px_1fr_280px]">
            {/* Sidebar catégories */}
            <aside className="hidden rounded-lg border border-border bg-background lg:block">
              <ul className="py-2">
                {categories.slice(0, 12).map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/boutique"
                      search={{ cat: c.slug }}
                      className="flex items-center justify-between px-4 py-2.5 text-sm transition hover:bg-secondary"
                    >
                      <span>{c.name}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
                {categories.length === 0 && (
                  <li className="px-4 py-3 text-sm text-muted-foreground">Aucune catégorie</li>
                )}
              </ul>
            </aside>

            {/* Slider défilant */}
            <div className="relative overflow-hidden rounded-lg bg-background">
              <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                  {slides.map((s, i) => (
                    <div key={i} className="relative min-w-0 flex-[0_0_100%]">
                      <div className="relative aspect-[16/7] w-full md:aspect-[16/6]">
                        <img src={s.img} alt={s.title} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6 md:p-12">
                          <span className="text-xs font-medium uppercase tracking-wider text-background/80">{s.subtitle}</span>
                          <h2 className="font-display text-2xl font-bold leading-tight text-background md:text-5xl max-w-xl">{s.title}</h2>
                          <Link
                            to={s.to}
                            className="mt-2 inline-flex w-fit items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
                          >
                            {s.cta} <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    className="h-2 w-2 rounded-full bg-background/60 transition hover:bg-background"
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Cartes infos droite */}
            <div className="hidden flex-col gap-3 lg:flex">
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-6 w-6 text-brand" />
                  <div>
                    <p className="text-sm font-semibold">Centre d'assistance</p>
                    <p className="text-xs text-muted-foreground">Guide du service client</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-6 w-6 text-brand" />
                  <div>
                    <p className="text-sm font-semibold">Appelez pour commander</p>
                    <p className="text-xs text-muted-foreground">+225 25 20 00 61 61</p>
                  </div>
                </div>
              </div>
              <Link to="/compte" className="rounded-lg border border-border bg-background p-4 transition hover:bg-secondary">
                <div className="flex items-center gap-3">
                  <Store className="h-6 w-6 text-brand" />
                  <div>
                    <p className="text-sm font-semibold">Vendez sur HiloTik</p>
                    <p className="text-xs text-muted-foreground">Ouvrez votre boutique</p>
                  </div>
                </div>
              </Link>
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
