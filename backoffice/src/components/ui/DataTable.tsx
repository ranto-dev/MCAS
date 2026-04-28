import { FaEdit, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";

interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => string | number;
}

interface DataTableProps<T extends { id: number }> {
  rows: T[];
  columns: Column<T>[];
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}

export function DataTable<T extends { id: number }>({
  rows,
  columns,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-blue-100">
        <thead className="bg-blue-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-blue-900"
              >
                {column.label}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-blue-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-50">
          {rows.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-sm text-black/70" colSpan={columns.length + 1}>
                Aucune donnee.
              </td>
            </tr>
          )}
          {rows.map((row, index) => (
            <motion.tr
              key={row.id}
              className="transition hover:bg-blue-50/40"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm text-black">
                  {column.render(row)}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    <FaEdit size={12} />
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="inline-flex items-center gap-2 rounded-lg border border-black px-3 py-2 text-xs font-medium text-black transition hover:bg-black hover:text-white active:scale-[0.98]"
                  >
                    <FaTrash size={12} />
                    Supprimer
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
