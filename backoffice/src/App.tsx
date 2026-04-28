import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminDataProvider } from "./context/AdminDataContext";
import { DashboardPage } from "./pages/DashboardPage";
import { EntityPage } from "./pages/EntityPage";

export default function App() {
  return (
    <AdminDataProvider>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="etablissements" element={<EntityPage entity="etablissement" />} />
          <Route path="admins" element={<EntityPage entity="admin" />} />
          <Route path="personnels" element={<EntityPage entity="personnel" />} />
          <Route path="patients" element={<EntityPage entity="patients" />} />
          <Route path="capacites" element={<EntityPage entity="capacite" />} />
          <Route path="ambulances" element={<EntityPage entity="ambulance" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AdminDataProvider>
  );
}
