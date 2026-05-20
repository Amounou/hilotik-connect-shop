import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/commandes")({
  component: Commandes,
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const ORDERS = [
  { id: "HT-10245", client: "Aïcha N.", date: "2026-05-19", items: 3, total: 49500, status: "Payée", method: "Orange Money" },
  { id: "HT-10244", client: "Mamadou D.", date: "2026-05-19", items: 1, total: 28000, status: "En préparation", method: "Wave" },
  { id: "HT-10243", client: "Fatou S.", date: "2026-05-18", items: 2, total: 67000, status: "Livrée", method: "Cash" },
  { id: "HT-10242", client: "Ibrahima B.", date: "2026-05-18", items: 1, total: 19500, status: "En attente", method: "MTN MoMo" },
  { id: "HT-10241", client: "Khadija T.", date: "2026-05-17", items: 4, total: 105000, status: "Payée", method: "Orange Money" },
  { id: "HT-10240", client: "Sékou C.", date: "2026-05-17", items: 1, total: 18500, status: "Annulée", method: "Wave" },
  { id: "HT-10239", client: "Mariam K.", date: "2026-05-16", items: 2, total: 54000, status: "Livrée", method: "Cash" },
];

const TABS = ["Toutes", "En attente", "En préparation", "Payée", "Livrée", "Annulée"] as const;

function statusColor(s: string) {
  if (s === "Payée" || s === "Livrée") return "bg-emerald-500/10 text-emerald-600";
  if (s === "En préparation") return "bg-blue-500/10 text-blue-600";
  if (s === "Annulée") return "bg-red-500/10 text-red-600";
  return "bg-amber-500/10 text-amber-600";
}

function Commandes() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Toutes");
  const list = tab === "Toutes" ? ORDERS : ORDERS.filter((o) => o.status === tab);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Commandes</h1>
        <p className="text-sm text-muted-foreground">{ORDERS.length} commandes au total</p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg bg-background p-1 border border-border w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">N°</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Articles</th>
              <th className="px-4 py-3 font-medium">Paiement</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                <td className="px-4 py-3 font-medium">{o.client}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.items}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.method}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(o.status)}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{fmt(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
