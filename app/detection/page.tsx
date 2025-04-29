"use client";
import { useState } from "react";
import { detectSolEtCultures } from "@/app/api/detection/query";
import type { Sol, Culture } from "@/interface/type";

export default function DetectionPage() {
  const [ph, setPh] = useState<number>(7);
  const [humidite, setHumidite] = useState<number>(50);
  const [salinite, setSalinite] = useState<number>(0);
  const [result, setResult] = useState<{ sol: Sol | null; cultures: (Culture & { affinite: number })[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await detectSolEtCultures({ ph: Number(ph), humidite: Number(humidite), salinite: Number(salinite) });
      setResult(res);
    } catch (err: any) {
      setError("Erreur lors de la détection. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-emerald-800 text-center">Détection du sol et des cultures adaptées</h1>
      {!result ? (
        <form className="space-y-6 bg-white rounded-xl shadow p-6" onSubmit={handleSubmit}>
          <div>
            <label className="block font-semibold text-emerald-700 mb-1">pH du sol</label>
            <input
              type="number"
              step="0.01"
              min={0}
              max={14}
              value={ph}
              onChange={e => setPh(Number(e.target.value))}
              className="w-full text-black border border-emerald-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-emerald-700 mb-1">Humidité (%)</label>
            <input
              type="number"
              step="0.01"
              min={0}
              max={100}
              value={humidite}
              onChange={e => setHumidite(Number(e.target.value))}
              className="w-full text-black border border-emerald-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-emerald-700 mb-1">Salinité (g/L)</label>
            <input
              type="number"
              step="0.01"
              min={0}
              value={salinite}
              onChange={e => setSalinite(Number(e.target.value))}
              className="w-full text-black border border-emerald-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-semibold py-2 rounded hover:bg-emerald-700 transition"
            disabled={loading}
          >
            {loading ? "Détection en cours..." : "Détecter"}
          </button>
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
      ) : (
        <div className="bg-white rounded-xl shadow p-6">
          {result.sol ? (
            <>
              <h2 className="text-xl font-bold mb-2 text-emerald-700 text-center">Sol détecté</h2>
              <div className="mb-4 text-center text-gray-800">
                <div className="font-semibold">{result.sol.nom}</div>
                <div>pH : <span className="font-semibold">{result.sol.ph}</span></div>
                <div>Humidité : <span className="font-semibold">{result.sol.humidite}</span></div>
                <div>Salinité : <span className="font-semibold">{result.sol.salinite}</span></div>
                <div>Texture : <span className="font-semibold">{result.sol.texture}</span></div>
                {result.sol.description && <div>Description : {result.sol.description}</div>}
              </div>
              <h3 className="text-lg font-semibold mb-2 mt-4 text-black text-center">Cultures adaptées</h3>
              {result.cultures.length === 0 ? (
                <div className="text-center text-gray-500">Aucune culture associée à ce sol.</div>
              ) : (
                <ul className="space-y-4">
                  {result.cultures.map((culture) => (
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
            </>
          ) : (
            <div className="text-center text-gray-500">Aucun sol correspondant trouvé.</div>
          )}
          <button
            className="w-full mt-6 bg-emerald-600 text-white font-semibold py-2 rounded hover:bg-emerald-700 transition"
            onClick={handleRetry}
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
}