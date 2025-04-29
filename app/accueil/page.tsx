'use client'
import Loader from "@/components/Loader";
import { useState } from "react";
import Link from "next/link";

const navItems = [
  { label: "Plans optimisés", href: "/plans" },
  { label: "Cultures", href: "/cultures" },
  { label: "Marché", href: "/marche" },
];

export default function Accueil() {
  // Exemple d'utilisation du loader
  const [loading, setLoading] = useState(false);

  // Simuler un appel API
  // useEffect(() => {
  //   setLoading(true);
  //   setTimeout(() => setLoading(false), 2000);
  // }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-10">
      <h1 className="text-3xl font-bold mb-8 text-emerald-700">Bienvenue sur le tableau de bord agricole</h1>
      <p className="mb-8 text-gray-700 text-lg text-center max-w-xl">
        Gérez vos produits, commandes, statistiques et bien plus depuis votre tableau de bord.
      </p>
      <div className="flex w-full max-w-4xl justify-center mb-8">
        <Link
          href="/plans/nouveau"
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition text-lg"
        >
          <span className="text-2xl leading-none">+</span> Nouveau plan optimisé
        </Link>
      </div>
      
      {loading && <Loader />}
    </div>
  );
}

 