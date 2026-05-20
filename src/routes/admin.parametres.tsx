import { createFileRoute } from "@tanstack/react-router";
import { useAdmin, type PaymentMethod } from "@/lib/admin-store";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/parametres")({
  component: Parametres,
});

const METHODS: PaymentMethod[] = ["Orange Money", "Wave", "MTN MoMo", "Cash à la livraison"];

function Parametres() {
  const { settings, updateSettings, togglePaymentMethod } = useAdmin();
  const [form, setForm] = useState(settings);

  useEffect(() => setForm(settings), [settings]);

  const save = () => {
    updateSettings(form);
    toast.success("Paramètres enregistrés");
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Configurez votre boutique</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="font-semibold">Informations boutique</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Nom de la boutique</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Email contact</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Adresse</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="font-semibold">Moyens de paiement</h2>
          <div className="mt-4 space-y-3">
            {METHODS.map((m) => (
              <div key={m} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm">
                <span>{m}</span>
                <Switch
                  checked={settings.enabledMethods[m]}
                  onCheckedChange={() => {
                    togglePaymentMethod(m);
                    toast.success(`${m} ${settings.enabledMethods[m] ? "désactivé" : "activé"}`);
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="font-semibold">Livraison</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Frais standard (FCFA)</Label>
              <Input type="number" value={form.shippingStandard} onChange={(e) => setForm({ ...form, shippingStandard: Number(e.target.value) })} className="mt-1" />
            </div>
            <div>
              <Label>Frais express (FCFA)</Label>
              <Input type="number" value={form.shippingExpress} onChange={(e) => setForm({ ...form, shippingExpress: Number(e.target.value) })} className="mt-1" />
            </div>
            <div>
              <Label>Seuil livraison gratuite (FCFA)</Label>
              <Input type="number" value={form.freeShippingThreshold} onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })} className="mt-1" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="font-semibold">Administrateurs</h2>
          <div className="mt-4 space-y-2">
            {[
              { name: "Admin Principal", email: "admin@hilotik.com", role: "Super Admin" },
              { name: "Awa Faye", email: "awa@hilotik.com", role: "Manager" },
            ].map((a) => (
              <div key={a.email} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm">
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.email}</p>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{a.role}</span>
              </div>
            ))}
            <p className="pt-2 text-xs text-muted-foreground">
              La gestion multi-admin nécessite l'activation de Lovable Cloud.
            </p>
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} className="px-6">Enregistrer les modifications</Button>
      </div>
    </div>
  );
}
