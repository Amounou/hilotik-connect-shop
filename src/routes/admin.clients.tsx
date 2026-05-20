import { createFileRoute } from "@tanstack/react-router";
import { useAdmin, type Customer } from "@/lib/admin-store";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, Trash2, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export const Route = createFileRoute("/admin/clients")({
  component: Clients,
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

function Clients() {
  const { customers, orders, deleteCustomer } = useAdmin();
  const [view, setView] = useState<Customer | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const onDel = () => {
    if (!confirmDel) return;
    deleteCustomer(confirmDel);
    toast.success("Client supprimé");
    setConfirmDel(null);
  };

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
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
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
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <a href={`mailto:${c.email}`} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Email">
                      <Mail className="h-4 w-4" />
                    </a>
                    <button onClick={() => setView(c)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Voir">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => setConfirmDel(c.id)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-red-600" aria-label="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Aucun client.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{view?.name}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{view.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Téléphone</p><p className="font-medium">{view.phone}</p></div>
                <div><p className="text-xs text-muted-foreground">Client depuis</p><p className="font-medium">{view.since}</p></div>
                <div><p className="text-xs text-muted-foreground">Commandes</p><p className="font-medium">{view.orders}</p></div>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total dépensé</p>
                <p className="font-display text-2xl font-bold">{fmt(view.spent)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Commandes liées</p>
                <ul className="space-y-1 text-xs">
                  {orders.filter((o) => o.email === view.email).map((o) => (
                    <li key={o.id} className="flex justify-between rounded-md bg-secondary/50 px-3 py-2">
                      <span className="font-mono">{o.id}</span>
                      <span>{o.status}</span>
                      <span className="font-medium">{fmt(o.total)}</span>
                    </li>
                  ))}
                  {orders.filter((o) => o.email === view.email).length === 0 && (
                    <li className="text-muted-foreground">Aucune commande récente.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
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
