import { createFileRoute } from "@tanstack/react-router";
import { useAdmin } from "@/lib/admin-store";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/categories")({
  component: Categories,
});

function Categories() {
  const { categories, products, addCategory, deleteCategory } = useAdmin();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");

  const save = () => {
    if (!label.trim()) return toast.error("Nom requis");
    addCategory(label.trim());
    toast.success("Catégorie ajoutée");
    setLabel("");
    setOpen(false);
  };

  const remove = (id: string, count: number) => {
    if (count > 0) return toast.error(`Impossible : ${count} produit(s) utilisent cette catégorie`);
    deleteCategory(id);
    toast.success("Catégorie supprimée");
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Catégories</h1>
          <p className="text-sm text-muted-foreground">Organisez votre catalogue</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle catégorie
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => {
          const count = products.filter((p) => p.category === c.id).length;
          return (
            <div key={c.id} className="group relative rounded-xl border border-border bg-background p-5">
              <button
                onClick={() => remove(String(c.id), count)}
                className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-secondary hover:text-red-600 group-hover:opacity-100"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.id}</p>
              <h2 className="mt-2 font-display text-lg font-bold">{c.label}</h2>
              <p className="mt-3 text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">produits</p>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Nom de la catégorie</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Enfants" className="mt-1" autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
