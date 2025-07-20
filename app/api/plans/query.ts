import { PlanProposal, Sol, Culture, Zone, Parcelle } from "@/interface/type";
import { createClient } from "@/lib/supabaseClient";

// URL de base pour les appels API
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
// Typage des réponses API
interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

// Récupérer toutes les zones
export async function getZones(): Promise<Zone[]> {
  const { data, error } = await createClient()
    .from("zones")
    .select("*")
    .order("nom", { ascending: true });

  if (error) {
    console.error("Erreur getZones:", error);
    throw new Error("Erreur lors de la récupération des zones");
  }
  return data || [];
}

// Récupérer les cultures avec leur prix pour une zone spécifique
export async function getCulturesForZone(id_zone: number): Promise<Culture[]> {
  const { data, error } = await createClient()
    .from("culture_marches")
    .select(
      `
      prix_moyen,
      niveau_demande,
      culture:cultures(*)
    `
    )
    .eq("id_zone", id_zone);

  if (error) throw new Error(error.message);

  return data.map((item: any) => ({
    ...item.culture,
    prix_moyen: item.prix_moyen,
    niveau_demande: item.niveau_demande,
  }));
}

// Récupérer les plans existants
export async function getPlans(): Promise<PlanProposal[]> {
  const { data, error } = await createClient()
    .from("plan_optimisation")
    .select("*")
    .order("id_plan", { ascending: false });
  if (error) throw error;
  return (data || []).map(transformPlanData);
}

// Récupérer un plan complet
export async function getPlanWithParcelles(
  id_plan: number
): Promise<PlanProposal> {
  const { data, error } = await createClient()
    .from("plan_optimisation")
    .select(
      `
      *,
      parcelles:parcelles(
        *,
        culture:cultures(*),
        zone:zones(nom)
      )
    `
    )
    .eq("id_plan", id_plan)
    .single();

  if (error || !data) {
    console.error(`Erreur getPlanWithParcelles (plan ${id_plan}):`, error);
    throw new Error(`Plan ${id_plan} non trouvé`);
  }

  return transformPlanData(data);
}

// Transformer les données brutes en PlanProposal
function transformPlanData(planData: any): PlanProposal {
  return {
    id_plan: planData.id_plan,
    nom: planData.nom,
    description: planData.description || null,
    superficie: planData.superficie || 0,
    dimensions: planData.dimensions || { width: 100, height: 100, unit: "m" },
    profit_estime: planData.profit_estime || 0,
    niveau_risque: planData.niveau_risque || 0,
    date_creation: planData.date_creation,
    image_base: planData.image_base || undefined,
    analyses: planData.analyses || null,
    parcelles: (planData.parcelles || []).map(transformParcelleData),
  };
}

// Transformer les données de parcelle
function transformParcelleData(parcelle: any): Parcelle {
  return {
    id_parcelle: parcelle.id_parcelle,
    id_plan: parcelle.id_plan,
    id_zone: parcelle.id_zone,
    id_culture: parcelle.id_culture,
    pourcentage: parcelle.pourcentage,
    geometrie: validateGeometry(parcelle.geometrie),
    ...(parcelle.proprietes && typeof parcelle.proprietes === "object"
      ? parcelle.proprietes
      : {}),
    culture: {
      id_culture: parcelle.culture?.id_culture || 0,
      nom: parcelle.culture?.nom || "Inconnue",
      couleur: parcelle.culture?.couleur || "#cccccc",
      type_culture: parcelle.culture?.type_culture,
      besoin_eau: parcelle.culture?.besoin_eau,
      temperature_min: parcelle.culture?.temperature_min,
      temperature_max: parcelle.culture?.temperature_max,
    },
  };
}

// Valider la géométrie
function validateGeometry(geom: any): GeoJSON.Polygon {
  if (geom?.type === "Polygon" && Array.isArray(geom.coordinates)) {
    return geom;
  }
  // Si la géométrie n'est pas valide, retourne un polygone par défaut
  return {
    type: "Polygon",
    coordinates: [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ],
    ],
  };
}

// Générer des plans optimisés via l'API DeepSeek
export async function generatePlans({
  sol,
  cultures,
  zone,
  superficie,
  largeur,
  longueur,
}: {
  sol: Sol;
  cultures: (Culture & {
    prix_moyen: number | null;
    saison: string | null;
    niveau_demande: string | null;
  })[];
  zone: { id_zone: number; nom: string };
  superficie: number;
  largeur: number;
  longueur: number;
}): Promise<{ plans: PlanProposal[] }> {
  try {
    // Construire le prompt pour l'IA
    const filteredCultures = cultures
      .filter((c) => c.prix_moyen !== null)
      .map((c) => ({
        id_culture: c.id_culture,
        nom: c.nom,
        type_culture: c.type_culture,
        besoin_eau: c.besoin_eau,
        resistance_secheresse: c.resistance_secheresse,
        temps_maturation: c.temps_maturation,
        rendement_moyen: c.rendement_moyen,
        prix_moyen: c.prix_moyen,
        niveau_demande: c.niveau_demande,
      }));

    const prompt =
      "Tu es un expert en agronomie et en planification agricole optimale. Ta mission est de générer 3 plans d'optimisation de cultures pour un terrain agricole en respectant des contraintes strictes.\n" +
      "\nCARACTÉRISTIQUES DU TERRAIN:\n" +
      "- SOL: Type=" +
      sol.nom +
      ", pH=" +
      sol.ph +
      ", Humidité=" +
      sol.humidite +
      "%, Salinité=" +
      sol.salinite +
      "‰\n" +
      "- ZONE: " +
      zone.nom +
      "\n" +
      "- DIMENSIONS: Superficie=" +
      superficie +
      "m², Largeur=" +
      largeur +
      "m, Longueur=" +
      longueur +
      "m\n" +
      "\nCULTURES AUTORISÉES:\n" +
      "Voici la liste EXHAUSTIVE des cultures que tu dois utiliser. Tu dois OBLIGATOIREMENT utiliser uniquement les cultures dont l'id_culture figure dans la liste suivante. Toute culture non listée sera ignorée et ne doit pas apparaître dans ta réponse.\n" +
      JSON.stringify(filteredCultures, null, 2) +
      "\nFORMAT DE SORTIE ATTENDU:\n" +
      "Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans aucun texte ou commentaire en dehors. La structure doit être la suivante:\n" +
      '{\n  "plans": [\n    {\n      "nom": "Nom du plan (ex: Plan Rendement Élevé)",\n      "description": "Description détaillée du plan, sa stratégie et ses objectifs.",\n      "analyse": " explication pragmatique des avantages, inconvenients, methode_optimisation: Algorithme utilisé (ex: Simplex, Multi-Objectif), facteurs_decision",\n      "parcelles": [\n        {\n          "id_culture": 123, // Doit correspondre à un ID de la liste autorisée\n          "pourcentage": 60,\n          "couleur": "#FF5733",\n          "grid_x": 0, // Position X dans la grille (0 à largeur-1)\n          "grid_y": 0, // Position Y dans la grille (0 à longueur-1)\n          "width": 10, // Largeur de la parcelle en mètres\n          "height": 15, // Hauteur de la parcelle en mètres\n          "forme": "rectangle"\n        }\n      ],\n      "profit_estime": 50000,\n      "niveau_risque": 3\n    }\n  ]\n}\n' +
      "INSTRUCTIONS SUPPLÉMENTAIRES:\n" +
      "1. Crée 3 plans distincts avec des stratégies variées (ex: max rendement, min risque, biodiversité).\n" +
      "2. Justifie tes choix dans la section 'analyse' de chaque plan.\n" +
      "3. Pour chaque parcelle, utilise:\n" +
      "   - grid_x et grid_y: position dans la grille (0 à largeur-1 pour X, 0 à longueur-1 pour Y)\n" +
      "   - width et height: dimensions réelles de la parcelle en mètres\n" +
      "   - Assure-toi que les parcelles ne se chevauchent pas\n" +
      "   - La somme des surfaces (width × height) doit couvrir toute la superficie du terrain\n" +
      "4. Assure-toi que la somme des pourcentages des parcelles de chaque plan est égale à 100.\n" +
      "5. Attribue des couleurs vives et distinctes à chaque culture pour une meilleure visualisation.\n" +
      "6. Les coordonnées grid_x et grid_y doivent être des entiers entre 0 et les dimensions du terrain.\n";

    const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      throw new Error("Clé API OpenRouter manquante");
    }

    // Appel à l'API DeepSeek via OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + OPENROUTER_API_KEY,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur OpenRouter:", errorData);
      throw new Error(
        "Erreur API: " + response.status + " " + response.statusText
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      // Essayer de parser le JSON
      const jsonData = JSON.parse(content);
      // Filtrage des cultures non autorisées et validation des coordonnées
      const allowedIds = new Set(filteredCultures.map((c) => c.id_culture));
      if (jsonData && Array.isArray(jsonData.plans)) {
        jsonData.plans.forEach((plan: any) => {
          if (Array.isArray(plan.parcelles)) {
            plan.parcelles = plan.parcelles
              .filter((p: any) => allowedIds.has(p.id_culture))
              .map((p: any) => ({
                ...p,
                // S'assurer que les coordonnées grid sont dans les limites
                grid_x: Math.max(0, Math.min(largeur - 1, p.grid_x || 0)),
                grid_y: Math.max(0, Math.min(longueur - 1, p.grid_y || 0)),
                // S'assurer que les dimensions sont valides
                width: Math.max(1, Math.min(largeur, p.width || 1)),
                height: Math.max(1, Math.min(longueur, p.height || 1)),
              }));
          }
        });
      }
      // Transformer les plans pour correspondre au format attendu
      if (jsonData && Array.isArray(jsonData.plans)) {
        jsonData.plans = jsonData.plans.map((plan: any) => ({
          ...plan,
          // Ajouter les champs manquants requis par PlanProposal
          id_plan: 0, // Sera défini lors de la sauvegarde
          superficie: superficie,
          dimensions: {
            width: largeur,
            height: longueur,
            unit: "m",
          },
          date_creation: new Date().toISOString(),
          image_base: undefined,
          analyses: plan.analyse || null,
          // Transformer les parcelles pour correspondre au format attendu
          parcelles: (plan.parcelles || []).map((parcelle: any) => ({
            id_parcelle: `temp_${Math.random().toString(36).substr(2, 9)}`,
            id_plan: 0,
            id_zone: zone.id_zone,
            id_culture: parcelle.id_culture,
            pourcentage: parcelle.pourcentage,
            // Ajouter les propriétés dans le champ proprietes
            proprietes: {
              couleur: parcelle.couleur || "#cccccc",
              forme: parcelle.forme || "rectangle",
              grid_x: parcelle.grid_x || 0,
              grid_y: parcelle.grid_y || 0,
              width: parcelle.width || 1,
              height: parcelle.height || 1,
            },
            // Ajouter les informations de culture
            culture: {
              id_culture: parcelle.id_culture,
              nom:
                cultures.find((c) => c.id_culture === parcelle.id_culture)
                  ?.nom || "Inconnue",
              couleur: parcelle.couleur || "#cccccc",
              type_culture:
                cultures.find((c) => c.id_culture === parcelle.id_culture)
                  ?.type_culture || "Inconnue",
              besoin_eau:
                cultures.find((c) => c.id_culture === parcelle.id_culture)
                  ?.besoin_eau || null,
              temperature_min:
                cultures.find((c) => c.id_culture === parcelle.id_culture)
                  ?.temperature_min || null,
              temperature_max:
                cultures.find((c) => c.id_culture === parcelle.id_culture)
                  ?.temperature_max || null,
            },
          })),
        }));
      }

      return jsonData;
    } catch (jsonError) {
      console.error("Erreur de parsing JSON:", jsonError);
      // Si l'IA n'a pas renvoyé un JSON valide, essayer d'extraire le JSON du texte
      const jsonMatch = content.match(/\{[\s\S]*\}/m);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          // Appliquer la même transformation
          if (extractedJson && Array.isArray(extractedJson.plans)) {
            extractedJson.plans = extractedJson.plans.map((plan: any) => ({
              ...plan,
              id_plan: 0,
              superficie: superficie,
              dimensions: {
                width: largeur,
                height: longueur,
                unit: "m",
              },
              date_creation: new Date().toISOString(),
              image_base: undefined,
              analyses: plan.analyse || null,
              parcelles: (plan.parcelles || []).map((parcelle: any) => ({
                id_parcelle: `temp_${Math.random().toString(36).substr(2, 9)}`,
                id_plan: 0,
                id_zone: zone.id_zone,
                id_culture: parcelle.id_culture,
                pourcentage: parcelle.pourcentage,
                proprietes: {
                  couleur: parcelle.couleur || "#cccccc",
                  forme: parcelle.forme || "rectangle",
                  grid_x: parcelle.grid_x || 0,
                  grid_y: parcelle.grid_y || 0,
                  width: parcelle.width || 1,
                  height: parcelle.height || 1,
                },
                culture: {
                  id_culture: parcelle.id_culture,
                  nom:
                    cultures.find((c) => c.id_culture === parcelle.id_culture)
                      ?.nom || "Inconnue",
                  couleur: parcelle.couleur || "#cccccc",
                  type_culture:
                    cultures.find((c) => c.id_culture === parcelle.id_culture)
                      ?.type_culture || "Inconnue",
                  besoin_eau:
                    cultures.find((c) => c.id_culture === parcelle.id_culture)
                      ?.besoin_eau || null,
                  temperature_min:
                    cultures.find((c) => c.id_culture === parcelle.id_culture)
                      ?.temperature_min || null,
                  temperature_max:
                    cultures.find((c) => c.id_culture === parcelle.id_culture)
                      ?.temperature_max || null,
                },
              })),
            }));
          }
          return extractedJson;
        } catch (extractError) {
          throw new Error("Impossible de parser la réponse de l'IA");
        }
      } else {
        throw new Error("La réponse de l'IA ne contient pas de JSON valide");
      }
    }
  } catch (error) {
    console.error("Erreur lors de la génération des plans:", error);
    throw error;
  }
}

// Sauvegarder un plan sélectionné
export async function savePlan(planData: {
  nom: string;
  description?: string;
  analyses?: string;
  parcelles: Array<{
    id_culture: number;
    pourcentage: number;
    couleur: string;
    forme: string;
    grid_x: number;
    grid_y: number;
    width: number;
    height: number;
    geometrie?: any; // Optionnel, GeoJSON ou WKT
  }>;
  profit_estime?: number;
  niveau_risque?: number;
  zoneId: number;
  superficie?: number;
  largeur: number;
  longueur: number;
}): Promise<{ success: boolean; id_plan?: number; error?: string }> {
  const supabase = createClient();
  try {
    // 1. Préparer le champ dimensions (jsonb)
    const dimensions = {
      width: planData.largeur,
      height: planData.longueur,
      unit: "m",
    };
    // 2. Sauvegarder le plan d'optimisation
    const { data: plan, error: planError } = await supabase
      .from("plan_optimisation")
      .insert([
        {
          nom: planData.nom,
          description: planData.description || "",
          analyses: planData.analyses || "",
          date_creation: new Date().toISOString(),
          id_zone: planData.zoneId,
          superficie:
            planData.superficie || planData.largeur * planData.longueur,
          profit_estime: planData.profit_estime || 0,
          niveau_risque: planData.niveau_risque || 0,
          dimensions: dimensions,
        },
      ])
      .select("id_plan")
      .single();
    if (planError || !plan) {
      console.error("Erreur lors de la sauvegarde du plan:", planError);
      return {
        success: false,
        error: planError?.message || "Erreur lors de la sauvegarde du plan",
      };
    }
    const id_plan = plan.id_plan;
    // 3. Sauvegarder les parcelles
    const parcellesToInsert = planData.parcelles.map((parcelle) => {
      // Créer la géométrie GeoJSON si elle n'existe pas
      const geometrie = parcelle.geometrie || {
        type: "Polygon",
        coordinates: [
          [
            [parcelle.grid_x, parcelle.grid_y],
            [parcelle.grid_x + parcelle.width, parcelle.grid_y],
            [
              parcelle.grid_x + parcelle.width,
              parcelle.grid_y + parcelle.height,
            ],
            [parcelle.grid_x, parcelle.grid_y + parcelle.height],
            [parcelle.grid_x, parcelle.grid_y],
          ],
        ],
      };

      return {
        id_plan: id_plan,
        id_culture: parcelle.id_culture,
        id_zone: planData.zoneId,
        pourcentage: parcelle.pourcentage,
        proprietes: {
          couleur: parcelle.couleur,
          forme: parcelle.forme,
          grid_x: parcelle.grid_x,
          grid_y: parcelle.grid_y,
          width: parcelle.width,
          height: parcelle.height,
        },
      };
    });
    const { error: parcellesError } = await supabase
      .from("parcelles")
      .insert(parcellesToInsert);
    if (parcellesError) {
      console.error(
        "Erreur lors de la sauvegarde des parcelles:",
        parcellesError
      );
      return { success: false, error: parcellesError.message };
    }
    return { success: true, id_plan };
  } catch (error) {
    console.error("Erreur inattendue lors de la sauvegarde du plan:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inattendue est survenue",
    };
  }
}

/**
 * Récupère un plan par son ID avec ses parcelles et les cultures associées
 */
export async function getPlanById(id_plan: string): Promise<PlanProposal> {
  try {
    // Récupérer le plan avec les parcelles et les cultures associées en une seule requête
    const { data: planData, error } = await createClient()
      .from("plan_optimisation")
      .select(
        `
        *,
        parcelles:parcelles(
          *,
          culture:cultures(
            id_culture,
            nom,
            type_culture,
            description,
            duree_croissance,
            besoin_eau,
            besoin_soleil,
            couleur
          )
        )
      `
      )
      .eq("id_plan", id_plan)
      .single();
    if (error)
      throw new Error("Erreur lors du chargement du plan: " + error.message);
    if (!planData) throw new Error("Plan non trouvé");
    // Transformer les données pour correspondre à l'interface PlanProposal
    return {
      id_plan: planData.id_plan,
      nom: planData.nom,
      description: planData.description || null,
      superficie: planData.superficie || 0,
      dimensions: planData.dimensions || { width: 100, height: 100, unit: "m" },
      profit_estime: planData.profit_estime || 0,
      niveau_risque: planData.niveau_risque || 0,
      date_creation: planData.date_creation || new Date().toISOString(),
      image_base: planData.image_base || undefined,
      analyses: planData.analyses || null,
      parcelles: (planData.parcelles || []).map((p: any) => ({
        id_parcelle: p.id_parcelle,
        id_plan: p.id_plan,
        id_zone: p.id_zone,
        id_culture: p.id_culture,
        pourcentage: p.pourcentage,
        culture: {
          id_culture: p.culture?.id_culture || 0,
          nom: p.culture?.nom || "Inconnue",
          couleur: p.culture?.couleur || "#cccccc",
          type_culture: p.culture?.type_culture,
          description: p.culture?.description,
          duree_croissance: p.culture?.duree_croissance,
          besoin_eau: p.culture?.besoin_eau,
          besoin_soleil: p.culture?.besoin_soleil,
        },
      })),
    };
  } catch (error: any) {
    console.error("Erreur lors de la récupération du plan:", error);
    throw error;
  }
}
