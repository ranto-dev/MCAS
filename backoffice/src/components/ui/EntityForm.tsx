import type { FormEvent } from "react";

type InputType = "text" | "number" | "date" | "textarea" | "select" | "email" | "password";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: InputType;
  required?: boolean;
  options?: FieldOption[];
}

interface EntityFormProps {
  fields: FieldConfig[];
  formValues: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function EntityForm({
  fields,
  formValues,
  onChange,
  onSubmit,
  onCancel,
}: EntityFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const commonClassName =
            "w-full rounded-xl border border-blue-200 px-3 py-2 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200";
          const value = formValues[field.name] ?? "";

          return (
            <label key={field.name} className="flex flex-col gap-1">
              <span className="text-sm font-medium text-blue-900">{field.label}</span>

              {field.type === "textarea" && (
                <textarea
                  className={commonClassName}
                  rows={3}
                  value={value}
                  required={field.required}
                  onChange={(event) => onChange(field.name, event.target.value)}
                />
              )}

              {field.type === "select" && (
                <select
                  className={commonClassName}
                  value={value}
                  required={field.required}
                  onChange={(event) => onChange(field.name, event.target.value)}
                >
                  <option value="">Selectionner</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {field.type !== "textarea" && field.type !== "select" && (
                <input
                  type={field.type}
                  className={commonClassName}
                  value={value}
                  required={field.required}
                  onChange={(event) => onChange(field.name, event.target.value)}
                />
              )}
            </label>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 border-t border-blue-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}
