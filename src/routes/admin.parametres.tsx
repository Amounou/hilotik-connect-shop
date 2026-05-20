import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/parametres")({
  component: Parametres,
});

function Field({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
      />
    </div>
  );
}

function Parametres() {
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
            <Field label="Nom de la boutique" value="HiloTik" />
            <Field label="Email contact" value="contact@hilotik.com" type="email" />
            <Field label="Téléphone" value="+221 77 000 00 00" />
            <Field label="Adresse" value="Dakar, Sénégal" />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="font-semibold">Paiement</h2>
          <div className="mt-4 space-y-3">
            {["Orange Money", "Wave", "MTN MoMo", "Cash à la livraison"].map((m) => (
              <label key={m} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm">
                <span>{m}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-foreground" />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="font-semibold">Livraison</h2>
          <div className="mt-4 space-y-4">
            <Field label="Frais standard (FCFA)" value="2000" type="number" />
            <Field label="Frais express (FCFA)" value="5000" type="number" />
            <Field label="Seuil livraison gratuite (FCFA)" value="50000" type="number" />
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
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <button className="rounded-md bg-foreground px-6 py-2.5 text-sm font-medium text-background hover:opacity-90">
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}
