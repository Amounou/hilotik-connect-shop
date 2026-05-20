import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/clients")({
  component: Clients,
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const CLIENTS = [
  { name: "Aïcha Ndiaye", email: "aicha.n@mail.com", phone: "+221 77 123 45 67", orders: 8, spent: 245000, since: "2025-08" },
  { name: "Mamadou Diallo", email: "m.diallo@mail.com", phone: "+221 76 888 22 11", orders: 3, spent: 92000, since: "2025-11" },
  { name: "Fatou Sow", email: "fatou.sow@mail.com", phone: "+221 70 555 99 00", orders: 12, spent: 410500, since: "2025-03" },
  { name: "Ibrahima Ba", email: "iba@mail.com", phone: "+221 77 234 56 78", orders: 1, spent: 19500, since: "2026-04" },
  { name: "Khadija Touré", email: "khadija.t@mail.com", phone: "+221 78 111 22 33", orders: 6, spent: 187000, since: "2025-09" },
];

function Clients() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Clients</h1>
        <p className="text-sm text-muted-foreground">{CLIENTS.length} clients enregistrés (démo)</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Téléphone</th>
              <th className="px-4 py-3 font-medium">Commandes</th>
              <th className="px-4 py-3 font-medium">Client depuis</th>
              <th className="px-4 py-3 text-right font-medium">Total dépensé</th>
            </tr>
          </thead>
          <tbody>
            {CLIENTS.map((c) => (
              <tr key={c.email} className="border-b border-border last:border-0 hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-semibold text-xs">
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                <td className="px-4 py-3">{c.orders}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.since}</td>
                <td className="px-4 py-3 text-right font-semibold">{fmt(c.spent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
