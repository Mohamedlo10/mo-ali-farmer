"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getPlanWithParcelles } from "@/app/api/plans/query";
import { createClient } from "@/lib/supabaseClient";

import { Culture, PlanProposal } from "@/interface/type";

// Importer les composants avec le chargement dynamique pour éviter les problèmes de SSR
const Plan3D =
  typeof window !== "undefined"
    ? require("next/dynamic").default(
        () => import("@/components/plans/PlanVisualizer3D"),
        {
          ssr: false,
          loading: () => (
            <div className="h-96 w-full bg-gray-100 flex items-center justify-center">
              Chargement de la vue 3D...
            </div>
          ),
        }
      )
    : () => null;

const Plan2D =
  typeof window !== "undefined"
    ? require("next/dynamic").default(
        () => import("@/components/plans/PlanVisualizer2D"),
        {
          ssr: false,
          loading: () => (
            <div className="h-64 w-full bg-gray-100 flex items-center justify-center">
              Chargement de la vue 2D...
            </div>
          ),
        }
      )
    : () => null;

// Composant enfant qui utilise useSearchParams
function PlanProfileContent() {
  const searchParams = useSearchParams();
  const idPlan = searchParams.get("id");
  const [plan, setPlan] = useState<PlanProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

  // Fonction utilitaire pour extraire les cultures distinctes des parcelles
  const getDistinctCultures = (parcelles: any[]): Culture[] => {
    const seen = new Map<number, Culture>();
    parcelles.forEach((p) => {
      if (p.culture && !seen.has(p.culture.id_culture)) {
        seen.set(p.culture.id_culture, p.culture);
      }
    });
    return Array.from(seen.values());
  };

  const cultures = plan?.parcelles ? getDistinctCultures(plan.parcelles) : [];

  useEffect(() => {
    async function fetchPlan() {
      if (!idPlan) return;
      setLoading(true);
      setError(null);
      try {
        const planData = await getPlanWithParcelles(Number(idPlan));
        console.log(planData);
        setPlan(planData);
      } catch (err: any) {
        setError("Erreur lors du chargement du plan : " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [idPlan]);

  // Rendu principal
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-green-800">
        Détail du plan optimisé
      </h1>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {plan && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{plan.nom}</h2>
            <p className="mb-2 text-gray-700">{plan.description}</p>
            <div className="text-sm text-gray-600 mb-2">
              <strong>Superficie :</strong> {plan.superficie || "N/A"} m²
              &nbsp;|
              <strong> Largeur :</strong> {plan.dimensions?.width || "N/A"} m
              &nbsp;|
              <strong> Longueur :</strong> {plan.dimensions?.height || "N/A"} m
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <strong>Profit estimé :</strong> {plan.profit_estime} FCFA &nbsp;|
              <strong>Niveau de risque :</strong> {plan.niveau_risque}/10
            </div>
          </div>
          {/* Sélecteur 2D/3D */}
          <div className="mb-8">
            <div className="flex gap-2 mb-2">
              <button
                className={`px-3 py-1 rounded font-bold border ${
                  viewMode === "3d"
                    ? "bg-green-800 text-white"
                    : "bg-white text-green-800 border-green-800"
                }`}
                onClick={() => setViewMode("3d")}
              >
                Vue 3D
              </button>
              <button
                className={`px-3 py-1 rounded font-bold border ${
                  viewMode === "2d"
                    ? "bg-green-800 text-white"
                    : "bg-white text-green-800 border-green-800"
                }`}
                onClick={() => setViewMode("2d")}
              >
                Vue 2D
              </button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              {viewMode === "3d" ? (
                <div className="h-[500px] w-full">
                  <h3 className="font-bold mb-2 text-green-700">
                    Visualisation 3D
                  </h3>
                  <Plan3D plan={plan} />
                </div>
              ) : (
                <div className="h-[500px] w-full">
                  <h3 className="font-bold mb-2 text-green-700">Vue 2D</h3>
                  <Plan2D plan={plan} />
                </div>
              )}
            </div>
          </div>{" "}
          {/* <-- fermeture correcte du div.mb-8 */}
          <div className="bg-gray-200 text-black rounded shadow p-4">
            <h3 className="font-bold mb-2">Parcelles</h3>
            {plan.parcelles && plan.parcelles.length > 0 ? (
              plan.parcelles.map((parcelle: any, idx: number) => (
                <div key={idx} className="mb-2 border-b pb-2">
                  <p>
                    <strong>Culture :</strong>{" "}
                    {parcelle.culture?.nom || parcelle.id_culture}
                  </p>
                  <p>
                    <strong>Pourcentage :</strong> {parcelle.pourcentage}%
                  </p>
                  {parcelle.grid_x !== undefined &&
                    parcelle.grid_y !== undefined && (
                      <p>
                        <strong>Position :</strong> ({parcelle.grid_x},{" "}
                        {parcelle.grid_y})
                      </p>
                    )}
                  {parcelle.forme && (
                    <p>
                      <strong>Forme :</strong> {parcelle.forme}
                    </p>
                  )}
                  {parcelle.couleur && (
                    <p>
                      <strong>Couleur :</strong>{" "}
                      <span
                        style={{ color: parcelle.couleur }}
                        className="w-2 h-2  rounded-full inline-block font-extrabold"
                      >
                        {parcelle.couleur}
                      </span>
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div>Aucune parcelle trouvée pour ce plan.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Composant wrapper avec Suspense
export default function PlanProfilePage() {
  return (
    <Suspense
      fallback={<div className="container mx-auto p-6">Chargement...</div>}
    >
      <PlanProfileContent />
    </Suspense>
  );
}
