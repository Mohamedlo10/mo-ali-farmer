import { Culture, Sol, CultureSol } from "@/interface/type";
import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

// Récupère toutes les cultures avec leur prix actuel (le plus récent dans culture_marches)
export async function getCulturesWithCurrentPrice(): Promise<(Culture & { prix_actuel: number | null })[]> {
  // On récupère toutes les cultures
  const { data: cultures, error: culturesError } = await supabase.from("cultures").select("*");
  if (culturesError) throw culturesError;
  // Pour chaque culture, on récupère le dernier prix dans culture_marches (toutes zones)
  const results: (Culture & { prix_actuel: number | null })[] = [];
  for (const culture of cultures || []) {
    const { data: prixData, error: prixError } = await supabase
      .from("culture_marches")
      .select("prix_moyen, startDate")
      .eq("id_culture", culture.id_culture)
      .order("startDate", { ascending: false })
      .limit(1)
      .maybeSingle();
    let prix_actuel = null;
    if (prixData && prixData.prix_moyen != null) {
      prix_actuel = Number(prixData.prix_moyen);
    }
    results.push({ ...culture, prix_actuel });
  }
  return results;
}

// Récupère une culture par son id et les données de graphe associées
export async function getCultureById(id: number | string): Promise<{ culture: Culture | null, chartData: { date: string, price: number }[] }> {
  // Récupération de la culture (inclut img_url)
  const { data: culture, error: cultureError } = await supabase.from("cultures").select("*").eq("id_culture", id).single();
  if (cultureError) throw cultureError;
  // Récupération des prix pour le graphe depuis culture_marches
  let chartData: { date: string, price: number }[] = [];
  const { data: marches, error: marchesError } = await supabase
    .from("culture_marches")
    .select("startDate, prix_moyen")
    .eq("id_culture", id)
    .order("startDate", { ascending: true });
  if (!marchesError && marches) {
    chartData = marches.filter((item: any) => item.startDate && item.prix_moyen !== null)
      .map((item: any) => ({ date: item.startDate, price: Number(item.prix_moyen) }));
  }
  return { culture, chartData };
}

// Récupère les données de graphe associées à une culture
export async function getStatsCultureById(id: number | string): Promise<{ chartData: { date: string, price: number }[] }> {
  // Récupération des prix pour le graphe depuis culture_marches
  let chartData: { date: string, price: number }[] = [];
  const { data: marches, error: marchesError } = await supabase
    .from("culture_marches")
    .select("startDate, prix_moyen")
    .eq("id_culture", id)
    .order("startDate", { ascending: true });
  if (!marchesError && marches) {
    chartData = marches.filter((item: any) => item.startDate && item.prix_moyen !== null)
      .map((item: any) => ({ date: item.startDate, price: Number(item.prix_moyen) }));
  }
  return { chartData };
}

export async function getCultures(): Promise<Culture[]> {
  const { data, error } = await supabase.from("cultures").select("*");
  if (error) throw error;
  return data as Culture[];
}

export async function getCultureSols(): Promise<CultureSol[]> {
  const { data, error } = await supabase.from("culture_sol").select("*");
  if (error) throw error;
  return data as CultureSol[];
}



export async function getCulturesByIdSol(id_sol: number): Promise<(Culture & { affinite: number; notes?: string | null })[]> {
  const { data, error } = await supabase
    .from("culture_sol")
    .select("affinite, notes, cultures(*)")
    .eq("id_sol", id_sol)
    .order("affinite", { ascending: false });
  if (error) throw error;
  return (data || []).map((item: any) => ({ ...item.cultures, affinite: item.affinite, notes: item.notes }));
}




export async function getCulturesByAttributSol(attributs: Partial<Sol>): Promise<(Culture & { affinite: number; notes?: string | null; id_sol: number })[]> {
  // On commence par trouver les sols correspondant aux attributs
  let query = supabase.from("sols").select("id_sol");
  Object.entries(attributs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  const { data: sols, error: solError } = await query;
  if (solError) throw solError;
  if (!sols || sols.length === 0) return [];
  const solIds = sols.map((s: any) => s.id_sol);
  // On récupère les cultures associées à ces sols
  const { data, error } = await supabase
    .from("culture_sol")
    .select("affinite, notes, id_sol, cultures(*)")
    .in("id_sol", solIds)
    .order("affinite", { ascending: false });
  if (error) throw error;
  return (data || []).map((item: any) => ({ ...item.cultures, affinite: item.affinite, notes: item.notes, id_sol: item.id_sol }));
}
