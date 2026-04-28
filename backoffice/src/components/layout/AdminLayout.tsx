import { Hospital, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/etablissements", label: "Etablissements", icon: Hospital },
  { to: "/admins", label: "Admins", icon: Hospital },
  { to: "/personnels", label: "Personnels", icon: Hospital },
  { to: "/patients", label: "Patients", icon: Hospital },
  { to: "/capacites", label: "Capacites", icon: Hospital },
  { to: "/ambulances", label: "Ambulances", icon: Hospital },
];

export function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-blue-50/40">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed left-4 top-4 z-40 rounded-xl bg-blue-700 p-2 text-white shadow-lg lg:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-72 border-r border-blue-100 bg-black text-white transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="border-b border-blue-900/40 p-6">
          <h1 className="text-xl font-bold text-white">MCAS Admin</h1>
          <p className="mt-1 text-sm text-blue-200">Interface de gestion</p>
        </div>
        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-blue-100 hover:bg-blue-800/60 hover:text-white"
                  }`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="p-6 lg:ml-72 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}
