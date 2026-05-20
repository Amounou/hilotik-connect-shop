import { createFileRoute, Link } from "@tanstack/react-router";
import { User } from "lucide-react";

export const Route = createFileRoute("/compte")({
  component: Account,
  head: () => ({ meta: [{ title: "Espace client — HiloTik" }] }),
});

function Account() {
  return (
    <div className="container-page py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <User className="h-7 w-7" />
      </div>
      <h1 className="mt-6 font-display text-4xl font-bold">Espace client</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        L'inscription, la connexion et le suivi de vos commandes arrivent bientôt. Pour cette première version, vous pouvez commander en tant qu'invité.
      </p>
      <Link to="/boutique" className="mt-8 inline-block rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90">
        Continuer mes achats
      </Link>
    </div>
  );
}
