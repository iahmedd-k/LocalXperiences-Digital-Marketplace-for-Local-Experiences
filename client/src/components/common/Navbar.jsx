import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ExperiencesPage from "./pages/ExperiencesPage";
import ItinerariesPage from "./pages/ItinerariesPage";
import BecomeAHostPage from "./pages/BecomeAHostPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/experiences" element={<ExperiencesPage />} />
        <Route path="/itineraries" element={<ItinerariesPage />} />
        <Route path="/host-with-us" element={<BecomeAHostPage />} />
      </Routes>
    </BrowserRouter>
  );
}