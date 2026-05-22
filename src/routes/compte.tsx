import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, signOut } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogOut, Package } from "lucide-react";

export const Route = createFileRoute("/compte")({
  component: Account,
  head: () => ({ meta: [{ title: "Mon compte — HiloTik" }] }),
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

function Account() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ full_name: "", phone: "", address: "", city: "" });
  const [orders, setOrders] = useState<Array<{ id: string; total: number; status: string; created_at: string }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name ?? "", phone: data.phone ?? "", address: data.address ?? "", city: data.city ?? "" });
    });
    supabase.from("orders").select("id,total,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      setOrders(data ?? []);
    });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="container-page py-20 text-center text-sm text-muted-foreground">Chargement…</div>;
  }

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...profile });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profil enregistré");
  };

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Mon compte</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link to="/admin/dashboard" className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
              Admin
            </Link>
          )}
          <Button variant="outline" onClick={() => { signOut(); navigate({ to: "/" }); }} className="gap-2">
            <LogOut className="h-4 w-4" /> Déconnexion
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="font-display text-xl font-bold">Informations</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Nom complet</Label><Input className="mt-1" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></div>
            <div><Label>Téléphone</Label><Input className="mt-1" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
            <div><Label>Ville</Label><Input className="mt-1" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Adresse</Label><Input className="mt-1" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} /></div>
          </div>
          <Button onClick={save} disabled={saving} className="mt-5">Enregistrer</Button>
        </section>

        <aside className="rounded-xl border border-border bg-background p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Package className="h-5 w-5" /> Mes commandes</h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Aucune commande pour le moment.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2 text-sm">
                  <div>
                    <p className="font-mono text-xs">{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{fmt(Number(o.total))}</p>
                    <p className="text-xs text-muted-foreground">{o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
