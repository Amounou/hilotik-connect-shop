import { createFileRoute } from "@tanstack/react-router";
import { useAdmin, type OrderStatus, type Order } from "@/lib/admin-store";
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

const TABS = ["Toutes", "En attente", "En préparation", "Payée", "Livrée", "Annulée"] as const;
const STATUSES: OrderStatus[] = ["En attente", "En préparation", "Payée", "Livrée", "Annulée"];

function statusColor(s: string) {
  if (s === "Payée" || s === "Livrée") return "bg-emerald-500/10 text-emerald-600";
  if (s === "En préparation") return "bg-blue-500/10 text-blue-600";
  if (s === "Annulée") return "bg-red-500/10 text-red-600";
  return "bg-amber-500/10 text-amber-600";
}

function Commandes() {
  const { orders, setOrderStatus, deleteOrder } = useAdmin();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Toutes");
  const [view, setView] = useState<Order | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const list = tab === "Toutes" ? orders : orders.filter((o) => o.status === tab);

  const onStatus = (id: string, s: OrderStatus) => {
    setOrderStatus(id, s);
    toast.success(`Statut → ${s}`);
  };

  const onDel = () => {
    if (!confirmDel) return;
    deleteOrder(confirmDel);
    toast.success("Commande supprimée");
    setConfirmDel(null);
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Commandes</h1>
        <p className="text-sm text-muted-foreground">{orders.length} commandes au total</p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg bg-background p-1 border border-border w-fit">
        {TABS.map((t) => {
          const count = t === "Toutes" ? orders.length : orders.filter((o) => o.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t} <span className="opacity-60">({count})</span>
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
                <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                <td className="px-4 py-3 font-medium">{o.client}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.items}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.method}</td>
                <td className="px-4 py-3">
                  <Select value={o.status} onValueChange={(v) => onStatus(o.id, v as OrderStatus)}>
                    <SelectTrigger className={`h-7 w-[140px] border-0 px-2 text-xs font-medium ${statusColor(o.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{fmt(o.total)}</td>
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
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">Aucune commande.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Commande {view?.id}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Client</p><p className="font-medium">{view.client}</p></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{view.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{view.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Méthode</p><p className="font-medium">{view.method}</p></div>
                <div><p className="text-xs text-muted-foreground">Articles</p><p className="font-medium">{view.items}</p></div>
                <div><p className="text-xs text-muted-foreground">Statut</p><p className="font-medium">{view.status}</p></div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-xl font-bold">{fmt(view.total)}</span>
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
