export interface Etablissement {
  id: number;
  nom: string;
  region: string;
  contact: string;
  categorie: string;
}

export interface Admin {
  id: number;
  nom: string;
  prenom: string;
  username: string;
  mdp: string;
  email: string;
  etablissement_id: number;
}

export interface Personnel {
  id: number;
  nom: string;
  prenom: string;
  contact: string;
  poste: string;
  age: number;
  etablissement_id: number;
}

export interface Patient {
  id: number;
  nom: string;
  prenom: string;
  maladies: string;
  etablissement_id: number;
  date_admission: string;
  date_sortie: string;
  status: string;
}

export interface Capacite {
  id: number;
  maladies: string;
  espaces: string;
  etablissement_id: number;
}

export interface Ambulance {
  id: number;
  refference: string;
  chauffeur_id: number;
  status: string;
}

export interface DatabaseState {
  etablissement: Etablissement[];
  admin: Admin[];
  personnel: Personnel[];
  patients: Patient[];
  capacite: Capacite[];
  ambulance: Ambulance[];
}

export type EntityKey = keyof DatabaseState;
