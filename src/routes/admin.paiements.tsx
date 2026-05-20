import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/paiements")({
  component: Paiements,
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const METHODS = [
  { name: "Orange Money", count: 54, total: 842000, color: "bg-orange-500" },
  { name: "Wave", count: 38, total: 612500, color: "bg-blue-500" },
  { name: "MTN MoMo", count: 21, total: 287000, color: "bg-yellow-500" },
  { name: "Cash à la livraison", count: 15, total: 198000, color: "bg-emerald-500" },
];

function Paiements() {
  const total = METHODS.reduce((a, m) => a + m.total, 0);
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Paiements</h1>
        <p className="text-sm text-muted-foreground">Répartition des moyens de paiement</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METHODS.map((m) => (
          <div key={m.name} className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${m.color}`} />
              <p className="text-sm font-medium">{m.name}</p>
            </div>
            <p className="mt-3 font-display text-xl font-bold">{fmt(m.total)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.count} transactions</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <p className="text-sm font-medium">Répartition</p>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-secondary">
          {METHODS.map((m) => (
            <div key={m.name} className={m.color} style={{ width: `${(m.total / total) * 100}%` }} />
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {METHODS.map((m) => (
            <div key={m.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${m.color}`} />
                <span>{m.name}</span>
              </div>
              <span className="font-medium">{((m.total / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
