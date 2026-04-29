import type { DatabaseState } from "../types/entities";

export const initialData: DatabaseState = {
  etablissement: [],
  admin: [],
  personnel: [],
  patients: [],
  capacite: [],
  ambulance: [
    {
      id: 1,
      refference: "AMB-001",
      chauffeur_id: 1,
      status: "Disponible",
    },
  ],
};
