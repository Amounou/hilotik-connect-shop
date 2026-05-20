import { createFileRoute } from "@tanstack/react-router";
import { useAdmin, slugify } from "@/lib/admin-store";
import type { Product, Category } from "@/lib/products";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import placeholder from "@/assets/p-tshirt.jpg";

export const Route = createFileRoute("/admin/produits")({
  component: Produits,
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

interface FormState {
  slug: string;
  name: string;
  brand: string;
  price: string;
  oldPrice: string;
  category: string;
  stock: string;
  description: string;
  image: string;
}

const empty = (): FormState => ({
  slug: "",
  name: "",
  brand: "",
  price: "",
  oldPrice: "",
  category: "homme",
  stock: "0",
  description: "",
  image: placeholder,
});

function Produits() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useAdmin();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const list = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const openNew = () => {
    setEditing(null);
    setForm(empty());
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p.slug);
    setForm({
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      category: p.category,
      stock: String(p.stock),
      description: p.description,
      image: p.image,
    });
    setOpen(true);
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setForm((s) => ({ ...s, image: String(reader.result) }));
    reader.readAsDataURL(f);
  };

  const save = () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Nom et prix requis");
      return;
    }
    const payload: Product = {
      slug: editing || slugify(form.name),
      name: form.name.trim(),
      brand: form.brand.trim() || "HiloTik",
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
      category: form.category as Category,
      image: form.image,
      description: form.description.trim(),
      stock: Number(form.stock) || 0,
    };
    if (editing) {
      updateProduct(editing, payload);
      toast.success("Produit mis à jour");
    } else {
      addProduct(payload);
      toast.success("Produit ajouté");
    }
    setOpen(false);
  };

  const remove = () => {
    if (!confirmDelete) return;
    deleteProduct(confirmDelete);
    toast.success("Produit supprimé");
    setConfirmDelete(null);
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
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.slug} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-11 w-11 rounded-md object-cover" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.stock < 5 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                      {p.stock} en stock
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{fmt(p.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(p.slug)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Aucun produit trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Image</Label>
              <div className="mt-1 flex items-center gap-3">
                <img src={form.image} alt="" className="h-20 w-20 rounded-md object-cover border border-border" />
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
                  <ImagePlus className="h-4 w-4" /> Changer l'image
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
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
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
            <div className="sm:col-span-2">
              <Label>Stock</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save}>{editing ? "Enregistrer" : "Créer"}</Button>
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
