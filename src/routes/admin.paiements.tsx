import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin, type PaymentMethod } from "@/lib/admin-store";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/paiements")({
  component: Paiements,
});

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

type DbMethod = "orange_money" | "wave" | "mtn" | "cash";

const COLORS: Record<PaymentMethod, string> = {
  "Orange Money": "bg-orange-500",
  "Wave": "bg-blue-500",
  "MTN MoMo": "bg-yellow-500",
  "Cash à la livraison": "bg-emerald-500",
};

const DB_TO_LABEL: Record<DbMethod, PaymentMethod> = {
  orange_money: "Orange Money",
  wave: "Wave",
  mtn: "MTN MoMo",
  cash: "Cash à la livraison",
};

function Paiements() {
  const { settings, togglePaymentMethod } = useAdmin();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin", "orders-payments"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("total, payment_method, status");
      return data ?? [];
    },
  });

  const methods = (Object.keys(COLORS) as PaymentMethod[]).map((name) => {
    const dbKey = (Object.keys(DB_TO_LABEL) as DbMethod[]).find((k) => DB_TO_LABEL[k] === name)!;
    const matching = orders.filter((o) => o.payment_method === dbKey);
    return {
      name,
      count: matching.length,
      total: matching.reduce((a, o) => a + Number(o.total), 0),
      enabled: settings.enabledMethods[name],
      color: COLORS[name],
    };
  });

  const total = methods.reduce((a, m) => a + m.total, 0) || 1;

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Paiements</h1>
        <p className="text-sm text-muted-foreground">Activez ou désactivez les moyens de paiement</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {methods.map((m) => (
          <div key={m.name} className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${m.color}`} />
                <p className="text-sm font-medium">{m.name}</p>
              </div>
              <Switch
                checked={m.enabled}
                onCheckedChange={() => {
                  togglePaymentMethod(m.name);
                  toast.success(`${m.name} ${m.enabled ? "désactivé" : "activé"}`);
                }}
              />
            </div>
            <p className="mt-3 font-display text-xl font-bold">{fmt(m.total)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.count} transactions</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <p className="text-sm font-medium">Répartition du chiffre d'affaires</p>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-secondary">
          {methods.map((m) => (
            <div key={m.name} className={m.color} style={{ width: `${(m.total / total) * 100}%` }} />
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {methods.map((m) => (
            <div key={m.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${m.color}`} />
                <span>{m.name}</span>
              </div>
              <span className="font-medium">{((m.total / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
