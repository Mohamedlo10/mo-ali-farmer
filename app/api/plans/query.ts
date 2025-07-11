import { createClient } from "@/lib/supabaseClient";
import { PlanProposal, Sol, Culture } from "@/interface/type";

const supabase = createClient();

// URL de base pour les appels API
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Récupérer toutes les zones disponibles
export async function getZones() {
  const { data, error } = await supabase
    .from("zones")
    .select("*");
  
  if (error) throw error;
  return data || [];
}

// Récupérer les cultures avec leur prix pour une zone spécifique
export async function getCulturesForZone(id_zone: number) {
  const { data, error } = await supabase
    .from("culture_marches")
    .select(`
      id_zone, 
      id_culture, 
      prix_moyen, 
      saison,
      niveau_demande,
      cultures (
        id_culture, 
        nom, 
        nom_scientifique, 
        type_culture, 
        saison_plantation, 
        besoin_eau,
        resistance_secheresse,
        temperature_min,
        temperature_max,
        temps_maturation,
        rendement_moyen,
        description
      )
    `)
    .eq("id_zone", id_zone);
  
  if (error) throw error;
  
  // Transformer les données pour les rendre plus faciles à utiliser
  return (data || []).map(item => ({
    id_culture: item.id_culture,
    id_zone: item.id_zone,
    prix_moyen: item.prix_moyen,
    saison: item.saison,
    niveau_demande: item.niveau_demande,
    ...item.cultures
  }));
}

// Récupérer les plans existants
export async function getPlans() {
  const { data, error } = await supabase
    .from("plan_optimisation")
    .select("*")
    .order("id_plan", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Récupérer un plan avec ses parcelles
export async function getPlanWithParcelles(id_plan: number) {
  // Récupérer les détails du plan
  const { data: plan, error: planError } = await supabase
    .from("plan_optimisation")
    .select("*")
    .eq("id_plan", id_plan)
    .single();
  
  if (planError) throw planError;
  
  // Récupérer les parcelles associées
  const { data: parcelles, error: parcellesError } = await supabase
    .from("parcelles")
    .select(`
      *,
      culture: cultures(id_culture, nom, type_culture)
    `)
    .eq("id_plan", id_plan);
  
  if (parcellesError) throw parcellesError;
  
  return {
    plan,
    parcelles: parcelles || []
  };
}

// Générer des plans optimisés via l'API DeepSeek
export async function generatePlans({
  sol,
  cultures,
  zone,
  superficie,
  largeur,
  longueur
}: {
  sol: Sol,
  cultures: (Culture & { prix_moyen: number | null, saison: string | null, niveau_demande: string | null })[],
  zone: { id_zone: number, nom: string },
  superficie: number,
  largeur: number,
  longueur: number
}): Promise<{ plans: PlanProposal[] }> {
  try {
    // Construire le prompt pour l'IA
    const filteredCultures = cultures
      .filter(c => c.prix_moyen !== null)
      .map(c => ({
        id_culture: c.id_culture,
        nom: c.nom,
        type_culture: c.type_culture,
        besoin_eau: c.besoin_eau,
        resistance_secheresse: c.resistance_secheresse,
        temps_maturation: c.temps_maturation,
        rendement_moyen: c.rendement_moyen,
        prix_moyen: c.prix_moyen,
        niveau_demande: c.niveau_demande
      }));

    const prompt = `
    Tu es un expert en agronomie et en planification agricole optimale utilisant des algorithmes avancés comme le simplex, l'optimisation multi-objectifs et l'analyse de risques. Génère 3 plans d'optimisation des cultures différents pour un terrain agricole avec les caractéristiques suivantes :
    
    SOL:
    - Type: ${sol.nom}
    - pH: ${sol.ph}
    - Humidité: ${sol.humidite}%
    - Salinité: ${sol.salinite}‰
    
    ZONE:
    - Nom: ${zone.nom}
    
    DIMENSIONS:
    - Superficie totale: ${superficie} m²
    - Largeur: ${largeur} m
    - Longueur: ${longueur} m
    
    CULTURES POSSIBLES (par ordre d'affinité avec le sol):
    ${JSON.stringify(filteredCultures, null, 2)}
    
    Pour chaque plan, fournis les informations suivantes dans ce format JSON UNIQUEMENT :
    
    {
      "plans": [
        {
          "nom_plan": string,
          "description": string, // Une description détaillée du plan
          "analyse": {
            "avantages": [string, string, string], // Liste des avantages/bénéfices avec justification
            "inconvenients": [string, string, string], // Liste des risques/inconvénients avec justification
            "methode_optimisation": string, // L'algorithme utilisé (simplex, programmation dynamique, etc.)
            "facteurs_decision": [string] // Facteurs pris en compte dans la décision
          },
          "parcelles": [
            {
              "id_culture": number,
              "pourcentage": number, // Pourcentage de la superficie totale
              "couleur": string, // Format hexadécimal pour l'affichage
              "position_x": number, // Position relative en %
              "position_y": number, // Position relative en %
              "forme": string // rectangle, cercle, etc.
            }
          ],
          "profit_estime": number,
          "niveau_risque": number
        }
      ]
    }
    
    Assure-toi que chaque plan ait une répartition différente des cultures et des stratégies variées (diversité vs monoculture, risque vs rendement, etc.).
    
    Pour l'analyse :
    1. Utilise l'algorithme du simplex ou d'autres algorithmes d'optimisation pour déterminer les allocations optimales
    2. Explique pourquoi certaines cultures sont privilégiées (rendement, résistance, prix du marché, etc.)
    3. Détaille les facteurs de risques (météo, marché, maladies) et les stratégies pour les atténuer
    4. Justifie le niveau de risque attribué avec des données concrètes
    
    Les parcelles doivent avoir une représentation visuelle cohérente avec des couleurs significatives pour chaque culture.
    `;

    const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      throw new Error("Clé API OpenRouter manquante");
    }

    // Appel à l'API DeepSeek via OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
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
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur OpenRouter:", errorData);
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      // Essayer de parser le JSON
      const jsonData = JSON.parse(content);
      return jsonData;
    } catch (jsonError) {
      console.error("Erreur de parsing JSON:", jsonError);
      // Si l'IA n'a pas renvoyé un JSON valide, essayer d'extraire le JSON du texte
      const jsonMatch = content.match(/\{[\s\S]*\}/m);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          return extractedJson;
        } catch (extractError) {
          throw new Error("Impossible de parser la réponse de l'IA");
        }
      } else {
        throw new Error("La réponse de l'IA ne contient pas de JSON valide");
      }
    }
  } catch (error) {
    console.error('Erreur lors de la génération des plans:', error);
    throw error;
  }
}

// Sauvegarder un plan sélectionné
export async function savePlan({
  plan,
  parcelles,
  id_zone,
}: {
  plan: PlanProposal,
  id_zone: number,
  parcelles: any[]
}) {
  try {
    const supabase = createClient();

    // Préparer les données du plan à insérer
    const insertPlanData = {
      nom: plan.nom_plan || `Plan ${new Date().toLocaleDateString()}`,
      superficie: plan.superficie,
      longueur: plan.longueur,
      largeur: plan.largeur,
      profit_estime: plan.profit_estime,
      niveau_risque: plan.niveau_risque,
    };

    // Insérer le plan dans la base de données
    const { data: planData, error: planError } = await supabase
      .from('plan_optimisation')
      .insert(insertPlanData)
      .select()
      .single();

    if (planError) {
      throw new Error(`Erreur lors de l'insertion du plan: ${planError.message}`);
    }

    if (!planData) {
      throw new Error("Aucune donnée de plan retournée après l'insertion");
    }

    // Utiliser les parcelles passées en paramètre
    const parcellesToInsert = parcelles.map(parcelle => ({
      id_plan: planData.id_plan,
      id_culture: parcelle.id_culture,
      pourcentage: parcelle.pourcentage,
      position_x: parcelle.position_x,
      position_y: parcelle.position_y,
      forme: parcelle.forme || 'rectangle',
      couleur: parcelle.couleur,
      id_zone: id_zone,
    }));

    const { error: parcellesError } = await supabase
      .from('parcelles')
      .insert(parcellesToInsert);

    if (parcellesError) {
      throw new Error(`Erreur lors de l'insertion des parcelles: ${parcellesError.message}`);
    }

    return { plan: planData };
  } catch (error: any) {
    console.error("Erreur lors de la sauvegarde du plan:", error);
    throw error;
  }
}

/**
 * Récupère un plan par son ID avec ses parcelles et les cultures associées
 */
export async function getPlanById(id_plan: string) {
  try {
    const supabase = createClient();
    
    // Récupérer le plan
    const { data: plan, error: planError } = await supabase
      .from('plan_optimisation')
      .select('*')
      .eq('id_plan', id_plan)
      .single();
      
    if (planError) throw new Error(`Erreur lors du chargement du plan: ${planError.message}`);
    if (!plan) throw new Error("Plan non trouvé");
    
    // Récupérer les parcelles associées au plan
    const { data: parcelles, error: parcellesError } = await supabase
      .from('parcelles')
      .select('*')
      .eq('id_plan', id_plan);
      
    if (parcellesError) throw new Error(`Erreur lors du chargement des parcelles: ${parcellesError.message}`);
    
    // Récupérer toutes les cultures pour avoir leurs détails
    const { data: cultures, error: culturesError } = await supabase
      .from('cultures')
      .select('*');
      
    if (culturesError) throw new Error(`Erreur lors du chargement des cultures: ${culturesError.message}`);
    
    return {
      plan,
      parcelles: parcelles || [],
      cultures: cultures || []
    };
  } catch (error: any) {
    console.error("Erreur lors de la récupération du plan:", error);
    throw error;
  }
}
