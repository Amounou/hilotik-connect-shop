import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  component: Categories,
});

function Categories() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Catégories</h1>
          <p className="text-sm text-muted-foreground">Organisez votre catalogue</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90">
          <Plus className="h-4 w-4" /> Nouvelle catégorie
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => {
          const count = PRODUCTS.filter((p) => p.category === c.id).length;
          return (
            <div key={c.id} className="rounded-xl border border-border bg-background p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.id}</p>
              <h2 className="mt-2 font-display text-lg font-bold">{c.label}</h2>
              <p className="mt-3 text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">produits</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
