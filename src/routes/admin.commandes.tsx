import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/commandes")({
  component: Commandes,
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

type DbStatus = "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled";
type DbMethod = "orange_money" | "wave" | "mtn" | "cash";

const STATUS_LABEL: Record<DbStatus, string> = {
  pending: "En attente",
  paid: "Payée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const METHOD_LABEL: Record<DbMethod, string> = {
  orange_money: "Orange Money",
  wave: "Wave",
  mtn: "MTN Money",
  cash: "Cash à la livraison",
};

const STATUSES: DbStatus[] = ["pending", "paid", "preparing", "shipped", "delivered", "cancelled"];
const TABS: ("all" | DbStatus)[] = ["all", ...STATUSES];

interface OrderRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string | null;
  total: number;
  shipping_fee: number;
  status: DbStatus;
  payment_method: DbMethod;
  created_at: string;
  items: { product_name: string; quantity: number; unit_price: number }[];
}

function statusColor(s: DbStatus) {
  if (s === "paid" || s === "delivered") return "bg-emerald-500/10 text-emerald-600";
  if (s === "preparing" || s === "shipped") return "bg-blue-500/10 text-blue-600";
  if (s === "cancelled") return "bg-red-500/10 text-red-600";
  return "bg-amber-500/10 text-amber-600";
}

async function fetchOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_name, customer_phone, customer_address, customer_city, total, shipping_fee, status, payment_method, created_at, items:order_items(product_name, quantity, unit_price)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as OrderRow[];
}

function Commandes() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["admin", "orders"], queryFn: fetchOrders });
  const [tab, setTab] = useState<typeof TABS[number]>("all");
  const [view, setView] = useState<OrderRow | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const list = tab === "all" ? orders : orders.filter((o) => o.status === tab);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "orders"] });

  const onStatus = async (id: string, s: DbStatus) => {
    const { error } = await supabase.from("orders").update({ status: s }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Statut → ${STATUS_LABEL[s]}`);
    refresh();
  };

  const onDel = async () => {
    if (!confirmDel) return;
    await supabase.from("order_items").delete().eq("order_id", confirmDel);
    const { error } = await supabase.from("orders").delete().eq("id", confirmDel);
    if (error) return toast.error(error.message);
    toast.success("Commande supprimée");
    setConfirmDel(null);
    refresh();
  };

  const totalItems = (o: OrderRow) => o.items?.reduce((a, i) => a + i.quantity, 0) ?? 0;

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Commandes</h1>
        <p className="text-sm text-muted-foreground">{orders.length} commandes au total</p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg bg-background p-1 border border-border w-fit">
        {TABS.map((t) => {
          const count = t === "all" ? orders.length : orders.filter((o) => o.status === t).length;
          const label = t === "all" ? "Toutes" : STATUS_LABEL[t];
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
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
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3 font-medium">{o.customer_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{totalItems(o)}</td>
                <td className="px-4 py-3 text-muted-foreground">{METHOD_LABEL[o.payment_method]}</td>
                <td className="px-4 py-3">
                  <Select value={o.status} onValueChange={(v) => onStatus(o.id, v as DbStatus)}>
                    <SelectTrigger className={`h-7 w-[140px] border-0 px-2 text-xs font-medium ${statusColor(o.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{fmt(Number(o.total))}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setView(o)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Voir">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => setConfirmDel(o.id)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-red-600" aria-label="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">{isLoading ? "Chargement…" : "Aucune commande."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Commande {view?.id.slice(0, 8)}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Client</p><p className="font-medium">{view.customer_name}</p></div>
                <div><p className="text-xs text-muted-foreground">Téléphone</p><p className="font-medium">{view.customer_phone}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Adresse</p><p className="font-medium">{view.customer_address}{view.customer_city ? `, ${view.customer_city}` : ""}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{new Date(view.created_at).toLocaleString("fr-FR")}</p></div>
                <div><p className="text-xs text-muted-foreground">Méthode</p><p className="font-medium">{METHOD_LABEL[view.payment_method]}</p></div>
                <div><p className="text-xs text-muted-foreground">Statut</p><p className="font-medium">{STATUS_LABEL[view.status]}</p></div>
                <div><p className="text-xs text-muted-foreground">Livraison</p><p className="font-medium">{fmt(Number(view.shipping_fee))}</p></div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Articles</p>
                <ul className="space-y-1">
                  {view.items?.map((i, idx) => (
                    <li key={idx} className="flex justify-between rounded-md bg-secondary/50 px-3 py-2 text-xs">
                      <span>{i.quantity}× {i.product_name}</span>
                      <span className="font-medium">{fmt(Number(i.unit_price) * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-xl font-bold">{fmt(Number(view.total))}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onDel} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
