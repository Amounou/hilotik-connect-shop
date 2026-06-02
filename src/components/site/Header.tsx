import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Search, User, LogOut, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/lib/cart";
import { useAuth, signOut } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-catalog";
import logo from "@/assets/hilotik-logo.png";

export function Header() {
  const count = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate({ to: "/boutique", search: { cat: "all", sort: "popular", q: q || undefined } as never });
    setSearchOpen(false);
  };

  const parents = categories.filter((c) => !c.parentId);
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="HiloTik" className="h-9 w-9 object-contain" />
          <span className="font-display text-xl font-bold tracking-tight">HiloTik</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }} className="text-muted-foreground transition hover:text-foreground">Accueil</Link>
          <Link to="/boutique" activeProps={{ className: "text-foreground" }} className="text-muted-foreground transition hover:text-foreground">Boutique</Link>
          {parents.map((p) => {
            const subs = childrenOf(p.id);
            if (subs.length === 0) {
              return (
                <Link
                  key={p.id}
                  to="/boutique"
                  search={{ cat: p.slug }}
                  className="text-muted-foreground transition hover:text-foreground"
                >
                  {p.name}
                </Link>
              );
            }
            return (
              <div key={p.id} className="group relative">
                <Link
                  to="/boutique"
                  search={{ cat: p.slug }}
                  className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
                >
                  {p.name}
                  <ChevronDown className="h-3 w-3" />
                </Link>
                <div className="invisible absolute left-0 top-full z-50 min-w-[180px] translate-y-1 rounded-md border border-border bg-background py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <Link
                    to="/boutique"
                    search={{ cat: p.slug }}
                    className="block px-4 py-1.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  >
                    Tout {p.name}
                  </Link>
                  {subs.map((s) => (
                    <Link
                      key={s.id}
                      to="/boutique"
                      search={{ cat: s.slug }}
                      className="block px-4 py-1.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          {isAdmin && (
            <Link to="/admin/dashboard" className="hidden rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground md:inline-block">
              Admin
            </Link>
          )}
          <button className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Recherche">
            <Search className="h-5 w-5" />
          </button>
          {user ? (
            <>
              <Link to="/compte" className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Compte">
                <User className="h-5 w-5" />
              </Link>
              <button onClick={() => { signOut(); navigate({ to: "/" }); }} className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Déconnexion">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link to="/auth" className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Connexion">
              <User className="h-5 w-5" />
            </Link>
          )}
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
