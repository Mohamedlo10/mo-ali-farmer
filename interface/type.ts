export type Culture = {
  id_culture: number;
  nom: string;
  nom_scientifique?: string | null;
  type_culture: string;
  saison_plantation?: string | null;
  besoin_eau: string;
  resistance_secheresse?: number | null;
  temperature_min?: number | null;
  temperature_max?: number | null;
  temps_maturation?: number | null;
  rendement_moyen?: number | null;
  description?: string | null;
  id_zone?: number | null;
  prix_moyen?: number | null;
  saison?: string | null;
  niveau_demande?: string | null;
};

// Item enrichi pour l'affichage dans le marché
export type MarcheItem = {
  id_zone: number;
  id_culture: number;
  prix_moyen?: number | null;
  saison?: string | null;
  niveau_demande?: string | null;
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
export type PlanProposal = {
  nom_plan: string;
  description?: string;
  parcelles: {
    id_culture: number;
    pourcentage: number;
    couleur: string;
    position_x: number;
    position_y: number;
    forme: string;
  }[];
  profit_estime: number;
  niveau_risque: number;
  superficie?: number;
  largeur?: number;
  longueur?: number;
};
