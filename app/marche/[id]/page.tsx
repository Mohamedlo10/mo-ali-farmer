"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCultureById } from "@/app/api/cultures/query";
import { getSolsByCultureId } from "@/app/api/sols/query";
import PriceChart from "@/components/PriceChart";

export default function CultureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [culture, setCulture] = useState<any>(null);
  const [sols, setSols] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (!id) return;
      const data = await getCultureById(id);
      setCulture(data.culture);
      setChartData(data.chartData || []);
      const solsData = await getSolsByCultureId(id);
      setSols(solsData);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center mt-8">Chargement...</div>;
  if (!culture) return <div className="text-center mt-8 text-red-500">Culture non trouvée.</div>;

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="flex flex-col items-center mb-8">
        <img
          src={culture.img_url || '/default-culture.png'}
          alt={culture.nom}
          className="w-32 h-32 rounded-full object-cover border-4 border-green-200 mb-4"
        />
        <h1 className="text-3xl font-bold text-green-800 mb-2">{culture.nom}</h1>
        {culture.nom_scientifique && <div className="italic text-gray-600 mb-2">{culture.nom_scientifique}</div>}
        <div className="text-gray-700 text-center mb-4">{culture.description}</div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-green-700 mb-2">Évolution du prix</h2>
        {chartData.length > 0 ? (
          <PriceChart title={`Prix de ${culture.nom}`} data={chartData} />
        ) : (
          <div className="text-gray-500">Aucune donnée de prix disponible.</div>
        )}
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-green-700 mb-2">Sols compatibles</h2>
        {sols.length > 0 ? (
          <ul className="list-disc ml-6">
            {sols.map((sol) => (
              <li key={sol.id_sol} className="mb-1">
                <span className="font-semibold text-emerald-800">{sol.nom}</span> — pH: {sol.ph}, humidité: {sol.humidite}, texture: {sol.texture}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">Aucun sol compatible répertorié.</div>
        )}
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-green-700 mb-2">Informations supplémentaires</h2>
        <ul className="list-disc ml-6 text-gray-700">
          {culture.type_culture && <li>Type : {culture.type_culture}</li>}
          {culture.saison_plantation && <li>Saison de plantation : {culture.saison_plantation}</li>}
          {culture.besoin_eau && <li>Besoins en eau : {culture.besoin_eau}</li>}
          {culture.temperature_min !== undefined && <li>Température min : {culture.temperature_min}°C</li>}
          {culture.temperature_max !== undefined && <li>Température max : {culture.temperature_max}°C</li>}
          {culture.temps_maturation !== undefined && <li>Temps de maturation : {culture.temps_maturation} jours</li>}
          {culture.rendement_moyen !== undefined && <li>Rendement moyen : {culture.rendement_moyen}</li>}
        </ul>
      </div>
    </div>
  );
}
