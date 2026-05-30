import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { Eye, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/clients")({
  component: Clients,
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

interface CustomerRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  created_at: string;
  orders: number;
  spent: number;
  lastOrder: string | null;
}

async function fetchCustomers(): Promise<CustomerRow[]> {
  const [{ data: profiles, error: pErr }, { data: orders, error: oErr }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, phone, city, address, created_at"),
    supabase.from("orders").select("user_id, total, status, created_at"),
  ]);
  if (pErr) throw pErr;
  if (oErr) throw oErr;
  const byUser = new Map<string, { count: number; spent: number; last: string | null }>();
  (orders ?? []).forEach((o) => {
    if (!o.user_id) return;
    const acc = byUser.get(o.user_id) ?? { count: 0, spent: 0, last: null };
    acc.count += 1;
    if (o.status === "paid" || o.status === "delivered" || o.status === "shipped") {
      acc.spent += Number(o.total);
    }
    if (!acc.last || o.created_at > acc.last) acc.last = o.created_at;
    byUser.set(o.user_id, acc);
  });
  return (profiles ?? []).map((p) => {
    const agg = byUser.get(p.id) ?? { count: 0, spent: 0, last: null };
    return {
      id: p.id,
      full_name: p.full_name,
      phone: p.phone,
      city: p.city,
      address: p.address,
      created_at: p.created_at,
      orders: agg.count,
      spent: agg.spent,
      lastOrder: agg.last,
    };
  });
}

function Clients() {
  const { data: customers = [], isLoading } = useQuery({ queryKey: ["admin", "customers"], queryFn: fetchCustomers });
  const [view, setView] = useState<CustomerRow | null>(null);
  const { data: viewOrders = [] } = useQuery({
    queryKey: ["admin", "customer-orders", view?.id],
    enabled: !!view,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, total, status, created_at")
        .eq("user_id", view!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const sorted = useMemo(() => [...customers].sort((a, b) => b.spent - a.spent), [customers]);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Clients</h1>
        <p className="text-sm text-muted-foreground">{customers.length} clients enregistrés</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Téléphone</th>
              <th className="px-4 py-3 font-medium">Commandes</th>
              <th className="px-4 py-3 font-medium">Depuis</th>
              <th className="px-4 py-3 text-right font-medium">Total dépensé</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const name = c.full_name || "Client";
              return (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-semibold text-xs">
                        {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{c.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">{c.orders}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3 text-right font-semibold">{fmt(c.spent)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Téléphone">
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      <button onClick={() => setView(c)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Voir">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">{isLoading ? "Chargement…" : "Aucun client."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{view?.full_name ?? "Client"}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Téléphone</p><p className="font-medium">{view.phone ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Ville</p><p className="font-medium">{view.city ?? "—"}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Adresse</p><p className="font-medium">{view.address ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Client depuis</p><p className="font-medium">{new Date(view.created_at).toLocaleDateString("fr-FR")}</p></div>
                <div><p className="text-xs text-muted-foreground">Commandes</p><p className="font-medium">{view.orders}</p></div>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total dépensé</p>
                <p className="font-display text-2xl font-bold">{fmt(view.spent)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Commandes liées</p>
                <ul className="space-y-1 text-xs">
                  {viewOrders.map((o) => (
                    <li key={o.id} className="flex justify-between rounded-md bg-secondary/50 px-3 py-2">
                      <span className="font-mono">{o.id.slice(0, 8)}</span>
                      <span>{o.status}</span>
                      <span className="font-medium">{fmt(Number(o.total))}</span>
                    </li>
                  ))}
                  {viewOrders.length === 0 && (
                    <li className="text-muted-foreground">Aucune commande.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
