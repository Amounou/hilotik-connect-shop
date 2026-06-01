import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { CheckCircle2, LogIn } from "lucide-react";

export const Route = createFileRoute("/commande")({
  component: Checkout,
  head: () => ({ meta: [{ title: "Commande — HiloTik" }] }),
});

const PAYMENTS = [
  { id: "orange_money", label: "Orange Money", desc: "Paiement instantané via Orange" },
  { id: "mtn", label: "MTN Money", desc: "Paiement via MTN Mobile Money" },
  { id: "wave", label: "Wave", desc: "Rapide et sans frais" },
  { id: "cash", label: "Paiement à la livraison", desc: "Payez en espèces à la réception" },
] as const;

type PaymentId = (typeof PAYMENTS)[number]["id"];

function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentId>("orange_money");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", address: "", city: "" });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle().then(({ data: p }) => {
          if (p) {
            const [first = "", ...rest] = (p.full_name ?? "").split(" ");
            setForm((s) => ({ ...s, firstName: first, lastName: rest.join(" "), phone: p.phone ?? "", address: p.address ?? "", city: p.city ?? "" }));
          }
        });
      }
    });
  }, []);

  const sub = total();
  const shipping = sub > 50000 ? 0 : 2000;

  if (items.length === 0 && !done) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Aucun article à commander</h1>
        <button onClick={() => navigate({ to: "/boutique" })} className="mt-6 rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background">
          Aller à la boutique
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container-page py-20 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand" />
        <h1 className="mt-6 font-display text-4xl font-bold">Commande confirmée</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Merci {form.firstName} ! Vous recevrez un SMS de confirmation au {form.phone}.
        </p>
        <button onClick={() => navigate({ to: "/" })} className="mt-8 rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.phone || !form.address) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      const customerName = `${form.firstName} ${form.lastName}`.trim();

      const { data: order, error: oErr } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          customer_name: customerName,
          customer_phone: form.phone,
          customer_address: form.address,
          customer_city: form.city || null,
          total: sub + shipping,
          shipping_fee: shipping,
          payment_method: payment,
          status: payment === "cash" ? "pending" : "paid",
        })
        .select("id")
        .single();
      if (oErr) throw oErr;

      // Resolve product_id from slugs to link order items to catalog products
      const slugs = Array.from(new Set(items.map((i) => i.slug)));
      const { data: prods } = await supabase.from("products").select("id,slug").in("slug", slugs);
      const slugToId = new Map((prods ?? []).map((p) => [p.slug, p.id]));

      const itemsPayload = items.map((i) => ({
        order_id: order.id,
        product_id: slugToId.get(i.slug) ?? null,
        product_name: i.name + (i.size ? ` (${i.size})` : ""),
        unit_price: i.price,
        quantity: i.qty,
      }));
      const { error: iErr } = await supabase.from("order_items").insert(itemsPayload);
      if (iErr) throw iErr;

      clear();
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la commande");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <form onSubmit={submit} className="container-page py-10 md:py-14">
      <h1 className="font-display text-4xl font-bold md:text-5xl">Commande</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-xl font-bold">Livraison</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Prénom *" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
              <Field label="Nom" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
              <Field label="Téléphone *" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Ville" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
              <div className="sm:col-span-2">
                <Field label="Adresse complète *" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Paiement</h2>
            <div className="mt-5 grid gap-3">
              {PAYMENTS.map((p) => (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition ${
                    payment === p.id ? "border-foreground bg-secondary/50" : "border-border hover:border-foreground/40"
                  }`}
                >
                  <input type="radio" name="payment" checked={payment === p.id} onChange={() => setPayment(p.id)} className="mt-1 accent-foreground" />
                  <div>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-md border border-border p-6">
          <h2 className="font-display text-lg font-bold">Votre commande</h2>
          <ul className="mt-5 divide-y divide-border">
            {items.map((i) => (
              <li key={`${i.slug}-${i.size ?? ""}`} className="flex justify-between py-3 text-sm">
                <span className="truncate pr-2">{i.qty}× {i.name}</span>
                <span className="shrink-0">{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Sous-total</dt><dd>{formatPrice(sub)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Livraison</dt><dd>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <dt>Total</dt><dd>{formatPrice(sub + shipping)}</dd>
            </div>
          </dl>
          <button type="submit" disabled={submitting} className="mt-6 w-full rounded-md bg-foreground px-6 py-3.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50">
            {submitting ? "Validation…" : "Valider la commande"}
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">En validant, vous acceptez nos CGV.</p>
        </aside>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-foreground" />
    </label>
  );
}
