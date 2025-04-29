import { Culture, Sol, CultureSol } from "@/interface/type";
import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();



export async function getSols(): Promise<Sol[]> {
  const { data, error } = await supabase.from("sols").select("*");
  if (error) throw error;
  return data as Sol[];
}
