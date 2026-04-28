import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { DataTable } from "../components/ui/DataTable";
import { EntityForm } from "../components/ui/EntityForm";
import { Modal } from "../components/ui/Modal";
import { entityConfigs } from "../config/entityConfigs";
import { useAdminData } from "../context/AdminDataContext";
import type { DatabaseState, EntityKey } from "../types/entities";

type ModalMode = "create" | "edit" | "delete" | null;

interface EntityPageProps<K extends EntityKey> {
  entity: K;
}

const toFormValue = (value: unknown) => String(value ?? "");

export function EntityPage<K extends EntityKey>({ entity }: EntityPageProps<K>) {
  const { data, createItem, updateItem, deleteItem } = useAdminData();
  const config = entityConfigs[entity];
  const rows = data[entity];
  const fields = config.fields(data);

  const [mode, setMode] = useState<ModalMode>(null);
  const [activeRow, setActiveRow] = useState<DatabaseState[K][number] | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const columns = useMemo(
    () =>
      config.columns.map((column) => ({
        ...column,
        render: (row: DatabaseState[K][number]) => column.render(row, data),
      })),
    [config.columns, data],
  );

  const openCreate = () => {
    const defaults = Object.fromEntries(fields.map((field) => [field.name, ""]));
    setFormValues(defaults);
    setActiveRow(null);
    setMode("create");
  };

  const openEdit = (row: DatabaseState[K][number]) => {
    const rowRecord = row as unknown as Record<string, unknown>;
    const values = Object.fromEntries(
      fields.map((field) => [field.name, toFormValue(rowRecord[field.name])]),
    );
    setFormValues(values);
    setActiveRow(row);
    setMode("edit");
  };

  const openDelete = (row: DatabaseState[K][number]) => {
    setActiveRow(row);
    setMode("delete");
  };

  const closeModal = () => {
    setMode(null);
    setActiveRow(null);
    setFormValues({});
  };

  const parseRow = () => {
    const payload = fields.reduce<Record<string, string | number>>((acc, field) => {
      const rawValue = formValues[field.name] ?? "";
      acc[field.name] = field.type === "number" ? Number(rawValue) : rawValue;
      return acc;
    }, {});
    return payload;
  };

  const handleSubmit = () => {
    const payload = parseRow();
    if (mode === "create") {
      createItem(entity, payload as Omit<DatabaseState[K][number], "id">);
    }
    if (mode === "edit" && activeRow) {
      const merged = { ...activeRow, ...payload } as unknown as DatabaseState[K][number];
      updateItem(entity, merged);
    }
    closeModal();
  };

  const handleDelete = () => {
    if (!activeRow) return;
    deleteItem(entity, activeRow.id);
    closeModal();
  };

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <motion.header
        className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.05 }}
      >
        <div className="space-y-2">
          <div className="inline-flex rounded-xl bg-blue-100 p-2 text-blue-700">
            <config.icon size={18} />
          </div>
          <h2 className="text-2xl font-bold text-black">{config.title}</h2>
          <p className="text-sm text-black/70">{config.description}</p>
        </div>
        <motion.button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={16} />
          Ajouter
        </motion.button>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.08 }}
      >
        <DataTable rows={rows} columns={columns} onEdit={openEdit} onDelete={openDelete} />
      </motion.div>

      <Modal
        title={mode === "edit" ? "Modifier l'element" : "Ajouter un nouvel element"}
        isOpen={mode === "create" || mode === "edit"}
        onClose={closeModal}
      >
        <EntityForm
          fields={fields}
          formValues={formValues}
          onChange={(name, value) => setFormValues((prev) => ({ ...prev, [name]: value }))}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal title="Confirmer la suppression" isOpen={mode === "delete"} onClose={closeModal}>
        <div className="space-y-5">
          <p className="text-sm text-black">
            Cette action est irreversible et supprimera aussi les elements dependants.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-black px-4 py-2 text-sm text-black transition hover:bg-black hover:text-white"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </motion.section>
  );
}
