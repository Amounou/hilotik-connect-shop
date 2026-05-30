import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin-login")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "Connexion Admin — HiloTik" }] }),
});

function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (role) navigate({ to: "/admin/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) throw error;
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) {
        await supabase.auth.signOut();
        throw new Error("Ce compte n'a pas les droits administrateur.");
      }
      toast.success("Connexion admin réussie");
      navigate({ to: "/admin/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-md bg-foreground p-2 text-background">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Espace réservé
            </p>
            <h1 className="font-display text-3xl font-bold leading-tight">
              Connexion Administrateur
            </h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Accès strictement limité au personnel autorisé HiloTik.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <Label>Email professionnel</Label>
            <Input
              className="mt-1"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Mot de passe</Label>
            <Input
              className="mt-1"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "..." : "Accéder à la console"}
          </Button>
        </form>

        <div className="mt-8 rounded-md border border-border bg-secondary/40 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Vous êtes client ?</p>
          <p className="mt-1">
            Les comptes clients sont gérés séparément.{" "}
            <Link to="/auth" className="font-medium text-foreground underline">
              Connexion client
            </Link>
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            ← Retour à la boutique
          </Link>
        </p>
      </div>
    </div>
  );
}
