import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/hooks/use-catalog";
import { TrendingUp, ShoppingCart, Users, DollarSign, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

type DbStatus = "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled";

const STATUS_LABEL: Record<DbStatus, string> = {
  pending: "En attente",
  paid: "Payée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

function statusColor(s: DbStatus) {
  if (s === "paid" || s === "delivered") return "bg-emerald-500/10 text-emerald-600";
  if (s === "preparing" || s === "shipped") return "bg-blue-500/10 text-blue-600";
  if (s === "cancelled") return "bg-red-500/10 text-red-600";
  return "bg-amber-500/10 text-amber-600";
}

function Dashboard() {
  const navigate = useNavigate();
  const { data: products = [] } = useProducts({ includeInactive: true });
  const { data: orders = [] } = useQuery({
    queryKey: ["admin", "orders-summary"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, customer_name, total, status, payment_method, created_at")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: customersCount = 0 } = useQuery({
    queryKey: ["admin", "customers-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const revenue = orders
    .filter((o) => o.status === "paid" || o.status === "delivered" || o.status === "shipped")
    .reduce((a, o) => a + Number(o.total), 0);
  const ordersCount = orders.length;
  const paidCount = orders.filter((o) => o.status === "paid" || o.status === "delivered").length;
  const conversion = ordersCount > 0 ? ((paidCount / ordersCount) * 100).toFixed(1) : "0";

  const STATS = [
    { label: "Revenu", value: fmt(revenue), delta: `${paidCount} payées`, icon: DollarSign },
    { label: "Commandes", value: String(ordersCount), delta: "Total", icon: ShoppingCart },
    { label: "Clients", value: String(customersCount), delta: "Inscrits", icon: Users },
    { label: "Conversion", value: `${conversion}%`, delta: "Payées / total", icon: TrendingUp },
  ];

  const recent = orders.slice(0, 5);
  const topProducts = [...products].sort((a, b) => a.stock - b.stock).slice(0, 5);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de votre activité.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ label, value, delta, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold">{value}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3" />
              {delta}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Commandes récentes</h2>
            <Link to="/admin/commandes" className="text-xs font-medium text-muted-foreground hover:text-foreground">
              Tout voir →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-medium">N°</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => navigate({ to: "/admin/commandes" })}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary/40"
                  >
                    <td className="px-5 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                    <td className="px-5 py-3">{o.customer_name}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(o.status as DbStatus)}`}>
                        {STATUS_LABEL[o.status as DbStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium">{fmt(Number(o.total))}</td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-muted-foreground">Aucune commande pour l'instant.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Stock faible</h2>
            <Link to="/admin/produits" className="text-xs font-medium text-muted-foreground hover:text-foreground">
              Gérer →
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {topProducts.map((p) => (
              <li key={p.id} className="flex items-center gap-3 p-3">
                {p.image ? (
                  <img src={p.image} alt="" className="h-12 w-12 rounded-md object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-secondary" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Stock: {p.stock}</p>
                </div>
                <span className="text-sm font-semibold">{fmt(p.price)}</span>
              </li>
            ))}
            {topProducts.length === 0 && (
              <li className="p-6 text-center text-sm text-muted-foreground">Aucun produit.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
