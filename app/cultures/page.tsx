"use client";
import { useEffect, useState } from "react";
import { getSols } from "@/app/api/sols/query";
import { getCulturesByIdSol } from "@/app/api/cultures/query";
import type { Sol, Culture } from "@/interface/type";

export default function CulturesPage() {
  const [sols, setSols] = useState<Sol[]>([]);
  const [selectedSol, setSelectedSol] = useState<Sol | null>(null);
  const [cultures, setCultures] = useState<(Culture & { affinite: number; notes?: string | null })[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingCultures, setLoadingCultures] = useState(false);

  useEffect(() => {
    getSols().then(setSols);
  }, []);

  const handleSolClick = async (sol: Sol) => {
    setSelectedSol(sol);
    setDrawerOpen(true);
    setLoadingCultures(true);
    const data = await getCulturesByIdSol(sol.id_sol);
    setCultures(data);
    setLoadingCultures(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-emerald-800">Liste des sols</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-emerald-100 text-emerald-800">
              <th className="py-2 px-4">Nom</th>
              <th className="py-2 px-4">pH</th>
              <th className="py-2 px-4">Humidité</th>
              <th className="py-2 px-4">Salinité</th>
              <th className="py-2 px-4">Texture</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sols.map((sol) => (
              <tr key={sol.id_sol} className="border-b hover:bg-emerald-50 text-emerald-800 text-center cursor-pointer">
                <td className="py-2 px-4 font-semibold">{sol.nom}</td>
                <td className="py-2 px-4">{sol.ph}</td>
                <td className="py-2 px-4">{sol.humidite}</td>
                <td className="py-2 px-4">{sol.salinite}</td>
                <td className="py-2 px-4">{sol.texture}</td>
                <td className="py-2 px-4">
                  <button
                    className="bg-emerald-600 text-white px-4 py-1 rounded hover:bg-emerald-700 transition"
                    onClick={() => handleSolClick(sol)}
                  >
                    Voir cultures
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {drawerOpen && selectedSol && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white h-full shadow-2xl p-8 overflow-y-auto relative animate-slide-in-right">
            <button
              className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-emerald-700"
              onClick={() => setDrawerOpen(false)}
              aria-label="Fermer"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-2 p-4 text-center text-emerald-700">Cultures pour le sol : {selectedSol.nom}</h2>
            <div className="mb-4 text-sm text-gray-600">
              <div>pH : <span className="font-semibold text-sm">{selectedSol.ph}</span></div>
              <div>Humidité : <span className="font-semibold text-sm">{selectedSol.humidite}</span></div>
              <div>Salinité : <span className="font-semibold text-sm">{selectedSol.salinite}</span></div>
              <div>Texture : <span className="font-semibold text-sm">{selectedSol.texture}</span></div>
              {selectedSol.description && <div>Description : {selectedSol.description}</div>}
            </div>
            <h3 className="text-lg font-semibold text-black text-center mb-2 mt-4">Cultures associées</h3>
            {loadingCultures ? (
              <div className="text-center text-emerald-700">Chargement...</div>
            ) : cultures.length === 0 ? (
              <div className="text-center text-gray-8 00">Aucune culture associée à ce sol.</div>
            ) : (
              <ul className="space-y-4">
                {cultures.map((culture) => (
                  <li key={culture.id_culture} className="border-b pb-2">
                    <div className="font-bold text-emerald-800">{culture.nom}</div>
                    <div className="text-base text-gray-700">Affinité : <span className="font-semibold">{culture.affinite}</span></div>
                    {culture.nom_scientifique && <div className="text-xs md:text-sm italic text-gray-500">{culture.nom_scientifique}</div>}
                    {culture.type_culture && <div className="text-xs md:text-sm text-gray-500">Type : {culture.type_culture}</div>}
                    {culture.besoin_eau && <div className="text-xs md:text-sm text-gray-500">Besoins en eau : {culture.besoin_eau}</div>}
                    {culture.saison_plantation && <div className="text-xs md:text-sm text-gray-500">Saison : {culture.saison_plantation}</div>}
                    {culture.temperature_min !== undefined && <div className="text-xs md:text-sm text-gray-500">Temp. min : {culture.temperature_min}°C</div>}
                    {culture.temperature_max !== undefined && <div className="text-xs md:text-sm text-gray-500">Temp. max : {culture.temperature_max}°C</div>}
                    {culture.temps_maturation !== undefined && <div className="text-xs md:text-sm text-gray-500">Maturation : {culture.temps_maturation} jours</div>}
                    {culture.rendement_moyen !== undefined && <div className="text-xs md:text-sm text-gray-500">Rendement moyen : {culture.rendement_moyen}</div>}
                    {culture.description && <div className="text-xs md:text-sm text-gray-500">{culture.description}</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* Animation CSS à ajouter dans globals.css ou tailwind.config.js:
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.animate-slide-in-right {
  animation: slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1);
}
*/