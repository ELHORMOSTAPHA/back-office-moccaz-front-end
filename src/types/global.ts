export interface Entreprise {
  id: number;
  nom_entreprise: string;
  adresse_entreprise: string;
  ville_entreprise: string;
  created_at: string;
  updated_at: string;
}

export interface Chauffeur {
  id: number;
  prenom: string;
  nom: string;
  id_user: number;
  email: string;
  telephone: string;
  permis_conduit: string;
  status: 'inactif' | 'actif' | 'suspendu';
  type_employeur: "Interne" | "Externe";

  // null when interne, object when externe
  entreprise: Entreprise | null;

  created_at: string;
  updated_at: string;
}
