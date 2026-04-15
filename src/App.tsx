import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import pb from "./back-end/db";

import Home from "./pages/Home";

// Lazy load heavy route components for code splitting
const Scan = lazy(() => import("./pages/DiscoverPlants/Scan/Scan"));
const PlantsCRUD = lazy(() => import("./back-end/components/PlantsCRUD"));
const DiscoverPlants = lazy(() => import("./pages/DiscoverPlants/DiscoverPlants"));
const PlantDetail = lazy(() => import("./pages/DiscoverPlants/PlantDetail/PlantDetail"));
const AdminLogin = lazy(() => import("./components/Admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./components/Admin/AdminDashboard"));

import "./styles/global.css";

// Loading fallback component
function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>
      Loading...
    </div>
  );
}

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
      <Suspense fallback={<LoadingFallback />}>
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
      </Suspense>
    </BrowserRouter>
  );
}