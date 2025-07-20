"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Sol, Culture, PlanProposal } from "@/interface/type";
import {
  MapPinIcon,
  CropIcon,
  LayoutIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  InfoIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from "lucide-react";
import { Loader, LoaderWithText } from "@/components/ui/loader";
import { Zone } from "@/interface/type";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Importer les visualiseurs de manière sécurisée pour éviter l'erreur 'window is not defined'
const Plan2D =
  typeof window !== "undefined"
    ? require("./PlanVisualizer2D").default
    : () => (
        <div className="h-64 w-full bg-gray-100 flex items-center justify-center">
          Chargement de la vue 2D...
        </div>
      );

const Plan3D =
  typeof window !== "undefined"
    ? require("./PlanVisualizer3D").default
    : () => (
        <div className="h-96 w-full bg-gray-100 flex items-center justify-center">
          Chargement de la vue 3D...
        </div>
      );

export function ZoneSelectionStep({
  zones,
  loading,
  onSelect,
  onBack,
}: {
  zones: Zone[];
  loading: boolean;
  onSelect: (zone: Zone) => void;
  onBack: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Filtrer les zones en fonction de la recherche
  const filteredZones = zones.filter((zone) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      zone.nom.toLowerCase().includes(searchLower) ||
      zone.pays.toLowerCase().includes(searchLower) ||
      zone.ville.toLowerCase().includes(searchLower)
    );
  });

  const handleZoneSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoneId = parseInt(e.target.value);
    const zone = zones.find((z) => z.id_zone === zoneId);
    if (zone) {
      setSelectedZone(zone);
    }
  };

  return (
    <div className="space-y-6 text-black">
      <div>
        <h2 className="text-xl font-semibold mb-2">Sélection de la zone</h2>
        <p className="text-green-800">
          Choisissez la zone géographique où se trouve votre terrain pour
          obtenir les prix du marché local.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              className="w-full p-2 pl-8 border rounded"
              placeholder="Rechercher une zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <div className="border rounded overflow-hidden">
            <select
              className="w-full p-3 outline-none"
              size={6}
              onChange={handleZoneSelect}
              value={selectedZone?.id_zone || ""}
            >
              <option value="" disabled>
                Sélectionnez une zone
              </option>
              {filteredZones.map((zone) => (
                <option
                  key={zone.id_zone}
                  value={zone.id_zone}
                  className="p-2 hover:bg-gray-100"
                >
                  {zone.nom} - {zone.ville}, {zone.pays}
                </option>
              ))}
            </select>
          </div>

          {selectedZone && (
            <div className="bg-primary/5 p-4 rounded border">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MapPinIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedZone.nom}</h3>
                  <p className="text-sm text-green-800">
                    {selectedZone.ville}, {selectedZone.pays}
                  </p>
                  <p className="text-xs text-green-800 mt-1">
                    Continent: {selectedZone.continent}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          className="text-white font-bold bg-black hover:bg-red-700 cursor-pointer"
          onClick={onBack}
        >
          Retour
        </Button>
        <Button
          className="text-white font-bold bg-green-800 hover:bg-green-700 cursor-pointer"
          onClick={() => selectedZone && onSelect(selectedZone)}
          disabled={!selectedZone}
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}

export function DimensionsStep({
  superficie,
  setSuperficie,
  largeur,
  setLargeur,
  longueur,
  setLongueur,
  onSubmit,
  onBack,
}: {
  superficie: number;
  setSuperficie: (value: number) => void;
  largeur: number;
  setLargeur: (value: number) => void;
  longueur: number;
  setLongueur: (value: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const handleInputChange = (
    setter: (value: number) => void,
    value: string,
    min: number
  ) => {
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      setter(Math.max(min, parsedValue));
    } else if (value === "") {
      setter(min);
    }
  };

  const handleSuperficieChange = (value: number) => {
    setSuperficie(value);
    if (largeur > 0 && longueur > 0) {
      const ratio = largeur / longueur;
      const newLargeur = Math.round(Math.sqrt(value * ratio));
      const newLongueur = Math.round(value / newLargeur);
      setLargeur(newLargeur > 0 ? newLargeur : 1);
      setLongueur(newLongueur > 0 ? newLongueur : 1);
    }
  };

  const handleLargeurChange = (value: number) => {
    setLargeur(value);
    if (superficie > 0 && value > 0) {
      setLongueur(Math.round(superficie / value));
    }
  };

  const handleLongueurChange = (value: number) => {
    setLongueur(value);
    if (superficie > 0 && value > 0) {
      setLargeur(Math.round(superficie / value));
    }
  };

  return (
    <div className="space-y-6 text-black">
      <div>
        <h2 className="text-xl font-semibold mb-2">Dimensions du terrain</h2>
        <p className="text-green-800">
          Indiquez la superficie et les dimensions de votre terrain pour générer
          des plans optimisés.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Superficie totale (m²)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="100"
              max="100000"
              value={superficie}
              onChange={(e) =>
                handleInputChange(handleSuperficieChange, e.target.value, 100)
              }
              className="w-full p-2 border rounded"
            />
            <span className="flex items-center text-sm">m²</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Largeur (m)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="1000"
                value={largeur}
                onChange={(e) =>
                  handleInputChange(handleLargeurChange, e.target.value, 1)
                }
                className="w-full p-2 border rounded"
              />
              <span className="flex items-center text-sm">m</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Longueur (m)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="1000"
                value={longueur}
                onChange={(e) =>
                  handleInputChange(handleLongueurChange, e.target.value, 1)
                }
                className="w-full p-2 border rounded"
              />
              <span className="flex items-center text-sm">m</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <div className="text-sm">
            <p className="font-medium">Aperçu du terrain</p>
            <div className="flex items-center justify-center mt-2">
              <div
                className="bg-blue-100 border border-blue-300 flex items-center justify-center"
                style={{
                  width: `${Math.min(300, largeur * 3)}px`,
                  height: `${Math.min(200, longueur * 3)}px`,
                  maxWidth: "100%",
                }}
              >
                <div className="text-xs text-blue-600">
                  {largeur}m × {longueur}m
                </div>
              </div>
            </div>
            <p className="text-xs text-center mt-2 text-green-800">
              Représentation à l'échelle
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          className="text-white font-bold bg-black hover:bg-red-700 cursor-pointer"
          onClick={onBack}
        >
          Retour
        </Button>
        <Button
          className="text-white font-bold bg-green-800 hover:bg-green-700 cursor-pointer"
          onClick={onSubmit}
        >
          Générer les plans
        </Button>
      </div>
    </div>
  );
}

export function GeneratingStep() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
      <h3 className="text-lg font-medium">Génération en cours...</h3>
      <p className="text-center text-green-800 mt-2 max-w-md">
        Notre IA analyse les données de votre sol, les cultures adaptées et les
        prix du marché pour vous proposer des plans d'optimisation.
      </p>
    </div>
  );
}

export function PlanSelectionStep({
  planProposals,
  selectedSol,
  selectedZone,
  onSelect,
  onBack,
  cultures,
  isLoading = false,
}: {
  planProposals: PlanProposal[];
  selectedSol: Sol | null;
  selectedZone: { id_zone: number; nom: string } | null;
  cultures: (Culture & { affinite: number })[];
  onSelect: (plan: PlanProposal) => void;
  onBack: () => void;
  isLoading?: boolean;
}) {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(
    null
  );

  // Filtrer les cultures pour les IDs présents dans les plans
  const getCultureById = (id: number) => {
    return cultures.find((c) => c.id_culture === id) || null;
  };

  if (isLoading) {
    return (
      <div className="py-10 flex flex-col items-center justify-center space-y-6">
        <LoaderWithText text="Sauvegarde du plan en cours..." size="large" />
        <p className="text-sm text-red-600 mt-4">
          Nous enregistrons votre plan et configurons les parcelles...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      <div>
        <h2 className="text-xl text-green-800 font-semibold mb-2">
          Choisissez votre plan
        </h2>
        <p className="text-black">
          Sélectionnez le plan d'optimisation qui correspond le mieux à vos
          besoins.
        </p>
      </div>

      <div className="space-y-4">
        {planProposals.map((plan, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-colors ${
              selectedPlanIndex === index
                ? "border-primary ring-2 bg-gray-200 ring-gray-300"
                : "hover:border-gray-300"
            }`}
            onClick={() => setSelectedPlanIndex(index)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-black">{plan.nom}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h4 className="font-medium mb-2 text-black flex items-center gap-2">
                    <CropIcon size={16} />
                    Répartition des cultures
                  </h4>
                  <div className="space-y-2">
                    {plan.parcelles.map((parcelle, i) => {
                      const culture = getCultureById(parcelle.id_culture);
                      return (
                        <div
                          key={i}
                          className="flex items-center text-red-700 font-bold gap-2"
                        >
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: culture?.couleur || "#cccccc",
                            }}
                          ></div>
                          <div className="flex-1 text-sm">
                            {culture?.nom || `Culture #${parcelle.id_culture}`}
                          </div>
                          <div className="text-sm ">
                            {parcelle.pourcentage}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="font-bold text-black mb-2 flex items-center gap-2">
                      <TrendingUpIcon size={16} />
                      Profit estimé
                    </h4>
                    <div className="text-2xl font-bold text-green-600">
                      {plan.profit_estime.toLocaleString()} F CFA
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-black mb-2 flex items-center gap-2">
                      <AlertTriangleIcon size={16} />
                      Niveau de risque
                    </h4>
                    <div className="flex items-center">
                      <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-red-500"
                          style={{
                            width: `${(plan.niveau_risque / 10) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 font-medium">
                        {plan.niveau_risque}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-bold text-black mb-2 flex items-center gap-2">
                  <LayoutIcon size={16} />
                  Aperçu du plan
                </h4>
                <Tabs defaultValue="3d" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="2d">Vue 2D</TabsTrigger>
                    <TabsTrigger value="3d">Vue 3D</TabsTrigger>
                  </TabsList>
                  <TabsContent value="2d" className="p-4">
                    <div className="h-96 w-full">
                      <Plan2D plan={plan} />
                    </div>
                  </TabsContent>
                  <TabsContent value="3d" className="p-4">
                    <div className="h-96 w-full">
                      <Plan3D plan={plan} />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Analyse du plan */}
                {plan.description && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-bold text-black mb-2 flex items-center gap-2">
                      <InfoIcon size={16} />
                      Analyse du plan
                    </h4>

                    {/* Utiliser une expression régulière pour extraire les différentes parties de l'analyse */}
                    {(() => {
                      // La description de base (avant l'analyse détaillée)
                      const baseDescription = plan.description
                        .split("--- ANALYSE DÉTAILLÉE ---")[0]
                        ?.trim();

                      // Extraire les avantages
                      const avantagesMatch = plan.description.match(
                        /\u2705 AVANTAGES:\n([\s\S]*?)(?=\n\n|$)/
                      );
                      const avantages = avantagesMatch
                        ? avantagesMatch[1]
                            .split("\n")
                            .filter((line) => line.trim() !== "")
                            .map((line) => line.replace(/^\d+\.\s*/, ""))
                        : [];

                      // Extraire les inconvénients
                      const inconvenientsMatch = plan.description.match(
                        /\u26a0\ufe0f INCONVÉNIENTS:\n([\s\S]*?)(?=\n\n|$)/
                      );
                      const inconvenients = inconvenientsMatch
                        ? inconvenientsMatch[1]
                            .split("\n")
                            .filter((line) => line.trim() !== "")
                            .map((line) => line.replace(/^\d+\.\s*/, ""))
                        : [];

                      // Extraire la méthode d'optimisation
                      const methodeMatch = plan.description.match(
                        /\ud83e\uddee Méthode d'optimisation: ([^\n]*)/
                      );
                      const methodeOptimisation = methodeMatch
                        ? methodeMatch[1]
                        : null;

                      // Extraire les facteurs de décision
                      const facteursMatch = plan.description.match(
                        /\ud83d\udcca FACTEURS DE DÉCISION:\n([\s\S]*?)(?=\n\n|$)/
                      );
                      const facteurs = facteursMatch
                        ? facteursMatch[1]
                            .split("\n")
                            .filter((line) => line.trim() !== "")
                            .map((line) => line.replace(/^\d+\.\s*/, ""))
                        : [];

                      return (
                        <div className="space-y-4">
                          {/* Description de base */}
                          {baseDescription && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-700">
                                {baseDescription}
                              </p>
                            </div>
                          )}

                          {/* Avantages et inconvénients */}
                          {(avantages.length > 0 ||
                            inconvenients.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              {avantages.length > 0 && (
                                <div className="p-3 border rounded bg-green-50">
                                  <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                                    <ThumbsUpIcon size={16} />
                                    Avantages
                                  </h4>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {avantages.map((avantage, i) => (
                                      <li
                                        key={i}
                                        className="text-sm text-gray-700"
                                      >
                                        {avantage}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {inconvenients.length > 0 && (
                                <div className="p-3 border rounded bg-red-50">
                                  <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                                    <ThumbsDownIcon size={16} />
                                    Inconvénients
                                  </h4>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {inconvenients.map((inconvenient, i) => (
                                      <li
                                        key={i}
                                        className="text-sm text-gray-700"
                                      >
                                        {inconvenient}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Méthode d'optimisation et facteurs */}
                          {methodeOptimisation && (
                            <div className="mt-4 p-3 border rounded bg-blue-50">
                              <h4 className="font-bold text-blue-800 mb-2">
                                Méthode d'optimisation
                              </h4>
                              <p className="text-sm text-gray-700">
                                {methodeOptimisation}
                              </p>

                              {facteurs.length > 0 && (
                                <>
                                  <h5 className="font-medium text-blue-700 mt-2 mb-1">
                                    Facteurs de décision
                                  </h5>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {facteurs.map((facteur, i) => (
                                      <li
                                        key={i}
                                        className="text-sm text-gray-700"
                                      >
                                        {facteur}
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-white flex items-center justify-center h-full text-black ">
              <Button
                className="w-full text-white font-bold bg-green-800 hover:bg-green-700 cursor-pointer"
                disabled={selectedPlanIndex !== index}
                onClick={() => selectedPlanIndex === index && onSelect(plan)}
              >
                Sélectionner ce plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Retour aux dimensions
        </Button>
        {selectedPlanIndex !== null && (
          <Button onClick={() => onSelect(planProposals[selectedPlanIndex])}>
            Choisir ce plan
          </Button>
        )}
      </div>
    </div>
  );
}

export function SoilDetectionStep({
  ph,
  setPh,
  humidite,
  setHumidite,
  salinite,
  setSalinite,
  isListeningForSensor,
  isDetectingSoil,
  onSensorDetection,
  onSoilDetection,
  sensorData,
}: {
  ph: number;
  setPh: (value: number) => void;
  humidite: number;
  setHumidite: (value: number) => void;
  salinite: number;
  setSalinite: (value: number) => void;
  isListeningForSensor: boolean;
  isDetectingSoil: boolean;
  onSensorDetection: () => void;
  onSoilDetection: () => void;
  sensorData?: { ph: number; humidite: number; salinite: number; timestamp?: number } | null;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-emerald-800 mb-2">
          Analyse du sol
        </h2>
        <p className="text-emerald-700">
          Entrez manuellement les caractéristiques du sol ou utilisez le capteur pour une détection automatique.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-emerald-800 text-sm font-medium">
              pH du sol (0-14)
            </label>
            <span className="text-emerald-600 font-medium">{ph.toFixed(1)}</span>
          </div>
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
          <div className="flex justify-between items-center mb-1">
            <label className="block text-emerald-800 text-sm font-medium">
              Taux d'humidité (%)
            </label>
            <span className="text-emerald-600 font-medium">{humidite.toFixed(1)}%</span>
          </div>
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
          <div className="flex justify-between items-center mb-1">
            <label className="block text-emerald-800 text-sm font-medium">
              Salinité (‰)
            </label>
            <span className="text-emerald-600 font-medium">{salinite.toFixed(1)}‰</span>
          </div>
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
            Assurez-vous que votre capteur ESP32 est connecté et envoie des
            données.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <div className="flex-1">
          <button
            className={`w-full h-12 flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-300 ${
              isListeningForSensor
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700'
            }`}
            onClick={onSensorDetection}
            disabled={isDetectingSoil}
          >
            {isListeningForSensor ? (
              <>
                <Loader size="small" color="text-white" />
                <span>Arrêter la détection</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>Détecter avec le capteur</span>
              </>
            )}
          </button>
          {isListeningForSensor && (
            <p className="mt-2 text-sm text-emerald-700 text-center">
              En attente des données du capteur...
            </p>
          )}
        </div>
        
        <button
          className="h-12 px-6 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          onClick={onSoilDetection}
          disabled={isDetectingSoil || isListeningForSensor}
        >
          {isDetectingSoil ? (
            <Loader size="small" color="text-white" />
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Analyser le sol</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function SoilResultStep({
  soilData,
  sensorData,
  onContinue,
  onBack,
}: {
  soilData: {
    sol: Sol | null;
    cultures: (Culture & { affinite: number })[];
  };
  sensorData?: {
    ph: number;
    humidite: number;
    salinite: number;
    timestamp?: number;
  } | null;
  onContinue: () => void;
  onBack: () => void;
}) {
  if (!soilData.sol) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangleIcon className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun sol correspondant</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          Impossible de déterminer le type de sol avec les caractéristiques fournies.
          Veuillez vérifier les valeurs et réessayer.
        </p>
        <Button 
          onClick={onBack} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-emerald-800 mb-2">
          Analyse du sol terminée
        </h2>
        <p className="text-emerald-700">
          Voici le type de sol détecté et les cultures les plus adaptées à vos caractéristiques.
        </p>
      </div>

      {sensorData && (
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
          <h3 className="font-medium text-emerald-800 text-lg mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Données du capteur
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-emerald-100">
              <div className="text-emerald-600 text-sm font-medium mb-1">pH du sol</div>
              <div className="text-2xl font-bold text-emerald-800">{sensorData.ph.toFixed(1)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-emerald-100">
              <div className="text-emerald-600 text-sm font-medium mb-1">Humidité</div>
              <div className="text-2xl font-bold text-emerald-800">{sensorData.humidite.toFixed(1)}%</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-emerald-100">
              <div className="text-emerald-600 text-sm font-medium mb-1">Salinité</div>
              <div className="text-2xl font-bold text-emerald-800">{sensorData.salinite.toFixed(1)}‰</div>
            </div>
          </div>
          {sensorData.timestamp && (
            <div className="mt-3 text-xs text-emerald-600">
              <span className="font-medium">Dernière mise à jour :</span>{' '}
              {new Date(sensorData.timestamp).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
        <h3 className="text-xl font-semibold text-emerald-800 mb-4">
          Détails du sol détecté
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="text-emerald-600 text-sm font-medium">Type de sol</div>
              <div className="text-lg font-semibold text-emerald-800">{soilData.sol.nom}</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="text-emerald-600 text-sm font-medium">pH du sol</div>
              <div className="text-lg font-semibold text-emerald-800">
                {soilData.sol.ph !== null && soilData.sol.ph !== undefined 
                  ? soilData.sol.ph.toFixed(1) 
                  : 'N/A'}
              </div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="text-emerald-600 text-sm font-medium">Humidité</div>
              <div className="text-lg font-semibold text-emerald-800">
                {soilData.sol.humidite !== null && soilData.sol.humidite !== undefined 
                  ? `${soilData.sol.humidite.toFixed(1)}%` 
                  : 'N/A'}
              </div>
            </div>
          </div>
          
          {soilData.sol.description && (
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h4 className="text-emerald-700 font-medium mb-2">Description</h4>
              <p className="text-emerald-800">{soilData.sol.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4">Cultures recommandées</h3>
        <div className="space-y-3 w-full">
          {soilData.cultures.slice(0, 8).map((culture) => {
            const affinitePercentage = (culture.affinite / 10) * 100;
            let bgColor = 'bg-emerald-100';
            let textColor = 'text-emerald-800';
            
            if (affinitePercentage >= 80) {
              bgColor = 'bg-emerald-50';
            } else if (affinitePercentage >= 50) {
              bgColor = 'bg-amber-50';
              textColor = 'text-amber-800';
            } else {
              bgColor = 'bg-red-50';
              textColor = 'text-red-800';
            }
            
            return (
              <div 
                key={culture.id_culture} 
                className={`p-4 rounded-lg border ${bgColor} border-opacity-50 transition-all hover:shadow-sm w-full overflow-hidden`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{culture.nom}</h4>
                    <p className="text-sm text-gray-500 truncate">{culture.type_culture}</p>
                  </div>
                  <div className="w-full sm:w-48 flex-shrink-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Affinité</span>
                      <span className={`text-sm font-semibold ${textColor} whitespace-nowrap ml-2`}>
                        {culture.affinite}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          affinitePercentage >= 80 ? 'bg-emerald-500' : 
                          affinitePercentage >= 50 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ 
                          width: `${Math.min(affinitePercentage, 100)}%`,
                          maxWidth: '100%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
        <Button
          variant="outline"
          className="h-12 px-6 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
          onClick={onBack}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </Button>
        <Button
          className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          onClick={onContinue}
        >
          Continuer
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
