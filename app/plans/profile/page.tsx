"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPlanWithParcelles } from "@/app/api/plans/query";

export default function PlanProfilePage() {
  const searchParams = useSearchParams();
  const idPlan = searchParams.get("id");
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      if (!idPlan) return;
      setLoading(true);
      setError(null);
      try {
        const planData = await getPlanWithParcelles(Number(idPlan));
        setPlan(planData);
      } catch (err: any) {
        setError("Erreur lors du chargement du plan : " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [idPlan]);

  if (!idPlan) {
    return <div className="p-4 text-red-600">Aucun identifiant de plan fourni dans l'URL.</div>;
  }

  if (loading) return <div className="p-4">Chargement du plan...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!plan) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-green-800">Détail du plan #{plan.id_plan}</h1>
      <div className="mb-4 p-4 border rounded bg-gray-50">
        <p><strong>Nom :</strong> {plan.nom}</p>
        <p><strong>Superficie :</strong> {plan.superficie} m²</p>
        <p><strong>Dimensions :</strong> {plan.longueur}m x {plan.largeur}m</p>
        <p><strong>Profit estimé :</strong> {plan.profit_estime} FCFA</p>
        <p><strong>Niveau de risque :</strong> {plan.niveau_risque}</p>
      </div>
      <h2 className="text-xl font-semibold mb-2 text-green-700">Parcelles</h2>
      <div className="space-y-3">
        {plan.parcelles && plan.parcelles.length > 0 ? (
          plan.parcelles.map((parcelle: any, idx: number) => (
            <div key={idx} className="p-3 border rounded bg-white">
              <p><strong>Culture :</strong> {parcelle.culture?.nom || parcelle.id_culture}</p>
              <p><strong>Pourcentage :</strong> {parcelle.pourcentage}%</p>
              <p><strong>Position :</strong> ({parcelle.position_x}, {parcelle.position_y})</p>
              <p><strong>Forme :</strong> {parcelle.forme}</p>
              <p><strong>Couleur :</strong> <span style={{ color: parcelle.couleur }}>{parcelle.couleur}</span></p>
            </div>
          ))
        ) : (
          <div>Aucune parcelle trouvée pour ce plan.</div>
        )}
      </div>
    </div>
  );
}
