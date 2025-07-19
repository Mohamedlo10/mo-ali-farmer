import { Culture, Sol, CultureSol } from "@/interface/type";
import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

// Récupère les sols compatibles pour une culture donnée
export async function getSolsByCultureId(id_culture: number | string): Promise<Sol[]> {
  const { data, error } = await supabase
    .from("culture_sol")
    .select("sols:sols(*)")
    .eq("id_culture", id_culture);
  if (error) throw error;
  // data est un tableau d'objets { sols: { ... } }
  return (data || []).map((item: any) => item.sols).filter(Boolean);
}

export async function getSols(): Promise<Sol[]> {
  const { data, error } = await supabase.from("sols").select("*");
  if (error) throw error;
  return data as Sol[];
}
