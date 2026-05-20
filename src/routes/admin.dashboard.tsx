import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAdmin } from "@/lib/admin-store";
import { TrendingUp, ShoppingCart, Users, DollarSign, ArrowUpRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

function statusColor(s: string) {
  if (s === "Payée" || s === "Livrée") return "bg-emerald-500/10 text-emerald-600";
  if (s === "En préparation") return "bg-blue-500/10 text-blue-600";
  if (s === "Annulée") return "bg-red-500/10 text-red-600";
  return "bg-amber-500/10 text-amber-600";
}

function Dashboard() {
  const navigate = useNavigate();
  const { products, orders, customers, resetAll } = useAdmin();

  const revenue = orders
    .filter((o) => o.status === "Payée" || o.status === "Livrée")
    .reduce((a, o) => a + o.total, 0);
  const ordersCount = orders.length;
  const customersCount = customers.length;
  const paidCount = orders.filter((o) => o.status === "Payée" || o.status === "Livrée").length;
  const conversion = ordersCount > 0 ? ((paidCount / ordersCount) * 100).toFixed(1) : "0";

  const STATS = [
    { label: "Revenu", value: fmt(revenue), delta: "+12.4%", icon: DollarSign },
    { label: "Commandes", value: String(ordersCount), delta: `+${paidCount} payées`, icon: ShoppingCart },
    { label: "Clients", value: String(customersCount), delta: "+24", icon: Users },
    { label: "Taux conversion", value: `${conversion}%`, delta: "+0.6 pts", icon: TrendingUp },
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
        <button
          onClick={() => {
            resetAll();
            toast.success("Données de démo réinitialisées");
          }}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-secondary"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Réinitialiser la démo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ label, value, delta, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold">{value}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
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
                  <th className="px-5 py-3 font-medium">Méthode</th>
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
                    <td className="px-5 py-3 font-mono text-xs">{o.id}</td>
                    <td className="px-5 py-3">{o.client}</td>
                    <td className="px-5 py-3 text-muted-foreground">{o.method}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium">{fmt(o.total)}</td>
                  </tr>
                ))}
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
              <li key={p.slug} className="flex items-center gap-3 p-3">
                <img src={p.image} alt="" className="h-12 w-12 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Stock: {p.stock}</p>
                </div>
                <span className="text-sm font-semibold">{fmt(p.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
