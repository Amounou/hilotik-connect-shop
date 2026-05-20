import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  CreditCard,
  Tag,
  LogOut,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Administration — HiloTik" }] }),
  beforeLoad: ({ location }) => {
    if (location.pathname === "/admin") {
      throw redirect({ to: "/admin/dashboard" });
    }
  },
});

const NAV = [
  { to: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/admin/produits", label: "Produits", icon: Package },
  { to: "/admin/categories", label: "Catégories", icon: Tag },
  { to: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/paiements", label: "Paiements", icon: CreditCard },
  { to: "/admin/parametres", label: "Paramètres", icon: Settings },
] as const;

function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-secondary/30">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:flex md:flex-col">
        <div className="border-b border-border px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Admin
          </p>
          <p className="font-display text-lg font-bold">HiloTik Console</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeProps={{ className: "bg-foreground text-background" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-secondary hover:text-foreground" }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Retour boutique
          </Link>
        </div>
      </aside>

      <div className="flex-1 overflow-x-hidden">
        <div className="md:hidden border-b border-border bg-background">
          <div className="flex gap-1 overflow-x-auto px-3 py-2 text-xs">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeProps={{ className: "bg-foreground text-background" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="whitespace-nowrap rounded-md px-3 py-1.5 font-medium"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
