import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminDataProvider } from "./context/AdminDataContext";
import { DashboardPage } from "./pages/DashboardPage";
import { EntityPage } from "./pages/EntityPage";
import { LoginPage } from "./pages/LoginPage";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedAuth = window.localStorage.getItem("mcas_admin_auth");
    setIsAuthenticated(storedAuth === "true");
  }, []);

  const handleLogin = (username: string, password: string) => {
    const valid = username === "admin" && password === "admin123";
    if (valid) {
      setIsAuthenticated(true);
      window.localStorage.setItem("mcas_admin_auth", "true");
    }
    return valid;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    window.localStorage.removeItem("mcas_admin_auth");
  };

  return (
    <AdminDataProvider>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          element={
            isAuthenticated ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/login" replace />
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="etablissements" element={<EntityPage entity="etablissement" />} />
          <Route path="admins" element={<EntityPage entity="admin" />} />
          <Route path="personnels" element={<EntityPage entity="personnel" />} />
          <Route path="patients" element={<EntityPage entity="patients" />} />
          <Route path="capacites" element={<EntityPage entity="capacite" />} />
          <Route path="ambulances" element={<EntityPage entity="ambulance" />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Route>
      </Routes>
    </AdminDataProvider>
  );
}
