import { Culture, Sol, CultureSol } from "@/interface/type";
import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

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
