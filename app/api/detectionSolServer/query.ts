import { Culture, Sol } from "@/interface/type";
import { createClientServer } from "@/lib/supabaseserver";

// Fonction de détection de sol et cultures par attributs
export async function detectSolEtCulturesServer(
  { ph, humidite, salinite }: { ph: number; humidite: number; salinite: number }
) {
  // On cherche le sol le plus proche par similarité (distance euclidienne simple)
  const { data: sols, error: solsError } = await (await createClientServer()).from("sols").select("*");
  if (solsError) throw solsError;
  if (!sols || sols.length === 0) return { sol: null, cultures: [] };

  // Calcul du sol le plus proche
  let bestSol = sols[0];
  let bestDist = Math.sqrt(
    Math.pow(sols[0].ph - ph, 2) +
    Math.pow(sols[0].humidite - humidite, 2) +
    Math.pow(sols[0].salinite - salinite, 2)
  );
  for (let i = 1; i < sols.length; i++) {
    const dist = Math.sqrt(
      Math.pow(sols[i].ph - ph, 2) +
      Math.pow(sols[i].humidite - humidite, 2) +
      Math.pow(sols[i].salinite - salinite, 2)
    );
    if (dist < bestDist) {
      bestDist = dist;
      bestSol = sols[i];
    }
  }

  // Récupérer les cultures associées à ce sol, triées par affinité décroissante
    const { data: cultures, error: culturesError } = await (await createClientServer()).from("culture_sol")
    .select("*, culture: cultures(*)")
    .eq("id_sol", bestSol.id_sol)
    .order("affinite", { ascending: false });
  if (culturesError) throw culturesError;

  // On retourne le sol trouvé et la liste des cultures avec affinité
  return {
    sol: bestSol,
    cultures: (cultures || []).map((c: any) => ({ ...c.culture, affinite: c.affinite }))
  };
}
