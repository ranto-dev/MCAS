import type { DatabaseState } from "../types/entities";

export const initialData: DatabaseState = {
  etablissement: [],
  admin: [],
  personnel: [
    {
      id: 1,
      nom: "Rabe",
      prenom: "Lova",
      contact: "+261 34 00 001 01",
      poste: "Chauffeur",
      age: 31,
      etablissement_id: 1,
    },
    {
      id: 2,
      nom: "Randria",
      prenom: "Aina",
      contact: "+261 34 00 001 02",
      poste: "Infirmier",
      age: 27,
      etablissement_id: 2,
    },
  ],
  patients: [
    {
      id: 1,
      nom: "Rasoanaivo",
      prenom: "Miora",
      maladies: "Paludisme severe",
      etablissement_id: 2,
      date_admission: "2026-04-01",
      date_sortie: "",
      status: "Hospitalise",
    },
  ],
  capacite: [
    {
      id: 1,
      maladies: "Cardiologie",
      espaces: "32 lits",
      etablissement_id: 1,
    },
    {
      id: 2,
      maladies: "Pediatrie",
      espaces: "18 lits",
      etablissement_id: 2,
    },
  ],
  ambulance: [
    {
      id: 1,
      refference: "AMB-001",
      chauffeur_id: 1,
      status: "Disponible",
    },
  ],
};
