"use client";
import { useState, useEffect, Suspense } from "react";
import { detectSolEtCultures } from "@/app/api/detection/query";
import { Sol, Culture } from "@/interface/type";
import { Loader, LoaderWithText } from "@/components/ui/loader";

// Composant SoilDetectionStep copié depuis StepRenderers.tsx
function SoilDetectionStep({
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
  sensorData?: { ph: number; humidite: number; salinite: number } | null;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl text-green-800 font-semibold mb-2">
          Détection du sol
        </h2>
        <p className="text-green-800">
          Entrez les caractéristiques du sol pour déterminer les cultures les
          plus adaptées.
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
            Assurez-vous que votre capteur ESP32 est connecté et envoie des
            données.
          </p>
        </div>
      )}

      {sensorData && (
        <div className="my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">
            Données du capteur reçues :
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">pH:</span>{" "}
              <span className="font-medium">{sensorData.ph}</span>
            </div>
            <div>
              <span className="text-blue-700">Humidité:</span>{" "}
              <span className="font-medium">{sensorData.humidite}%</span>
            </div>
            <div>
              <span className="text-blue-700">Salinité:</span>{" "}
              <span className="font-medium">{sensorData.salinite}‰</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <button
          className="bg-blue-600 hover:bg-blue-700 cursor-pointer font-bold h-10 md:text-base text-xs w-56 flex justify-center items-center text-white px-4 py-2 rounded disabled:bg-blue-300"
          onClick={onSensorDetection}
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
          onClick={onSoilDetection}
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
}

// Composant SoilResultStep copié depuis StepRenderers.tsx
function SoilResultStep({
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
  console.log("SoilResultStep - sensorData reçu:", sensorData);
  console.log("SoilResultStep - soilData reçu:", soilData);
  if (!soilData.sol) {
    return (
      <div className="text-center text-black py-8">
        <h3 className="text-lg font-medium mb-2">Aucun sol correspondant</h3>
        <p className="text-green-800">
          Impossible de déterminer le type de sol avec les caractéristiques
          fournies.
        </p>

        {sensorData && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <h4 className="font-medium text-blue-800 mb-2">
              Données du capteur reçues :
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">pH:</span>{" "}
                <span className="font-medium">{sensorData.ph}</span>
              </div>
              <div>
                <span className="text-blue-700">Humidité:</span>{" "}
                <span className="font-medium">{sensorData.humidite}%</span>
              </div>
              <div>
                <span className="text-blue-700">Salinité:</span>{" "}
                <span className="font-medium">{sensorData.salinite}‰</span>
              </div>
            </div>
            {sensorData.timestamp && (
              <div className="text-xs text-blue-600 mt-2">
                <strong>Timestamp:</strong>{" "}
                {new Date(sensorData.timestamp).toLocaleString("fr-FR")}
              </div>
            )}
          </div>
        )}

        <button
          className="mt-4 bg-emerald-600 text-white font-semibold py-2 px-4 rounded hover:bg-emerald-700 transition"
          onClick={onBack}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-black">
      <div>
        <h2 className="text-2xl font-bold text-emerald-800 mb-2">
          Résultats de l'analyse du sol
        </h2>
        <p className="text-emerald-700">
          Voici le type de sol détecté et les cultures les plus adaptées.
        </p>
      </div>

      {sensorData && (
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
          <h3 className="font-medium text-emerald-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Données du capteur
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg border border-emerald-100">
              <div className="text-emerald-600 font-medium">pH</div>
              <div className="text-lg font-bold text-emerald-800">{sensorData.ph.toFixed(1)}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-100">
              <div className="text-emerald-600 font-medium">Humidité</div>
              <div className="text-lg font-bold text-emerald-800">{sensorData.humidite.toFixed(1)}%</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-100">
              <div className="text-emerald-600 font-medium">Salinité</div>
              <div className="text-lg font-bold text-emerald-800">{sensorData.salinite.toFixed(1)}‰</div>
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
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="text-emerald-600 text-sm font-medium">Type de sol</div>
              <div className="text-lg font-semibold text-emerald-800">{soilData.sol.nom}</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="text-emerald-600 text-sm font-medium">pH du sol</div>
              <div className="text-lg font-semibold text-emerald-800">{soilData.sol.ph?.toFixed(1) || 'N/A'}</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="text-emerald-600 text-sm font-medium">Humidité</div>
              <div className="text-lg font-semibold text-emerald-800">
                {soilData.sol.humidite?.toFixed(1) || 'N/A'}%
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
        <button
          className="bg-black hover:bg-red-700 cursor-pointer font-bold h-10 w-32 flex justify-center items-center text-white px-4 py-2 rounded"
          onClick={onBack}
        >
          Retour
        </button>
        <button
          className="bg-green-800 hover:bg-green-700 cursor-pointer font-bold h-10 w-32 flex justify-center items-center text-white px-4 py-2 rounded"
          onClick={onContinue}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}

// Composant principal de la page de détection
const DetectionContent = () => {
  const [currentStep, setCurrentStep] = useState<"detection" | "result">(
    "detection"
  );

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
  const [sensorData, setSensorData] = useState<{
    ph: number;
    humidite: number;
    salinite: number;
    timestamp?: number;
  } | null>(null);

  // Cleanup polling on component unmount
  useEffect(() => {
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
      
      // Mettre à jour les données du sol
      setSoilData(result);
      
      // Si des données de capteur sont disponibles, les conserver
      if (sensorData) {
        setSensorData({
          ...sensorData,
          ph,
          humidite,
          salinite,
          timestamp: Date.now()
        });
      } else {
        // Sinon, créer un nouvel objet de données de capteur
        setSensorData({
          ph,
          humidite,
          salinite,
          timestamp: Date.now()
        });
      }
      
      setCurrentStep("result");
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
                setCurrentStep("result");
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
                setCurrentStep("result");
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
                  setCurrentStep("result");
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

  const handleBack = () => {
    setCurrentStep("detection");
    setSoilData({ sol: null, cultures: [] });
    setSensorData(null);
  };

  const handleContinue = () => {
    // Ici vous pouvez rediriger vers la page de création de plan
    // ou afficher d'autres options
    alert(
      "Fonctionnalité à implémenter : redirection vers la création de plan"
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
   

      {currentStep === "detection" ? (
        <div className="bg-white rounded-xl shadow p-6">
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
            sensorData={sensorData}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-6">
          <SoilResultStep
            soilData={soilData}
            sensorData={sensorData}
            onContinue={handleContinue}
            onBack={handleBack}
          />
        </div>
      )}

      {/* Debug: Afficher les données du capteur */}
      {process.env.NODE_ENV === "development" && sensorData && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <strong>Debug - sensorData:</strong> {JSON.stringify(sensorData)}
        </div>
      )}
    </div>
  );
};

// Page principale avec Suspense
export default function DetectionPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <DetectionContent />
    </Suspense>
  );
}
