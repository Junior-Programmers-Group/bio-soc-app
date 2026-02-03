import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import DiscoverPlants from "./pages/DiscoverPlants/DiscoverPlants";
import PlantDetail from "./pages/DiscoverPlants/PlantDetail/PlantDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<DiscoverPlants />} />
        <Route path="/discover/:id" element={<PlantDetail />} />
        <Route path="*" element={<Navigate to="/discover" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
