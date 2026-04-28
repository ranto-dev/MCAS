import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initialData } from "../data/mockData";
import type { Admin, DatabaseState, EntityKey, Etablissement } from "../types/entities";

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

const ETABLISSEMENTS_API_URL =
  import.meta.env.VITE_ETABLISSEMENTS_API_URL ?? "http://192.168.0.104:8080/etablissements";
const ADMINS_API_URL = import.meta.env.VITE_ADMINS_API_URL ?? "http://192.168.0.104:8080/admins";

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

    void loadEtablissements();
    void loadAdmins();

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
