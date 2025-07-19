import { NextResponse } from 'next/server';
import { detectSolEtCulturesServer } from '../../detectionSolServer/query';

// In-memory store for the latest sensor data.
// NOTE: This is a simple solution for a single-user context.
// For production, consider using a database or cache service.
let latestSensorData: {
  ph: number;
  humidite: number;
  salinite: number;
  timestamp: number;
} | null = null;

const DATA_EXPIRATION_MS = 90000; // Data is valid for 90 seconds

// Fonction utilitaire pour ajouter les en-têtes CORS
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

/**
 * POST handler to receive data from the ESP32 sensor.
 */
export async function POST(request: Request) {
  try {
    const { ph, humidite, salinite } = await request.json();

    // Validate input
    if (ph === undefined || humidite === undefined || salinite === undefined) {
      const response = NextResponse.json(
        { error: 'Missing required fields: ph, humidite, salinite' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Store the latest data with a timestamp
    latestSensorData = {
      ph: Number(ph),
      humidite: Number(humidite),
      salinite: Number(salinite),
      timestamp: Date.now(),
    };

    console.log('Données du capteur reçues:', latestSensorData);

    const response = NextResponse.json({ message: 'Données reçues avec succès' });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Erreur lors du traitement des données du capteur:', error);
    const response = NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    return addCorsHeaders(response);
  }
}

/**
 * GET handler for the frontend to poll for new sensor data.
 */
export async function GET() {
  try {
    console.log('Requête GET reçue sur /api/sols/sensor');
    
    // Vérifier s'il y a des données récentes
    if (latestSensorData) {
      const dataAge = Date.now() - latestSensorData.timestamp;
      console.log(`Données disponibles, âge: ${dataAge}ms`);
      
      if (dataAge < DATA_EXPIRATION_MS) {
        console.log('Données du capteur valides:', latestSensorData);
        
        try {
          // Traiter les données pour trouver le type de sol
          const result = await detectSolEtCulturesServer({
            ph: latestSensorData.ph,
            humidite: latestSensorData.humidite,
            salinite: latestSensorData.salinite,
          });

          console.log('Résultat de detectSolEtCultures:', result);
          
          // Effacer les données après les avoir récupérées pour éviter la réutilisation
          latestSensorData = null;

          return NextResponse.json(result);
        } catch (error: any) {
          console.error('Erreur dans detectSolEtCultures:', error);
          return NextResponse.json(
            { 
              error: 'Erreur lors du traitement des données', 
              details: error?.message || 'Erreur inconnue',
              stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
            },
            { status: 500 }
          );
        }
      } else {
        console.log('Données expirées');
      }
    } else {
      console.log('Aucune donnée disponible');
    }
    
    // Aucune donnée disponible ou données expirées
    const response = NextResponse.json(
      { message: 'Aucune donnée récente disponible' },
      { status: 404 }
    );
    return addCorsHeaders(response);
  } catch (error) {
    console.log(latestSensorData);
    console.error('Erreur lors de la récupération des données du capteur:', error);
    const response = NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    return addCorsHeaders(response);
  }
}
