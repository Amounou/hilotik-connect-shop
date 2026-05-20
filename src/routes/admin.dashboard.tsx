import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS } from "@/lib/products";
import { TrendingUp, ShoppingCart, Users, DollarSign, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const STATS = [
  { label: "Revenu (30j)", value: fmt(1842500), delta: "+12.4%", icon: DollarSign },
  { label: "Commandes", value: "128", delta: "+8.1%", icon: ShoppingCart },
  { label: "Clients", value: "412", delta: "+24", icon: Users },
  { label: "Taux conversion", value: "3.8%", delta: "+0.6 pts", icon: TrendingUp },
];

const RECENT_ORDERS = [
  { id: "HT-10245", client: "Aïcha N.", total: 49500, status: "Payée", method: "Orange Money" },
  { id: "HT-10244", client: "Mamadou D.", total: 28000, status: "En préparation", method: "Wave" },
  { id: "HT-10243", client: "Fatou S.", total: 67000, status: "Livrée", method: "Cash" },
  { id: "HT-10242", client: "Ibrahima B.", total: 19500, status: "En attente", method: "MTN MoMo" },
  { id: "HT-10241", client: "Khadija T.", total: 105000, status: "Payée", method: "Orange Money" },
];

function statusColor(s: string) {
  if (s === "Payée" || s === "Livrée") return "bg-emerald-500/10 text-emerald-600";
  if (s === "En préparation") return "bg-blue-500/10 text-blue-600";
  return "bg-amber-500/10 text-amber-600";
}

function Dashboard() {
  const topProducts = [...PRODUCTS].slice(0, 5);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Vue d'ensemble de votre activité.</p>
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
            <span className="text-xs text-muted-foreground">5 dernières</span>
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
                {RECENT_ORDERS.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
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
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold">Top produits</h2>
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
