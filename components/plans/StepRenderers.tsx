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
                    <div className="h-64 w-full">
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

export function SoilResultStep({
  soilData,
  onContinue,
  onBack,
}: {
  soilData: {
    sol: Sol | null;
    cultures: (Culture & { affinite: number })[];
  };
  onContinue: () => void;
  onBack: () => void;
}) {
  if (!soilData.sol) {
    return (
      <div className="text-center text-black py-8">
        <h3 className="text-lg font-medium mb-2">Aucun sol correspondant</h3>
        <p className="text-green-800">
          Impossible de déterminer le type de sol avec les caractéristiques
          fournies.
        </p>
        <Button onClick={onBack} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-black">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          Résultat de l'analyse du sol
        </h2>
        <p className="text-green-800">
          Voici le type de sol détecté et les cultures les plus adaptées.
        </p>
      </div>

      <div className="bg-green-50 p-4 rounded border border-green-200">
        <h3 className="font-medium text-green-800">
          Sol détecté: {soilData.sol.nom}
        </h3>
        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-green-800">pH:</span>{" "}
            <span className="font-medium">{soilData.sol.ph}</span>
          </div>
          <div>
            <span className="text-green-800">Humidité:</span>{" "}
            <span className="font-medium">{soilData.sol.humidite}%</span>
          </div>
          <div>
            <span className="text-green-800">Salinité:</span>{" "}
            <span className="font-medium">{soilData.sol.salinite}‰</span>
          </div>
        </div>
        {soilData.sol.description && (
          <p className="mt-2 text-sm text-green-700">
            {soilData.sol.description}
          </p>
        )}
      </div>

      <div>
        <h3 className="font-medium mb-2">Cultures recommandées par affinité</h3>
        <div className="border rounded divide-y">
          {soilData.cultures.slice(0, 8).map((culture) => (
            <div key={culture.id_culture} className="p-3 flex items-center">
              <div className="flex-1">
                <h4 className="font-medium">{culture.nom}</h4>
                <p className="text-sm text-green-800">{culture.type_culture}</p>
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${(culture.affinite / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {culture.affinite}/10
                  </span>
                </div>
              </div>
            </div>
          ))}
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
          variant="outline"
          className="text-white font-bold bg-green-800 hover:bg-green-700 cursor-pointer"
          onClick={onContinue}
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
