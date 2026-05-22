import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  CreditCard,
  Tag,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminGate,
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

function AdminGate() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ok" | "no-auth" | "no-role">("loading");
  const [claiming, setClaiming] = useState(false);

  const check = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setStatus("no-auth"); return; }
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    setStatus(data ? "ok" : "no-role");
  };

  useEffect(() => { check(); }, []);

  const claim = async () => {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_admin");
    setClaiming(false);
    if (error) { toast.error(error.message); return; }
    if (data) { toast.success("Vous êtes administrateur !"); check(); }
    else toast.error("Un administrateur existe déjà");
  };

  if (status === "loading") {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Vérification…</div>;
  }
  if (status === "no-auth") {
    return (
      <div className="container-page py-20 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl font-bold">Accès réservé</h1>
        <p className="mt-2 text-sm text-muted-foreground">Connectez-vous pour accéder à l'administration.</p>
        <Button onClick={() => navigate({ to: "/auth" })} className="mt-6">Se connecter</Button>
      </div>
    );
  }
  if (status === "no-role") {
    return (
      <div className="container-page py-20 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl font-bold">Accès refusé</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Vous n'êtes pas administrateur. Si vous êtes le premier utilisateur, vous pouvez réclamer le rôle.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={claim} disabled={claiming}>{claiming ? "…" : "Devenir administrateur"}</Button>
          <Button variant="outline" onClick={() => navigate({ to: "/" })}>Retour boutique</Button>
        </div>
      </div>
    );
  }
  return <AdminLayout />;
}

function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-secondary/30">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:flex md:flex-col">
        <div className="border-b border-border px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Admin</p>
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
          <Link to="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground">
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
