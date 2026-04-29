import { Ambulance, Bed, Building2, Shield, Stethoscope, UserCog } from "lucide-react";
import type { ComponentType } from "react";
import type { FieldConfig, FieldOption } from "../components/ui/EntityForm";
import type { DatabaseState, EntityKey } from "../types/entities";

interface ColumnConfig<T> {
  key: string;
  label: string;
  render: (row: T, data: DatabaseState) => string | number;
}

type EntityConfig<K extends EntityKey> = {
  key: K;
  route: string;
  title: string;
  description: string;
  icon: ComponentType<{ size?: number }>;
  fields: (data: DatabaseState) => FieldConfig[];
  columns: ColumnConfig<DatabaseState[K][number]>[];
};

const etablissementOptions = (data: DatabaseState): FieldOption[] =>
  data.etablissement.map((item) => ({
    value: String(item.id),
    label: item.nom,
  }));

const chauffeurOptions = (data: DatabaseState): FieldOption[] =>
  data.personnel
    .filter((item) => item.poste.toLowerCase().includes("chauffeur"))
    .map((item) => ({
      value: String(item.id),
      label: `${item.nom} ${item.prenom}`,
    }));

export const entityConfigs: { [K in EntityKey]: EntityConfig<K> } = {
  etablissement: {
    key: "etablissement",
    route: "etablissements",
    title: "Gestion des etablissements",
    description: "Creation, edition et suppression des etablissements de sante.",
    icon: Building2,
    fields: () => [
      { name: "nom", label: "Nom", type: "text", required: true },
      { name: "region", label: "Region", type: "text" },
      { name: "contact", label: "Contact", type: "text" },
      { name: "categorie", label: "Categorie", type: "text" },
    ],
    columns: [
      { key: "nom", label: "Nom", render: (row) => row.nom },
      { key: "region", label: "Region", render: (row) => row.region },
      { key: "contact", label: "Contact", render: (row) => row.contact },
      { key: "categorie", label: "Categorie", render: (row) => row.categorie },
    ],
  },
  admin: {
    key: "admin",
    route: "admins",
    title: "Gestion des administrateurs",
    description: "CRUD des comptes admin par etablissement.",
    icon: Shield,
    fields: (data) => [
      { name: "nom", label: "Nom", type: "text", required: true },
      { name: "prenom", label: "Prenom", type: "text", required: true },
      { name: "username", label: "Username", type: "text", required: true },
      { name: "mdp", label: "Mot de passe", type: "password", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      {
        name: "etablissement_id",
        label: "Etablissement",
        type: "select",
        required: true,
        options: etablissementOptions(data),
      },
    ],
    columns: [
      { key: "nom", label: "Nom", render: (row) => `${row.nom} ${row.prenom}` },
      { key: "username", label: "Username", render: (row) => row.username },
      { key: "email", label: "Email", render: (row) => row.email },
      {
        key: "etablissement_id",
        label: "Etablissement",
        render: (row, data) =>
          data.etablissement.find((e) => e.id === row.etablissement_id)?.nom ?? "-",
      },
    ],
  },
  personnel: {
    key: "personnel",
    route: "personnels",
    title: "Gestion des personnels",
    description: "CRUD du personnel medical et logistique.",
    icon: UserCog,
    fields: (data) => [
      { name: "nom", label: "Nom", type: "text", required: true },
      { name: "prenom", label: "Prenom", type: "text", required: true },
      { name: "contact", label: "Contact", type: "text", required: true },
      { name: "poste", label: "Poste", type: "text", required: true },
      { name: "age", label: "Age", type: "number", required: true },
      {
        name: "etablissement_id",
        label: "Etablissement",
        type: "select",
        required: true,
        options: etablissementOptions(data),
      },
    ],
    columns: [
      { key: "nom", label: "Nom", render: (row) => `${row.nom} ${row.prenom}` },
      { key: "contact", label: "Contact", render: (row) => row.contact },
      { key: "poste", label: "Poste", render: (row) => row.poste },
      { key: "age", label: "Age", render: (row) => row.age },
    ],
  },
  patients: {
    key: "patients",
    route: "patients",
    title: "Gestion des patients",
    description: "Suivi des admissions, sorties et statuts des patients.",
    icon: Stethoscope,
    fields: (data) => [
      { name: "nom", label: "Nom", type: "text", required: true },
      { name: "prenom", label: "Prenom", type: "text", required: true },
      { name: "maladies", label: "Maladies", type: "textarea", required: true },
      {
        name: "etablissement_id",
        label: "Etablissement",
        type: "select",
        required: true,
        options: etablissementOptions(data),
      },
      { name: "date_admission", label: "Date admission", type: "date", required: true },
      { name: "date_sortie", label: "Date sortie", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "en_attente", label: "En attente" },
          { value: "hospitalise", label: "Hospitalise" },
          { value: "sorti", label: "Sorti" },
        ],
      },
    ],
    columns: [
      { key: "nom", label: "Nom", render: (row) => `${row.nom} ${row.prenom}` },
      { key: "maladies", label: "Maladies", render: (row) => row.maladies },
      { key: "date_admission", label: "Admission", render: (row) => row.date_admission },
      { key: "status", label: "Status", render: (row) => row.status },
    ],
  },
  capacite: {
    key: "capacite",
    route: "capacites",
    title: "Gestion des capacites",
    description: "Capacites de prise en charge par maladie et espace.",
    icon: Bed,
    fields: (data) => [
      { name: "maladies", label: "Maladies", type: "text", required: true },
      { name: "espaces", label: "Espaces", type: "number", required: true },
      {
        name: "etablissement_id",
        label: "Etablissement",
        type: "select",
        required: true,
        options: etablissementOptions(data),
      },
    ],
    columns: [
      { key: "maladies", label: "Maladies", render: (row) => row.maladies },
      { key: "espaces", label: "Espaces", render: (row) => row.espaces },
      {
        key: "etablissement_id",
        label: "Etablissement",
        render: (row, data) =>
          data.etablissement.find((e) => e.id === row.etablissement_id)?.nom ?? "-",
      },
    ],
  },
  ambulance: {
    key: "ambulance",
    route: "ambulances",
    title: "Gestion des ambulances",
    description: "Suivi des ambulances, reference unique et chauffeur.",
    icon: Ambulance,
    fields: (data) => [
      { name: "refference", label: "Reference", type: "text", required: true },
      {
        name: "chauffeur_id",
        label: "Chauffeur",
        type: "select",
        required: true,
        options: chauffeurOptions(data),
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "libre", label: "Libre" },
          { value: "occupe", label: "Occupe" },
        ],
      },
    ],
    columns: [
      { key: "refference", label: "Reference", render: (row) => row.refference },
      {
        key: "chauffeur_id",
        label: "Chauffeur",
        render: (row, data) => {
          const chauffeur = data.personnel.find((p) => p.id === row.chauffeur_id);
          return chauffeur ? `${chauffeur.nom} ${chauffeur.prenom}` : "-";
        },
      },
      { key: "status", label: "Status", render: (row) => row.status },
    ],
  },
};
