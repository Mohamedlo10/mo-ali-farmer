"use client";
import { useEffect, useState } from "react";
import { detectSolEtCultures } from "@/app/api/detection/query";
import type { Sol, Culture } from "@/interface/type";
import { getMarches } from "../api/marches/query";

import { getCultures } from "@/app/api/cultures/query";
import { getSols } from "@/app/api/sols/query";
import type { MarcheItem } from "@/interface/type";

export default function MarchePage() {
  const [marches, setMarches] = useState<MarcheItem[]>([]);
  const [cultures, setCultures] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [filters, setFilters] = useState({ id_zone: '', id_culture: '', saison: '', search: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Récupère les cultures pour le filtre
    getCultures().then(setCultures);
    // Récupère toutes les entrées du marché pour extraire les zones uniques
    getMarches().then(data => {
      const uniqueZones = Array.from(new Set(data.map(item => JSON.stringify({ id_zone: item.id_zone, nom_zone: item.nom_zone }))))
        .map(z => JSON.parse(z as string));
      setZones(uniqueZones);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getMarches({
      id_zone: filters.id_zone ? Number(filters.id_zone) : undefined,
      id_culture: filters.id_culture ? Number(filters.id_culture) : undefined,
      saison: filters.saison || undefined,
      search: filters.search || undefined,
    })
      .then(setMarches)
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-black font-bold mb-4">Marché des produits agricoles prevision 2025</h1>
      <div className="flex flex-col sm:flex-row text-black flex-wrap gap-2 sm:gap-4 mb-6 w-full">
        <select value={filters.id_zone} onChange={e => setFilters(f => ({ ...f, id_zone: e.target.value }))} className="border p-2 rounded w-full sm:w-auto">
          <option value="">Toutes les zones</option>
          {zones.map(z => (
            <option key={z.id_zone} value={z.id_zone}>{z.nom_zone}</option>
          ))}
        </select>
        <select value={filters.id_culture} onChange={e => setFilters(f => ({ ...f, id_culture: e.target.value }))} className="border p-2 rounded w-full sm:w-auto">
          <option value="">Toutes les cultures</option>
          {cultures.map(c => (
            <option key={c.id_culture} value={c.id_culture}>{c.nom}</option>
          ))}
        </select>
        <input type="text" placeholder="Saison" value={filters.saison} onChange={e => setFilters(f => ({ ...f, saison: e.target.value }))} className="border p-2 rounded w-full sm:w-auto" />
        <input type="text" placeholder="Recherche..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="border p-2 rounded flex-1 min-w-0" />
      </div>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marches.map(item => (
            <div key={item.id_zone + '-' + item.id_culture} className="border rounded p-4 shadow text-green-800 bg-white">
              <div className="font-bold text-lg">{item.nom_culture}</div>
              <div className="text-gray-600">{item.type_culture}</div>
              <div className="mt-2">Zone: <span className="font-semibold">{item.nom_zone}</span> ({item.nom_ville}, {item.nom_pays})</div>
              <div>Prix moyen: <span className="font-semibold">{item.prix_moyen ? item.prix_moyen + ' FCFA' : 'N/A'}</span></div>
              <div>Saison: {item.saison || 'N/A'}</div>
              <div>Niveau de demande: {item.niveau_demande || 'N/A'}</div>
            </div>
          ))}
          {marches.length === 0 && <div className="col-span-full text-center text-gray-500">Aucun produit trouvé.</div>}
        </div>
      )}
    </div>
  );
}