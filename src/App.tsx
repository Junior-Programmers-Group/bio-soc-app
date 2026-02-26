import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import pb from "./back-end/db";

import Home from "./pages/Home";
import Scan from "./pages/DiscoverPlants/Scan/Scan";
import PlantsCRUD from "./back-end/components/PlantsCRUD";
import DiscoverPlants from "./pages/DiscoverPlants/DiscoverPlants";
import PlantDetail from "./pages/DiscoverPlants/PlantDetail/PlantDetail";
import AdminLogin from "./components/Admin/AdminLogin";
import AdminDashboard from "./components/Admin/AdminDashboard";

import "./styles/global.css";

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.model?.isAdmin) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setIsAdminLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/plants" element={<PlantsCRUD />} />
        <Route path="/discover" element={<DiscoverPlants />} />
        <Route path="/discover/plants/:id" element={<PlantDetail />} />
        <Route path="/discover/:id" element={<PlantDetail />} />

        {/* ✅ Protected Admin Route */}
        <Route
          path="/admin"
          element={
            isAdminLoggedIn ? (
              <AdminDashboard onLogout={handleLogout} />
            ) : (
              <AdminLogin onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}