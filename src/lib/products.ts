import sneaker from "@/assets/p-sneaker.jpg";
import watch from "@/assets/p-watch.jpg";
import hoodie from "@/assets/p-hoodie.jpg";
import bag from "@/assets/p-bag.jpg";
import tshirt from "@/assets/p-tshirt.jpg";
import sunglasses from "@/assets/p-sunglasses.jpg";
import coat from "@/assets/p-coat.jpg";

export type Category = "homme" | "femme" | "chaussures" | "accessoires";

export interface Product {
  slug: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  category: Category;
  image: string;
  description: string;
  stock: number;
  sizes?: string[];
  colors?: string[];
  isNew?: boolean;
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "homme", label: "Homme" },
  { id: "femme", label: "Femme" },
  { id: "chaussures", label: "Chaussures" },
  { id: "accessoires", label: "Accessoires" },
];

export const PRODUCTS: Product[] = [
  {
    slug: "sneaker-blanc-essentiel",
    name: "Sneaker Blanc Essentiel",
    brand: "HiloTik Studio",
    price: 39500,
    oldPrice: 49000,
    category: "chaussures",
    image: sneaker,
    description:
      "Sneaker minimaliste en cuir lisse, semelle légère et confort longue durée. Coupe basse, finitions soignées.",
    stock: 12,
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Blanc"],
    isNew: true,
  },
  {
    slug: "montre-noire-classic",
    name: "Montre Noire Classic",
    brand: "Hilo Time",
    price: 28000,
    category: "accessoires",
    image: watch,
    description:
      "Montre cadran 40mm, boîtier acier brossé noir, bracelet cuir véritable. Une pièce intemporelle.",
    stock: 7,
    colors: ["Noir"],
  },
  {
    slug: "hoodie-oversize-creme",
    name: "Hoodie Oversize Crème",
    brand: "HiloTik Studio",
    price: 18500,
    category: "homme",
    image: hoodie,
    description:
      "Hoodie coupe oversize en molleton premium 400g/m². Doux, chaud, parfaitement structuré.",
    stock: 25,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Crème", "Noir"],
    isNew: true,
  },
  {
    slug: "sac-bandouliere-cuir",
    name: "Sac Bandoulière Cuir",
    brand: "Maison Hilo",
    price: 32000,
    oldPrice: 38000,
    category: "accessoires",
    image: bag,
    description:
      "Sac bandoulière compact en cuir grainé. Lanière ajustable, finitions dorées discrètes.",
    stock: 9,
    colors: ["Noir"],
  },
  {
    slug: "t-shirt-coton-blanc",
    name: "T-Shirt Coton Blanc",
    brand: "HiloTik Studio",
    price: 8500,
    category: "femme",
    image: tshirt,
    description:
      "T-shirt en coton biologique 100%. Coupe droite, col rond renforcé, tombé impeccable.",
    stock: 50,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Blanc"],
  },
  {
    slug: "lunettes-soleil-noires",
    name: "Lunettes Soleil Noires",
    brand: "Hilo Optic",
    price: 14500,
    category: "accessoires",
    image: sunglasses,
    description:
      "Monture acétate noire, verres polarisés catégorie 3. Protection UV400, étui inclus.",
    stock: 18,
    colors: ["Noir"],
    isNew: true,
  },
  {
    slug: "manteau-laine-camel",
    name: "Manteau Laine Camel",
    brand: "Maison Hilo",
    price: 56000,
    category: "femme",
    image: coat,
    description:
      "Manteau en mélange laine et cachemire, coupe droite, doublure satin. Élégance intemporelle.",
    stock: 5,
    sizes: ["S", "M", "L"],
    colors: ["Camel"],
  },
  {
    slug: "sneaker-blanc-edition",
    name: "Sneaker Édition Limitée",
    brand: "HiloTik Studio",
    price: 45000,
    category: "homme",
    image: sneaker,
    description:
      "Édition limitée numérotée. Cuir pleine fleur, semelle Vibram, packaging signature.",
    stock: 3,
    sizes: ["40", "41", "42", "43"],
    colors: ["Blanc"],
  },
];

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

export const findProduct = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug);
