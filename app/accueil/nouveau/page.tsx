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
            if (data && data.sol) {
              setSoilData(data);
              if (pollingIntervalId) clearInterval(pollingIntervalId);
              setIsListeningForSensor(false);
              setPollingIntervalId(null);
              setCurrentStep(STEPS.SOIL_RESULT);
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
          geometrie: parcelle.geometrie, // Inclure la géométrie existante
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
          <div className="space-y-6">
            <div>
              <h2 className="text-xl text-green-800 font-semibold mb-2">
                Détection du sol
              </h2>
              <p className="text-green-800">
                Entrez les caractéristiques du sol pour déterminer les cultures
                les plus adaptées.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-red-700 text-sm font-medium mb-1">
                  pH du sol (0-14)
                </label>
                <input
                  type="range"
                  min="0"
                  max="14"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-black">
                  <span>Acide (0)</span>
                  <span className="font-medium">{ph}</span>
                  <span>Basique (14)</span>
                </div>
              </div>

              <div>
                <label className="block text-red-600 text-sm font-medium mb-1">
                  Taux d'humidité (%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={humidite}
                  onChange={(e) => setHumidite(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-black">
                  <span>Sec (0%)</span>
                  <span className="font-medium">{humidite}%</span>
                  <span>Saturé (100%)</span>
                </div>
              </div>

              <div>
                <label className="block text-red-600 text-sm font-medium mb-1">
                  Salinité (‰)
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={salinite}
                  onChange={(e) => setSalinite(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-black">
                  <span>Faible (0‰)</span>
                  <span className="font-medium">{salinite}‰</span>
                  <span>Élevée (40‰)</span>
                </div>
              </div>
            </div>

            {isListeningForSensor && (
              <div className="my-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <LoaderWithText text="En attente des données du capteur..." />
                <p className="text-sm text-yellow-700 mt-2">
                  Assurez-vous que votre capteur ESP32 est connecté et envoie
                  des données.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <button
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer font-bold h-10 md:text-base text-xs w-56 flex justify-center items-center text-white px-4 py-2 rounded disabled:bg-blue-300"
                onClick={handleSensorDetection}
                disabled={isDetectingSoil}
              >
                {isListeningForSensor ? (
                  <Loader size="small" color="text-white" />
                ) : null}
                {isListeningForSensor
                  ? "Arrêter la détection"
                  : "Détecter avec le capteur"}
              </button>
              <button
                className="bg-black hover:bg-green-700 cursor-pointer font-bold h-10 w-40 flex justify-center items-center text-white px-4 py-2 rounded disabled:bg-gray-400"
                onClick={handleSoilDetection}
                disabled={isDetectingSoil || isListeningForSensor}
              >
                {isDetectingSoil ? (
                  <Loader size="small" color="text-white" />
                ) : (
                  "Analyser le sol"
                )}
              </button>
            </div>
          </div>
        );
      case STEPS.SOIL_RESULT:
        return soilData.sol ? (
          <SoilResultStep
            soilData={soilData}
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
