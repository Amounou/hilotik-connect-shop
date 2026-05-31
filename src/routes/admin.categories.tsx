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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/categories")({
  component: Categories,
});

const NONE = "__none__";

function Categories() {
  const qc = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts({ includeInactive: true });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>(NONE);
  const [saving, setSaving] = useState(false);

  const parents = categories.filter((c) => !c.parentId);
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["categories"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const save = async () => {
    if (!name.trim()) return toast.error("Nom requis");
    setSaving(true);
    try {
      await createCategory(name.trim(), parentId === NONE ? null : parentId);
      toast.success("Catégorie ajoutée");
      setName("");
      setParentId(NONE);
      setOpen(false);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, count: number, subCount: number) => {
    if (count > 0) return toast.error(`Impossible : ${count} produit(s) utilisent cette catégorie`);
    if (subCount > 0) return toast.error(`Impossible : ${subCount} sous-catégorie(s) existent`);
    try {
      await deleteCategory(id);
      toast.success("Catégorie supprimée");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  const renderCard = (c: typeof categories[number], isChild = false) => {
    const count = products.filter((p) => p.categoryId === c.id).length;
    const subs = childrenOf(c.id);
    return (
      <div
        key={c.id}
        className={`group relative rounded-xl border border-border bg-background p-5 ${isChild ? "ml-4 border-dashed" : ""}`}
      >
        <button
          onClick={() => remove(c.id, count, subs.length)}
          className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-secondary hover:text-red-600 group-hover:opacity-100"
          aria-label="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {isChild ? "Sous-catégorie" : c.slug}
        </p>
        <h2 className="mt-2 font-display text-lg font-bold">{c.name}</h2>
        <p className="mt-3 text-2xl font-bold">{count}</p>
        <p className="text-xs text-muted-foreground">produits {subs.length > 0 && `· ${subs.length} sous-cat.`}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Catégories</h1>
          <p className="text-sm text-muted-foreground">Organisez votre catalogue avec catégories et sous-catégories</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle catégorie
        </Button>
      </div>

      <div className="space-y-6">
        {parents.map((p) => {
          const subs = childrenOf(p.id);
          return (
            <div key={p.id} className="space-y-3">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {renderCard(p)}
                {subs.map((s) => renderCard(s, true))}
              </div>
            </div>
          );
        })}
        {parents.length === 0 && (
          <div className="rounded-md border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Aucune catégorie. Créez-en une pour démarrer.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom de la catégorie</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Sneakers" className="mt-1" autoFocus />
            </div>
            <div>
              <Label>Catégorie parente (optionnel)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Aucune (catégorie principale)</SelectItem>
                  {parents.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Choisir une parente crée une sous-catégorie.
              </p>
            </div>
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
