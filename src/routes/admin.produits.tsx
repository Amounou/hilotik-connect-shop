import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useProducts, useCategories } from "@/hooks/use-catalog";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  slugify,
  type UIProduct,
} from "@/lib/catalog";
import { Plus, Search, Pencil, Trash2, ImagePlus } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/produits")({
  component: Produits,
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

interface FormState {
  name: string;
  brand: string;
  price: string;
  oldPrice: string;
  category_id: string;
  stock: string;
  description: string;
  image_url: string;
  sizes: string;
  colors: string;
  is_new: boolean;
  active: boolean;
}

const empty = (): FormState => ({
  name: "",
  brand: "HiloTik",
  price: "",
  oldPrice: "",
  category_id: "",
  stock: "0",
  description: "",
  image_url: "",
  sizes: "",
  colors: "",
  is_new: false,
  active: true,
});

function Produits() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useProducts({ includeInactive: true });
  const { data: categories = [] } = useCategories();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UIProduct | null>(null);
  const [form, setForm] = useState<FormState>(empty());
  const [confirmDelete, setConfirmDelete] = useState<UIProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const list = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const refresh = () => qc.invalidateQueries({ queryKey: ["products"] });

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty(), category_id: categories[0]?.id ?? "" });
    setOpen(true);
  };

  const openEdit = (p: UIProduct) => {
    setEditing(p);
    setForm({
      name: p.name,
      brand: p.brand,
      price: String(p.price),
      oldPrice: p.oldPrice != null ? String(p.oldPrice) : "",
      category_id: p.categoryId ?? "",
      stock: String(p.stock),
      description: p.description,
      image_url: p.image,
      sizes: p.sizes.join(", "),
      colors: p.colors.join(", "),
      is_new: p.isNew,
      active: p.active,
    });
    setOpen(true);
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(f);
      setForm((s) => ({ ...s, image_url: url }));
      toast.success("Image téléversée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur d'upload");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Nom et prix requis");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: editing?.slug || slugify(form.name),
        name: form.name.trim(),
        brand: form.brand.trim() || "HiloTik",
        description: form.description.trim(),
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        stock: Number(form.stock) || 0,
        image_url: form.image_url,
        category_id: form.category_id || null,
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
        is_new: form.is_new,
        active: form.active,
      };
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success("Produit mis à jour");
      } else {
        await createProduct(payload);
        toast.success("Produit ajouté");
      }
      setOpen(false);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirmDelete) return;
    try {
      await deleteProduct(confirmDelete.id);
      toast.success("Produit supprimé");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Produits</h1>
          <p className="text-sm text-muted-foreground">{products.length} produits dans le catalogue</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Nouveau produit
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-background">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un produit..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Prix</th>
                <th className="px-4 py-3 font-medium">État</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt="" className="h-11 w-11 rounded-md object-cover" />
                      ) : (
                        <div className="h-11 w-11 rounded-md bg-secondary" />
                      )}
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{p.categorySlug ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.stock < 5 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                      {p.stock} en stock
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{fmt(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {p.active ? "Publié" : "Masqué"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(p)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {isLoading ? "Chargement…" : "Aucun produit trouvé."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Image</Label>
              <div className="mt-1 flex items-center gap-3">
                {form.image_url ? (
                  <img src={form.image_url} alt="" className="h-20 w-20 rounded-md object-cover border border-border" />
                ) : (
                  <div className="h-20 w-20 rounded-md border border-dashed border-border bg-secondary" />
                )}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
                  <ImagePlus className="h-4 w-4" /> {uploading ? "Upload…" : "Téléverser une image"}
                </Button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Marque</Label>
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir…" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prix (FCFA)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Ancien prix (optionnel)</Label>
              <Input type="number" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Tailles (séparées par virgule)</Label>
              <Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label>Couleurs (séparées par virgule)</Label>
              <Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Noir, Blanc" className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Nouveauté</p>
                <p className="text-xs text-muted-foreground">Affiche un badge "Nouveau"</p>
              </div>
              <Switch checked={form.is_new} onCheckedChange={(v) => setForm({ ...form, is_new: v })} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Publié</p>
                <p className="text-xs text-muted-foreground">Visible sur la boutique</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving}>{saving ? "…" : editing ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
