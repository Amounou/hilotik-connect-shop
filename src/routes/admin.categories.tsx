import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useProducts, useCategories } from "@/hooks/use-catalog";
import { createCategory, deleteCategory } from "@/lib/catalog";
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
  const qc = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts({ includeInactive: true });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["categories"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const save = async () => {
    if (!name.trim()) return toast.error("Nom requis");
    setSaving(true);
    try {
      await createCategory(name.trim());
      toast.success("Catégorie ajoutée");
      setName("");
      setOpen(false);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, count: number) => {
    if (count > 0) return toast.error(`Impossible : ${count} produit(s) utilisent cette catégorie`);
    try {
      await deleteCategory(id);
      toast.success("Catégorie supprimée");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
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
          const count = products.filter((p) => p.categoryId === c.id).length;
          return (
            <div key={c.id} className="group relative rounded-xl border border-border bg-background p-5">
              <button
                onClick={() => remove(c.id, count)}
                className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-secondary hover:text-red-600 group-hover:opacity-100"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.slug}</p>
              <h2 className="mt-2 font-display text-lg font-bold">{c.name}</h2>
              <p className="mt-3 text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">produits</p>
            </div>
          );
        })}
        {categories.length === 0 && (
          <div className="col-span-full rounded-md border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Aucune catégorie. Créez-en une pour démarrer.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Nom de la catégorie</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Enfants" className="mt-1" autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving}>{saving ? "…" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
