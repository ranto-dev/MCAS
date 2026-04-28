import { createContext, useContext, useMemo, useState } from "react";
import { initialData } from "../data/mockData";
import type { DatabaseState, EntityKey } from "../types/entities";

type InsertPayload<K extends EntityKey> = Omit<DatabaseState[K][number], "id">;
type UpdatePayload<K extends EntityKey> = DatabaseState[K][number];

interface AdminDataContextValue {
  data: DatabaseState;
  createItem: <K extends EntityKey>(entity: K, payload: InsertPayload<K>) => void;
  updateItem: <K extends EntityKey>(entity: K, payload: UpdatePayload<K>) => void;
  deleteItem: (entity: EntityKey, id: number) => void;
}

const AdminDataContext = createContext<AdminDataContextValue | undefined>(undefined);

const getNextId = <K extends EntityKey>(rows: DatabaseState[K]) =>
  rows.length ? Math.max(...rows.map((row) => row.id)) + 1 : 1;

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DatabaseState>(initialData);

  const createItem: AdminDataContextValue["createItem"] = (entity, payload) => {
    setData((prev) => {
      const nextId = getNextId(prev[entity]);
      return {
        ...prev,
        [entity]: [...prev[entity], { ...payload, id: nextId }],
      };
    });
  };

  const updateItem: AdminDataContextValue["updateItem"] = (entity, payload) => {
    setData((prev) => ({
      ...prev,
      [entity]: prev[entity].map((row) => (row.id === payload.id ? payload : row)),
    }));
  };

  const deleteItem = (entity: EntityKey, id: number) => {
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
