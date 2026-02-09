import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home"
import Scan from "./pages/DiscoverPlants/Scan/Scan";
import PlantsCRUD from "./back-end/PlantsCRUD";
import DiscoverPlants from "./pages/DiscoverPlants/DiscoverPlants";
import PlantDetail from "./pages/DiscoverPlants/PlantDetail/PlantDetail";
import Admin from "./pages/Admin/Admin";
import "./styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/plants" element={<PlantsCRUD />} />
        <Route path="/discover" element={<DiscoverPlants />} />
        <Route path="/discover/:id" element={<PlantDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
