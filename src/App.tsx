import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
<<<<<<< HEAD
import Scan from "./pages/Scan";
import PlantsCRUD from "./back-end/PlantsCRUD";
import "./styles/global.css";
=======
import DiscoverPlants from "./pages/DiscoverPlants/DiscoverPlants";
import PlantDetail from "./pages/DiscoverPlants/PlantDetail/PlantDetail";
>>>>>>> 48dfac9bc968066f7a5bda0a0e5fa8ef358e4af2

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
<<<<<<< HEAD

        {/* Scan Page */}
        <Route path="/scan" element={<Scan />} />

        {/* Plants CRUD Page */}
        <Route path="/plants" element={<PlantsCRUD />} />
=======
        <Route path="/discover" element={<DiscoverPlants />} />
        <Route path="/discover/:id" element={<PlantDetail />} />
        <Route path="*" element={<Navigate to="/discover" replace />} />
>>>>>>> 48dfac9bc968066f7a5bda0a0e5fa8ef358e4af2
      </Routes>
    </BrowserRouter>
  );
}
