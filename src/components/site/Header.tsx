import { Link } from "@tanstack/react-router";
import { ShoppingBag, Search, User } from "lucide-react";
import { useCart } from "@/lib/cart";
import logo from "@/assets/hilotik-logo.png";

export function Header() {
  const count = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="HiloTik" className="h-9 w-9 object-contain" />
          <span className="font-display text-xl font-bold tracking-tight">
            HiloTik
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }} className="text-muted-foreground transition hover:text-foreground">
            Accueil
          </Link>
          <Link to="/boutique" activeProps={{ className: "text-foreground" }} className="text-muted-foreground transition hover:text-foreground">
            Boutique
          </Link>
          <Link to="/boutique" search={{ cat: "homme" }} className="text-muted-foreground transition hover:text-foreground">
            Homme
          </Link>
          <Link to="/boutique" search={{ cat: "femme" }} className="text-muted-foreground transition hover:text-foreground">
            Femme
          </Link>
          <Link to="/boutique" search={{ cat: "accessoires" }} className="text-muted-foreground transition hover:text-foreground">
            Accessoires
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/admin/dashboard" className="hidden rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground md:inline-block">
            Admin
          </Link>
          <button className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Recherche">
            <Search className="h-5 w-5" />
          </button>
          <Link to="/compte" className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Compte">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/panier" className="relative rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Panier">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
