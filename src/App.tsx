import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Scan from "./pages/Scan";
import PlantsCRUD from "./back-end/PlantsCRUD";
import "./styles/global.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<Home />} />

        {/* Scan Page */}
        <Route path="/scan" element={<Scan />} />

        {/* Plants CRUD Page */}
        <Route path="/plants" element={<PlantsCRUD />} />
      </Routes>
    </Router>
  );
}

export default App;
