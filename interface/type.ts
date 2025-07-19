export type Culture = {
  id_culture: number;
  nom: string;
  nom_scientifique?: string | null;
  type_culture: string;
  saison_plantation?: string | null;
  resistance_secheresse?: number | null;
  temperature_min?: number | null;
  temperature_max?: number | null;
  temps_maturation?: number | null;
  rendement_moyen?: number | null;
  description?: string | null;
  id_zone?: number | null;
  couleur?: string | null;
  prix_moyen?: number | null;
  saison?: string | null;
  img_url?: string | null;
  affinite?: number | null;
  niveau_demande?: string | null;
  besoin_eau?: string | null;
};

// Item enrichi pour l'affichage dans le marché
export type MarcheItem = {
  id_zone: number;
  id_culture: number;
  prix_moyen?: number | null;
  saison?: string | null;
  img_url?: string | null;
  niveau_demande?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  nom_culture: string;
  type_culture: string;
  nom_zone: string;
  nom_pays: string;
  nom_ville: string;
};


// Type for zone data
export type Zone = {
  id_zone: number;
  nom: string;
  continent: string;
  pays: string;
  ville: string;
};




export type Sol = {
  id_sol: number;
  nom: string;
  ph: number;
  humidite: number;
  salinite: number;
  texture: string;
  matiere_organique?: number | null;
  capacite_drainage?: string | null;
  description?: string | null;
};

export type CultureSol = {
  id_culture: number;
  id_sol: number;
  affinite: number;
  notes?: string | null;
};

// Type pour les propositions de plans d'optimisation
export interface PlanProposal {
  id_plan: number;
  nom: string;
  description: string | null;
  superficie: number;
  dimensions: {
    width: number;  
    height: number; 
    unit: string;   
  };
  profit_estime: number;
  niveau_risque: number;
  date_creation: string; 
  image_base?: string;   
  analyses: string | null;
  parcelles: Parcelle[];
}

export interface Parcelle {
  id_parcelle: string; // UUID
  id_plan: number;
  id_zone: number;
  id_culture: number;
  pourcentage: number;
  geometrie: {
    type: 'Polygon';
    coordinates: number[][][]; 
  };
  culture:Culture;
  proprietes?: {
    [key: string]: any; // Pour les métadonnées supplémentaires
  };
}