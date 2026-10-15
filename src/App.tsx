import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAdminSession } from "./hooks/useAdminSession";

import Home from "./pages/Home";

// Lazy load heavy route components for code splitting
const Scan = lazy(() => import("./pages/DiscoverPlants/Scan/Scan"));
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
  const { isAdmin, ready, logout } = useAdminSession();

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/discover" element={<DiscoverPlants />} />
          <Route path="/discover/plants/:id" element={<PlantDetail />} />
          <Route path="/discover/:id" element={<PlantDetail />} />

          {/* Admin: the dashboard only renders for a verified admin session */}
          <Route
            path="/admin"
            element={
              !ready ? (
                <LoadingFallback />
              ) : isAdmin ? (
                <AdminDashboard onLogout={logout} />
              ) : (
                <AdminLogin />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
