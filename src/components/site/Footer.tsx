import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <h3 className="font-display text-lg font-bold">HiloTik</h3>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Le détail qui fait toute la différence. Mode et accessoires, livrés chez vous.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Boutique</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/boutique" className="hover:text-foreground">Tous les produits</Link></li>
            <li><Link to="/boutique" search={{ cat: "homme" }} className="hover:text-foreground">Homme</Link></li>
            <li><Link to="/boutique" search={{ cat: "femme" }} className="hover:text-foreground">Femme</Link></li>
            <li><Link to="/boutique" search={{ cat: "chaussures" }} className="hover:text-foreground">Chaussures</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Aide</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Livraison</li>
            <li>Retours</li>
            <li>Contact</li>
            <li>FAQ</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Paiement</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Orange Money</li>
            <li>MTN Money</li>
            <li>Wave</li>
            <li>À la livraison</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} HiloTik. Tous droits réservés.</span>
          <span>Mentions légales · Confidentialité · CGV</span>
        </div>
      </div>
    </footer>
  );
}
