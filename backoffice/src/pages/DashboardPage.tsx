import { Bed, Building2, Shield, Stethoscope, Truck, UserCog } from "lucide-react";
import { motion } from "framer-motion";
import { useAdminData } from "../context/AdminDataContext";

const cards = [
  { key: "etablissement", label: "Etablissements", icon: Building2 },
  { key: "admin", label: "Administrateurs", icon: Shield },
  { key: "personnel", label: "Personnels", icon: UserCog },
  { key: "patients", label: "Patients", icon: Stethoscope },
  { key: "capacite", label: "Capacites", icon: Bed },
  { key: "ambulance", label: "Ambulances", icon: Truck },
] as const;

export function DashboardPage() {
  const { data } = useAdminData();

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <header>
        <h2 className="text-3xl font-bold text-black">Dashboard administration</h2>
        <p className="mt-2 text-sm text-black/70">
          Vue globale des entites de la base de donnees simulee en local.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ key, label, icon: Icon }, index) => (
          <motion.article
            key={key}
            className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: index * 0.04 }}
            whileHover={{ y: -2 }}
          >
            <div className="mb-4 inline-flex rounded-xl bg-blue-100 p-2 text-blue-700">
              <Icon size={18} />
            </div>
            <h3 className="text-sm font-medium text-blue-900">{label}</h3>
            <p className="mt-2 text-3xl font-bold text-black">{data[key].length}</p>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}
