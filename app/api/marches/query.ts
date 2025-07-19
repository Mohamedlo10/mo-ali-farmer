import { Culture, Sol, CultureSol } from "@/interface/type";
import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

import type { MarcheItem } from "@/interface/type";

export type MarcheFilters = {
  id_zone?: number;
  id_culture?: number;
  saison?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

export async function getMarches(filters: MarcheFilters = {}): Promise<MarcheItem[]> {
  let query = supabase
    .from("culture_marches")
    .select(`id_zone, id_culture, prix_moyen, saison, niveau_demande, startDate, endDate,
      cultures: id_culture (nom, type_culture),
      zones: id_zone (nom, pays, ville)
    `);

  if (filters.id_zone) query = query.eq("id_zone", filters.id_zone);
  if (filters.id_culture) query = query.eq("id_culture", filters.id_culture);
  if (filters.saison) query = query.ilike("saison", `%${filters.saison}%`);
  if (filters.startDate) query = query.gte("startDate", filters.startDate);
  if (filters.endDate) query = query.lte("endDate", filters.endDate);

  const { data, error } = await query;
  if (error) throw error;
  let results = (data || []).map((item: any) => ({
    id_zone: item.id_zone,
    id_culture: item.id_culture,
    prix_moyen: item.prix_moyen,
    saison: item.saison,
    niveau_demande: item.niveau_demande,
    startDate: item.startDate,
    endDate: item.endDate,
    nom_culture: item.cultures?.nom || "",
    type_culture: item.cultures?.type_culture || "",
    nom_zone: item.zones?.nom || "",
    nom_pays: item.zones?.pays || "",
    nom_ville: item.zones?.ville || ""
  })) as MarcheItem[];

  // Recherche texte (sur culture ou zone)
  if (filters.search) {
    const search = filters.search.toLowerCase();
    results = results.filter(item =>
      item.nom_culture.toLowerCase().includes(search) ||
      item.type_culture.toLowerCase().includes(search) ||
      item.nom_zone.toLowerCase().includes(search) ||
      item.nom_pays.toLowerCase().includes(search) ||
      item.nom_ville.toLowerCase().includes(search)
    );
  }

  return results;
}