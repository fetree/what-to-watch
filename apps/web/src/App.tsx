import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Onboarding } from "./pages/Onboarding.js";
import { Loading } from "./pages/Loading.js";
import { Recommendations } from "./pages/Recommendations.js";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
