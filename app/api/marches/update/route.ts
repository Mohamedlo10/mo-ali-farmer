import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  // Vérifier la dernière mise à jour
  const { data: lastMaj, error } = await supabase
    .from("maj_marches")
    .select("*")
    .order("date_maj", { ascending: false })
    .limit(1)
    .single();

  const now = new Date();
  if (lastMaj && lastMaj.date_maj) {
    const last = new Date(lastMaj.date_maj);
    const diffMois = now.getMonth() - last.getMonth() + 12 * (now.getFullYear() - last.getFullYear());
    if (diffMois < 1) {
      return NextResponse.json({ error: "Mise à jour déjà effectuée ce mois-ci." }, { status: 400 });
    }
  }

  // Récupérer toutes les cultures et zones
  const { data: cultures, error: errCult } = await supabase.from("cultures").select("*");
  const { data: zones, error: errZones } = await supabase.from("zones").select("*");
  if (errCult || errZones) {
    return NextResponse.json({ error: "Erreur lors de la récupération des cultures ou zones." }, { status: 500 });
  }

  // Définir un prompt explicite pour l'IA
  const prompt = `
Tu es un expert en analyse de marché agricole. Pour chaque culture parmi la liste JSON "cultures" et chaque zone parmi la liste JSON "zones", génère une combinaison culture-zone avec les champs suivants :
- id_culture
- id_zone
- prix_moyen (prix moyen du marché pour cette culture dans cette zone à la date du jour, en euros)
- saison (saison actuelle pour cette culture dans cette zone)
- niveau_demande (faible, moyen ou élevé selon la demande du marché)
IMPORTANT : Ta réponse doit être un tableau JSON à plat, strictement au format suivant :
[
  { "id_culture": ..., "id_zone": ..., "prix_moyen": ..., "saison": "...", "niveau_demande": "..." },
  ...
]
N'utilise que les cultures et zones présentes dans les tableaux fournis. Ne produis ni objets imbriqués, ni listes de noms, ni champs superflus. Ne génère aucune explication, uniquement le tableau JSON demandé. La date du jour est : ${now.toISOString()}.
`;

  // Appel réel à l'IA externe pour générer les prix
  let iaResults: any[] = [];
  try {
    const iaResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
      body: JSON.stringify({ 
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        cultures, zones, date: now.toISOString()
      }),
    });
    if (!iaResponse.ok) {
      const errText = await iaResponse.text();
      console.error("Erreur IA externe:", errText);
      return NextResponse.json({ error: "Erreur IA externe: " + errText }, { status: 500 });
    }
    // On attend une réponse JSON de la forme { result: [...] } ou directement le tableau
    const iaJson = await iaResponse.json();
    console.log("Réponse brute IA:", iaJson);
    // Robustesse    // Cherche le tableau de combinaisons dans content
    const content = iaJson;
    if (Array.isArray(content)) {
      iaResults = content;
    } else if (Array.isArray(content.result)) {
      iaResults = content.result;
    } else if (Array.isArray(content.data)) {
      iaResults = content.data;
    } else if (Array.isArray(content.combinaisons)) {
      iaResults = content.combinaisons;
    } else if (Array.isArray(content.cultures_marches)) {
      iaResults = content.cultures_marches;
    } else if (Array.isArray(content.cultures) && Array.isArray(content.zones)) {
      // Parsing IA: croise cultures et zones par nom pour générer les combinaisons
      const zoneNameToId: Record<string, number> = {};
      for (const z of zones) zoneNameToId[z.nom] = z.id_zone;
      const cultureNameToId: Record<string, number> = {};
      for (const c of cultures) cultureNameToId[c.nom] = c.id_culture;
      iaResults = [];
      for (const c of content.cultures) {
        const id_culture = c.id || cultureNameToId[c.nom];
        if (!id_culture || !Array.isArray(c.zones)) continue;
        for (const nom_zone of c.zones) {
          const id_zone = zoneNameToId[nom_zone];
          if (!id_zone) continue;
          iaResults.push({
            id_culture,
            id_zone,
            prix_moyen: c.prix_moyen || Math.floor(Math.random() * 1000) + 100,
            saison: c.saison || "printemps",
            niveau_demande: c.niveau_demande || "moyen"
          });
        }
      }
    } else {
      throw new Error("Réponse IA non comprise : " + JSON.stringify(content));
    }
    console.log("Réponse IA reçue:", iaResults);
    if (!Array.isArray(iaResults) || iaResults.length === 0) {
      throw new Error("Aucune donnée générée par l'IA");
    }
  } catch (err: any) {
    console.error("Erreur lors de l'appel à l'IA externe:", err);
    return NextResponse.json({ error: "Erreur lors de l'appel à l'IA externe: " + (err?.message || err) }, { status: 500 });
  }

  // Filtre et validation des combinaisons
  const validResults = iaResults.filter((item: any) => {
    return (
      item.id_culture &&
      item.id_zone &&
      typeof item.prix_moyen === "number" &&
      item.saison &&
      ["faible", "moyen", "élevé"].includes(item.niveau_demande)
    );
  });

  if (validResults.length === 0) {
    return NextResponse.json({ error: "Aucune combinaison exploitable trouvée dans la réponse IA." }, { status: 400 });
  }

  // Insérer les combinaisons générées dans culture_marches (upsert)
  const { error: insertError } = await supabase.from("culture_marches").upsert(
    validResults.map((item: any) => ({
      id_culture: item.id_culture,
      id_zone: item.id_zone,
      prix_moyen: item.prix_moyen,
      saison: item.saison,
      niveau_demande: item.niveau_demande,
      startDate: now.toISOString(),
      endDate: now.toISOString(),
    })),
    { onConflict: "id_zone,id_culture" }
  );
  if (insertError) {
    console.error("Erreur insertion Supabase:", insertError);
    return NextResponse.json({ error: "Erreur lors de l'insertion des données marché." }, { status: 500 });
  }

  // Enregistrer la date de mise à jour
  await supabase.from("maj_marches").insert({ date_maj: now.toISOString() });

  return NextResponse.json({
    success: true,
    nbInserted: iaResults.length,
    message: `Mise à jour effectuée avec succès (${iaResults.length} combinaisons).`,
  });

  // TODO: Appel à l’IA externe pour ajouter les nouvelles données
  // await fetch("https://ton-api-ia-externe", { ... });

  // Enregistrer la date de mise à jour
  await supabase.from("maj_marches").insert({ date_maj: now.toISOString() });

  return NextResponse.json({ success: true });
}
