import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS } from "@/lib/products";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/produits")({
  component: Produits,
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

function Produits() {
  const [q, setQ] = useState("");
  const list = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Produits</h1>
          <p className="text-sm text-muted-foreground">{PRODUCTS.length} produits dans le catalogue</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90">
          <Plus className="h-4 w-4" />
          Nouveau produit
        </button>
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
                      <button className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
