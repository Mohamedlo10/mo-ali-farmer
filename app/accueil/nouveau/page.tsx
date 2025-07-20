"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { detectSolEtCultures } from "@/app/api/detection/query";
import {
  getZones,
  getCulturesForZone,
  generatePlans,
  savePlan,
} from "@/app/api/plans/query";
import { getSupabaseUser } from "@/lib/authMnager";
import { Sol, Culture, PlanProposal } from "@/interface/type";
import {
  ZoneSelectionStep,
  DimensionsStep,
  GeneratingStep,
  PlanSelectionStep,
  SoilResultStep,
  SoilDetectionStep,
} from "@/components/plans/StepRenderers";
import { Loader, LoaderWithText } from "@/components/ui/loader";

// Steps for plan creation
const STEPS = {
  SOIL_DETECTION: 0,
  ZONE_SELECTION: 1,
  DIMENSIONS: 2,
  GENERATING: 3,
  PLAN_SELECTION: 4,
  SOIL_RESULT: 5,
};

// Type for zone data
type Zone = {
  id_zone: number;
  nom: string;
  continent: string;
  pays: string;
  ville: string;
};

export const dynamic = "force-dynamic";

// Composant enfant qui contient toute la logique
function NewPlanContent() {
  const router = useRouter();

  // State for tracking current step
  const [currentStep, setCurrentStep] = useState(STEPS.SOIL_DETECTION);

  // Soil detection state
  const [ph, setPh] = useState<number>(7);
  const [humidite, setHumidite] = useState<number>(50);
  const [salinite, setSalinite] = useState<number>(5);
  const [soilData, setSoilData] = useState<{
    sol: Sol | null;
    cultures: (Culture & { affinite: number })[];
  }>({
    sol: null,
    cultures: [],
  });
  const [isDetectingSoil, setIsDetectingSoil] = useState(false);
  const [isListeningForSensor, setIsListeningForSensor] = useState(false);
  const [pollingIntervalId, setPollingIntervalId] =
    useState<NodeJS.Timeout | null>(null);

  // Zone selection state
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [zoneLoading, setZoneLoading] = useState(false);
  const [isSelectingZone, setIsSelectingZone] = useState(false);

  // Dimension state
  const [superficie, setSuperficie] = useState<number>(1000);
  const [largeur, setLargeur] = useState<number>(50);
  const [longueur, setLongueur] = useState<number>(20);

  // Plan generation state
  const [generating, setGenerating] = useState(false);
  const [planProposals, setPlanProposals] = useState<PlanProposal[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [sensorData, setSensorData] = useState<{
    ph: number;
    humidite: number;
    salinite: number;
    timestamp?: number;
  } | null>(null);
  // Load zones on component mount
  useEffect(() => {
    async function loadZones() {
      try {
        setZoneLoading(true);
        const zonesData = await getZones();
        setZones(zonesData);
      } catch (error) {
        console.error("Erreur lors du chargement des zones:", error);
      } finally {
        setZoneLoading(false);
      }
    }

    loadZones();

    // Cleanup polling on component unmount
    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
    };
  }, [pollingIntervalId]);

  // Handle soil detection submission
  const handleSoilDetection = async () => {
    try {
      setIsDetectingSoil(true);
      const result = await detectSolEtCultures({ ph, humidite, salinite });
      setSoilData(result);
      setCurrentStep(STEPS.SOIL_RESULT);
    } catch (error) {
      console.error("Erreur lors de la détection du sol:", error);
      alert(
        "Une erreur est survenue lors de la détection du sol. Veuillez réessayer."
      );
    } finally {
      setIsDetectingSoil(false);
    }
  };

  // Handle sensor detection polling
  const handleSensorDetection = () => {
    if (isListeningForSensor) {
      // Stop polling if already listening
      if (pollingIntervalId) clearInterval(pollingIntervalId);
      setIsListeningForSensor(false);
      setPollingIntervalId(null);
    } else {
      // Start polling
      setIsListeningForSensor(true);
      const intervalId = setInterval(async () => {
         try {
                  const response = await fetch("/api/sols/sensor");
                  if (response.ok) {
                    const data = await response.json();
                    console.log("Données reçues du capteur:", data);
        
                    // Vérifier si la réponse contient les données du capteur
                    if (data && (data.sol || data.ph !== undefined)) {
                      // Si la réponse contient à la fois les résultats et les données du capteur
                      if (data.sensorData) {
                        console.log("Données complètes reçues:", data);
                        
                        // Extraire les données du capteur de la réponse
                        const { sensorData: sensorDataFromApi, ...soilResult } = data;
                        
                        // Stocker les données brutes du capteur
                        console.log("Données du capteur:", sensorDataFromApi);
                        setSensorData({
                          ph: sensorDataFromApi.ph,
                          humidite: sensorDataFromApi.humidite,
                          salinite: sensorDataFromApi.salinite,
                          timestamp: sensorDataFromApi.timestamp || Date.now()
                        });
                        
                        // Mettre à jour les contrôles avec les données du capteur
                        setPh(sensorDataFromApi.ph);
                        setHumidite(sensorDataFromApi.humidite);
                        setSalinite(sensorDataFromApi.salinite);
                        
                        // Mettre à jour les données du sol
                        console.log("Résultats de détection:", soilResult);
                        setSoilData(soilResult);
                        
                        // Arrêter le polling et passer à l'étape des résultats
                        if (pollingIntervalId) clearInterval(pollingIntervalId);
                        setIsListeningForSensor(false);
                        setPollingIntervalId(null);
                        setCurrentStep(STEPS.SOIL_RESULT);
                      }
                      // Ancien format de réponse (sol direct)
                      else if (data.sol) {
                        console.log("Ancien format de données (sol):", data);
                        
                        // Mettre à jour les valeurs avec les données du capteur
                        if (data.sol.ph !== undefined) setPh(data.sol.ph);
                        if (data.sol.humidite !== undefined) setHumidite(data.sol.humidite);
                        if (data.sol.salinite !== undefined) setSalinite(data.sol.salinite);
        
                        setSoilData(data);
                        
                        // Arrêter le polling
                        if (pollingIntervalId) clearInterval(pollingIntervalId);
                        setIsListeningForSensor(false);
                        setPollingIntervalId(null);
                        setCurrentStep(STEPS.SOIL_RESULT);
                      }
                      // Format avec données brutes
                      else if (data.ph !== undefined) {
                        console.log("Données brutes reçues:", data);
                        
                        // Stocker les données brutes du capteur
                        const sensorDataToStore = {
                          ph: data.ph,
                          humidite: data.humidite,
                          salinite: data.salinite,
                          timestamp: data.timestamp || Date.now(),
                        };
                        
                        console.log("Stockage des données du capteur:", sensorDataToStore);
                        setSensorData(sensorDataToStore);
                        
                        // Mettre à jour les contrôles avec les données du capteur
                        setPh(data.ph);
                        setHumidite(data.humidite);
                        setSalinite(data.salinite);
                        
                        // Traiter les données pour obtenir le sol et les cultures
                        try {
                          const result = await detectSolEtCultures({
                            ph: data.ph,
                            humidite: data.humidite,
                            salinite: data.salinite,
                          });
                          
                          // Mettre à jour les données du sol
                          setSoilData(result);
                          
                          // Arrêter le polling et passer à l'étape des résultats
                          if (pollingIntervalId) clearInterval(pollingIntervalId);
                          setIsListeningForSensor(false);
                          setPollingIntervalId(null);
                        } catch (error) {
                          console.error(
                            "Erreur lors du traitement des données du capteur:",
                            error
                          );
                        }
                      }
                    }
                  }
        } catch (error) {
          console.error("Erreur lors du polling du capteur:", error);
        }
      }, 8000); // Poll every 8 seconds
      setPollingIntervalId(intervalId);
    }
  };

  // Handle zone selection
  const handleZoneSelection = (zone: Zone) => {
    setIsSelectingZone(true);
    setTimeout(() => {
      setSelectedZone(zone);
      setCurrentStep(STEPS.DIMENSIONS);
      setIsSelectingZone(false);
    }, 500); // Un petit délai pour montrer l'animation du loader
  };

  // Handle dimensions submission
  const handleDimensionsSubmit = async () => {
    if (!soilData.sol || !selectedZone) return;

    try {
      setCurrentStep(STEPS.GENERATING);
      setGenerating(true);
      setGenerationError(null);

      // Récupérer les cultures avec leur prix pour la zone sélectionnée
      const culturesWithPrices = await getCulturesForZone(selectedZone.id_zone);

      // Fusionner les cultures avec leur affinité avec les données de prix
      const enrichedCultures = soilData.cultures.map((culture) => {
        const marketData = culturesWithPrices.find(
          (c) => c.id_culture === culture.id_culture
        );
        return {
          ...culture,
          prix_moyen: marketData?.prix_moyen || null,
          saison: marketData?.saison || null,
          niveau_demande: marketData?.niveau_demande || null,
        };
      });

      // Appel à l'API pour générer les plans optimisés via la fonction query
      const data = await generatePlans({
        sol: soilData.sol,
        cultures: enrichedCultures,
        zone: selectedZone,
        superficie,
        largeur,
        longueur,
      });

      setPlanProposals(data.plans);
      setCurrentStep(STEPS.PLAN_SELECTION);
    } catch (error) {
      console.error("Erreur lors de la génération des plans:", error);
      setGenerationError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
      alert(
        "Une erreur est survenue lors de la génération des plans. Veuillez réessayer."
      );
      setCurrentStep(STEPS.DIMENSIONS);
    } finally {
      setGenerating(false);
    }
  };

  // Handle plan selection and saving
  const handlePlanSelection = async (selectedPlan: PlanProposal) => {
    try {
      setGenerating(true);

      // Enrichir le plan sélectionné avec les dimensions
      const enrichedPlan = {
        ...selectedPlan,
        superficie,
        largeur,
        longueur,
      };

      // Appel à l'API pour sauvegarder le plan via la fonction query
      const data = await savePlan({
        nom: `Plan de ${
          selectedPlan.nom || "culture"
        } - ${new Date().toLocaleDateString()}`,
        description: selectedPlan.description || "",
        analyses: selectedPlan.analyses || "",
        profit_estime: selectedPlan.profit_estime || 0,
        niveau_risque: selectedPlan.niveau_risque || 0,
        largeur: largeur,
        longueur: longueur,
        superficie: superficie,
        zoneId: selectedZone?.id_zone || 0,
        parcelles: selectedPlan.parcelles.map((parcelle) => ({
          id_culture: parcelle.id_culture,
          pourcentage: parcelle.pourcentage,
          couleur:
            parcelle.proprietes?.couleur ||
            parcelle.culture?.couleur ||
            "#4CAF50",
          forme: parcelle.proprietes?.forme || "rectangle",
          grid_x: parcelle.proprietes?.grid_x ?? 0,
          grid_y: parcelle.proprietes?.grid_y ?? 0,
          width: parcelle.proprietes?.width ?? 1,
          height: parcelle.proprietes?.height ?? 1,
        })),
      });

      alert("Plan sauvegardé avec succès!");
      // Rediriger vers la page de détail du plan nouvellement créé
      router.push(`/accueil/profile?id=${data.id_plan}`);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du plan:", error);
      alert(
        "Une erreur est survenue lors de la sauvegarde du plan. Veuillez réessayer."
      );
    } finally {
      setGenerating(false);
    }
  };

  // Render based on current step
  const renderStep = () => {
    switch (currentStep) {
      case STEPS.SOIL_DETECTION:
        return (
          <SoilDetectionStep
            ph={ph}
            setPh={setPh}
            humidite={humidite}
            setHumidite={setHumidite}
            salinite={salinite}
            setSalinite={setSalinite}
            isListeningForSensor={isListeningForSensor}
            isDetectingSoil={isDetectingSoil}
            onSensorDetection={handleSensorDetection}
            onSoilDetection={handleSoilDetection}
          />
        );
      case STEPS.SOIL_RESULT:
        return soilData.sol ? (
          <SoilResultStep
            soilData={soilData}
            sensorData={sensorData}
            onContinue={() => setCurrentStep(STEPS.ZONE_SELECTION + 0.5)}
            onBack={() => setCurrentStep(STEPS.SOIL_DETECTION)}
          />
        ) : null;
      case STEPS.ZONE_SELECTION + 0.5: // Intermediate step after soil result
        return (
          <div>
            {isSelectingZone ? (
              <div className="py-10">
                <LoaderWithText text="Chargement des données de la zone..." />
              </div>
            ) : (
              <ZoneSelectionStep
                zones={zones}
                loading={zoneLoading}
                onSelect={handleZoneSelection}
                onBack={() => setCurrentStep(STEPS.SOIL_RESULT)}
              />
            )}
          </div>
        );
      case STEPS.DIMENSIONS:
        return (
          <DimensionsStep
            superficie={superficie}
            setSuperficie={setSuperficie}
            largeur={largeur}
            setLargeur={setLargeur}
            longueur={longueur}
            setLongueur={setLongueur}
            onSubmit={handleDimensionsSubmit}
            onBack={() => setCurrentStep(STEPS.ZONE_SELECTION + 0.5)}
          />
        );
      case STEPS.GENERATING:
        return (
          <div className="py-10 flex flex-col items-center justify-center space-y-6">
            <LoaderWithText
              text="Génération des plans d'optimisation en cours..."
              size="large"
            />
            <p className="text-sm text-red-600 mt-4">
              Cette opération peut prendre quelques minutes. Veuillez patienter.
            </p>
          </div>
        );
      case STEPS.PLAN_SELECTION:
        return (
          <PlanSelectionStep
            planProposals={planProposals}
            selectedSol={soilData.sol}
            selectedZone={selectedZone}
            cultures={soilData.cultures}
            onSelect={handlePlanSelection}
            onBack={() => setCurrentStep(STEPS.DIMENSIONS)}
            isLoading={generating}
          />
        );
      default:
        return <div>Étape non reconnue</div>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          Créer un nouveau plan d'optimisation
        </h1>
        <p className="text-gray-600">
          Suivez les étapes pour créer un plan d'optimisation personnalisé
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">{renderStep()}</div>
    </div>
  );
}

// Composant wrapper avec Suspense
export default function NewPlanPage() {
  return (
    <Suspense
      fallback={<div className="container mx-auto p-6">Chargement...</div>}
    >
      <NewPlanContent />
    </Suspense>
  );
}
