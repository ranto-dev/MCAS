import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initialData } from "../data/mockData";
import type {
  Admin,
  Ambulance,
  DatabaseState,
  EntityKey,
  Etablissement,
  Personnel,
} from "../types/entities";

type InsertPayload<K extends EntityKey> = Omit<DatabaseState[K][number], "id">;
type UpdatePayload<K extends EntityKey> = DatabaseState[K][number];

interface AdminDataContextValue {
  data: DatabaseState;
  createItem: <K extends EntityKey>(entity: K, payload: InsertPayload<K>) => Promise<void>;
  updateItem: <K extends EntityKey>(entity: K, payload: UpdatePayload<K>) => Promise<void>;
  deleteItem: (entity: EntityKey, id: number) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextValue | undefined>(undefined);

const getNextId = <K extends EntityKey>(rows: DatabaseState[K]) =>
  rows.length ? Math.max(...rows.map((row) => row.id)) + 1 : 1;

interface ApiEtablissement {
  ID: number;
  nom: string;
  region: string;
  contact: string;
  categorie: string;
}

interface ApiAdmin {
  ID: number;
  nom: string;
  prenom: string;
  username: string;
  mdp: string;
  email: string;
  etablissement_id: number;
}

interface ApiPersonnel {
  ID: number;
  nom: string;
  prenom: string;
  contact: string;
  poste: string;
  age: number;
  etablissement_id: number;
}

interface ApiAmbulance {
  ID: number;
  refference: string;
  chauffeur_id: number;
  status: string;
}

const ETABLISSEMENTS_API_URL =
  import.meta.env.VITE_ETABLISSEMENTS_API_URL ?? "http://192.168.0.104:8080/etablissements";
const ADMINS_API_URL = import.meta.env.VITE_ADMINS_API_URL ?? "http://192.168.0.104:8080/admins";
const PERSONNEL_API_URL =
  import.meta.env.VITE_PERSONNEL_API_URL ?? "http://192.168.0.104:8080/personnel";
const AMBULANCES_API_URL =
  import.meta.env.VITE_AMBULANCES_API_URL ?? "http://192.168.0.104:8080/ambulances";

const mapApiEtablissement = (item: ApiEtablissement): Etablissement => ({
  id: item.ID,
  nom: item.nom,
  region: item.region,
  contact: item.contact,
  categorie: item.categorie,
});

const mapApiAdmin = (item: ApiAdmin): Admin => ({
  id: item.ID,
  nom: item.nom,
  prenom: item.prenom,
  username: item.username,
  mdp: item.mdp,
  email: item.email,
  etablissement_id: item.etablissement_id,
});

const mapApiPersonnel = (item: ApiPersonnel): Personnel => ({
  id: item.ID,
  nom: item.nom,
  prenom: item.prenom,
  contact: item.contact,
  poste: item.poste,
  age: item.age,
  etablissement_id: item.etablissement_id,
});

const mapApiAmbulance = (item: ApiAmbulance): Ambulance => ({
  id: item.ID,
  refference: item.refference,
  chauffeur_id: item.chauffeur_id,
  status: item.status,
});

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DatabaseState>(initialData);

  useEffect(() => {
    let isMounted = true;

    const loadEtablissements = async () => {
      try {
        const response = await fetch(ETABLISSEMENTS_API_URL);
        if (!response.ok) {
          throw new Error(`Echec API etablissements: ${response.status}`);
        }

        const payload = (await response.json()) as ApiEtablissement[];
        const etablissements: Etablissement[] = payload.map(mapApiEtablissement);

        if (isMounted) {
          setData((prev) => ({
            ...prev,
            etablissement: etablissements,
          }));
        }
      } catch (error) {
        console.error("Impossible de charger les etablissements depuis l'API.", error);
      }
    };

    const loadAdmins = async () => {
      try {
        const response = await fetch(ADMINS_API_URL);
        if (!response.ok) {
          throw new Error(`Echec API admins: ${response.status}`);
        }

        const payload = (await response.json()) as ApiAdmin[];
        const admins: Admin[] = payload.map(mapApiAdmin);

        if (isMounted) {
          setData((prev) => ({
            ...prev,
            admin: admins,
          }));
        }
      } catch (error) {
        console.error("Impossible de charger les admins depuis l'API.", error);
      }
    };

    const loadPersonnels = async () => {
      try {
        const response = await fetch(PERSONNEL_API_URL);
        if (!response.ok) {
          throw new Error(`Echec API personnel: ${response.status}`);
        }

        const payload = (await response.json()) as ApiPersonnel[];
        const personnels: Personnel[] = payload.map(mapApiPersonnel);

        if (isMounted) {
          setData((prev) => ({
            ...prev,
            personnel: personnels,
          }));
        }
      } catch (error) {
        console.error("Impossible de charger les personnels depuis l'API.", error);
      }
    };

    const loadAmbulances = async () => {
      try {
        const response = await fetch(AMBULANCES_API_URL);
        if (!response.ok) {
          throw new Error(`Echec API ambulances: ${response.status}`);
        }

        const payload = (await response.json()) as ApiAmbulance[];
        const ambulances: Ambulance[] = payload.map(mapApiAmbulance);

        if (isMounted) {
          setData((prev) => ({
            ...prev,
            ambulance: ambulances,
          }));
        }
      } catch (error) {
        console.error("Impossible de charger les ambulances depuis l'API.", error);
      }
    };

    void loadEtablissements();
    void loadAdmins();
    void loadPersonnels();
    void loadAmbulances();

    return () => {
      isMounted = false;
    };
  }, []);

  const createItem: AdminDataContextValue["createItem"] = async (entity, payload) => {
    if (entity === "etablissement") {
      try {
        const response = await fetch(ETABLISSEMENTS_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Echec creation etablissement: ${response.status}`);
        }

        const created = (await response.json()) as ApiEtablissement;
        const createdEtablissement = mapApiEtablissement(created);

        setData((prev) => ({
          ...prev,
          etablissement: [...prev.etablissement, createdEtablissement],
        }));
        return;
      } catch (error) {
        console.error("Impossible de creer l'etablissement via l'API.", error);
        return;
      }
    }

    if (entity === "admin") {
      try {
        const response = await fetch(ADMINS_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Echec creation admin: ${response.status}`);
        }

        const created = (await response.json()) as ApiAdmin;
        const createdAdmin = mapApiAdmin(created);

        setData((prev) => ({
          ...prev,
          admin: [...prev.admin, createdAdmin],
        }));
        return;
      } catch (error) {
        console.error("Impossible de creer l'admin via l'API.", error);
        return;
      }
    }

    if (entity === "personnel") {
      try {
        const response = await fetch(PERSONNEL_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Echec creation personnel: ${response.status}`);
        }

        const created = (await response.json()) as ApiPersonnel;
        const createdPersonnel = mapApiPersonnel(created);

        setData((prev) => ({
          ...prev,
          personnel: [...prev.personnel, createdPersonnel],
        }));
        return;
      } catch (error) {
        console.error("Impossible de creer le personnel via l'API.", error);
        return;
      }
    }

    if (entity === "ambulance") {
      try {
        const { refference, chauffeur_id, status } = payload as Omit<Ambulance, "id">;
        const response = await fetch(AMBULANCES_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refference,
            chauffeur_id,
            status,
          }),
        });

        if (!response.ok) {
          throw new Error(`Echec creation ambulance: ${response.status}`);
        }

        const created = (await response.json()) as ApiAmbulance;
        const createdAmbulance = mapApiAmbulance(created);

        setData((prev) => ({
          ...prev,
          ambulance: [...prev.ambulance, createdAmbulance],
        }));
        return;
      } catch (error) {
        console.error("Impossible de creer l'ambulance via l'API.", error);
        return;
      }
    }

    setData((prev) => {
      const nextId = getNextId(prev[entity]);
      return {
        ...prev,
        [entity]: [...prev[entity], { ...payload, id: nextId }],
      };
    });
  };

  const updateItem: AdminDataContextValue["updateItem"] = async (entity, payload) => {
    if (entity === "etablissement") {
      const { id, nom, region, contact, categorie } = payload as Etablissement;
      try {
        const response = await fetch(`${ETABLISSEMENTS_API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom,
            region,
            contact,
            categorie,
          }),
        });

        if (!response.ok) {
          throw new Error(`Echec modification etablissement: ${response.status}`);
        }

        let updatedEtablissement: Etablissement = {
          id,
          nom,
          region,
          contact,
          categorie,
        };

        try {
          const updatedFromApi = (await response.json()) as ApiEtablissement;
          updatedEtablissement = mapApiEtablissement(updatedFromApi);
        } catch {
          // Certaines APIs PUT ne renvoient pas de JSON; on garde les donnees envoyees.
        }

        setData((prev) => ({
          ...prev,
          etablissement: prev.etablissement.map((row) =>
            row.id === id ? updatedEtablissement : row,
          ),
        }));
        return;
      } catch (error) {
        console.error("Impossible de modifier l'etablissement via l'API.", error);
        return;
      }
    }

    if (entity === "personnel") {
      const { id, nom, prenom, contact, poste, age, etablissement_id } = payload as Personnel;
      try {
        const response = await fetch(`${PERSONNEL_API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom,
            prenom,
            contact,
            poste,
            age,
            etablissement_id,
          }),
        });

        if (!response.ok) {
          throw new Error(`Echec modification personnel: ${response.status}`);
        }

        let updatedPersonnel: Personnel = {
          id,
          nom,
          prenom,
          contact,
          poste,
          age,
          etablissement_id,
        };

        try {
          const updatedFromApi = (await response.json()) as ApiPersonnel;
          updatedPersonnel = mapApiPersonnel(updatedFromApi);
        } catch {
          // Certaines APIs PUT ne renvoient pas de JSON; on garde les donnees envoyees.
        }

        setData((prev) => ({
          ...prev,
          personnel: prev.personnel.map((row) => (row.id === id ? updatedPersonnel : row)),
        }));
        return;
      } catch (error) {
        console.error("Impossible de modifier le personnel via l'API.", error);
        return;
      }
    }

    if (entity === "ambulance") {
      const { id, refference, chauffeur_id, status } = payload as Ambulance;
      try {
        const response = await fetch(`${AMBULANCES_API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refference,
            chauffeur_id,
            status,
          }),
        });

        if (!response.ok) {
          throw new Error(`Echec modification ambulance: ${response.status}`);
        }

        let updatedAmbulance: Ambulance = {
          id,
          refference,
          chauffeur_id,
          status,
        };

        try {
          const updatedFromApi = (await response.json()) as ApiAmbulance;
          updatedAmbulance = mapApiAmbulance(updatedFromApi);
        } catch {
          // Certaines APIs PUT ne renvoient pas de JSON; on garde les donnees envoyees.
        }

        setData((prev) => ({
          ...prev,
          ambulance: prev.ambulance.map((row) => (row.id === id ? updatedAmbulance : row)),
        }));
        return;
      } catch (error) {
        console.error("Impossible de modifier l'ambulance via l'API.", error);
        return;
      }
    }

    setData((prev) => ({
      ...prev,
      [entity]: prev[entity].map((row) => (row.id === payload.id ? payload : row)),
    }));
  };

  const deleteItem: AdminDataContextValue["deleteItem"] = async (entity, id) => {
    if (entity === "etablissement") {
      try {
        const response = await fetch(`${ETABLISSEMENTS_API_URL}/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`Echec suppression etablissement: ${response.status}`);
        }
      } catch (error) {
        console.error("Impossible de supprimer l'etablissement via l'API.", error);
        return;
      }
    }

    if (entity === "personnel") {
      try {
        const response = await fetch(`${PERSONNEL_API_URL}/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`Echec suppression personnel: ${response.status}`);
        }
      } catch (error) {
        console.error("Impossible de supprimer le personnel via l'API.", error);
        return;
      }
    }

    if (entity === "ambulance") {
      try {
        const response = await fetch(`${AMBULANCES_API_URL}/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`Echec suppression ambulance: ${response.status}`);
        }
      } catch (error) {
        console.error("Impossible de supprimer l'ambulance via l'API.", error);
        return;
      }
    }

    setData((prev) => {
      const next: DatabaseState = {
        ...prev,
        [entity]: prev[entity].filter((row) => row.id !== id),
      };

      if (entity === "etablissement") {
        next.admin = next.admin.filter((row) => row.etablissement_id !== id);
        next.personnel = next.personnel.filter((row) => row.etablissement_id !== id);
        next.patients = next.patients.filter((row) => row.etablissement_id !== id);
        next.capacite = next.capacite.filter((row) => row.etablissement_id !== id);
        const deletedPersonnelIds = prev.personnel
          .filter((row) => row.etablissement_id === id)
          .map((row) => row.id);
        next.ambulance = next.ambulance.filter(
          (row) => !deletedPersonnelIds.includes(row.chauffeur_id),
        );
      }

      if (entity === "personnel") {
        next.ambulance = next.ambulance.filter((row) => row.chauffeur_id !== id);
      }

      return next;
    });
  };

  const value = useMemo(
    () => ({
      data,
      createItem,
      updateItem,
      deleteItem,
    }),
    [data],
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData doit etre utilise dans AdminDataProvider");
  }
  return context;
}
