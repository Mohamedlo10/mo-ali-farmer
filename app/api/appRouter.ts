/**
 * Utilitaire pour les appels API avec l'approche AppRouter
 * Évite l'utilisation de fetch direct dans les composants
 */

// Type générique pour les réponses API
type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// Fonction générique pour les appels POST
export async function postToApi<T, U = any>(url: string, body: U): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { error: `Erreur ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erreur inconnue" };
  }
}

// Fonction générique pour les appels GET
export async function getFromApi<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return { error: `Erreur ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erreur inconnue" };
  }
}
