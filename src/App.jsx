import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Secuvion from "./Secuvion";

import Home from "./assets/pages/Home.jsx";
import ThreatMap from "./assets/pages/ThreatMap.jsx";
import FraudAnalyzer from "./assets/pages/FraudAnalyzer.jsx";
import SecurityScore from "./assets/pages/SecurityScore.jsx";
import Protection from "./assets/pages/Protection.jsx";
import ScamDatabase from "./assets/pages/ScamDatabase.jsx";
import EmergencyHelp from "./assets/pages/EmergencyHelp.jsx";
import Learn from "./assets/pages/Learn.jsx";
import Founder from "./assets/pages/Founder.jsx";
import Pricing from "./assets/pages/Pricing.jsx";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Secuvion />} />

        <Route path="/home" element={<Home />} />

        <Route path="/threat-map" element={<ThreatMap />} />

        <Route path="/fraud-analyzer" element={<FraudAnalyzer />} />

        <Route path="/security-score" element={<SecurityScore />} />

        <Route path="/protection" element={<Protection />} />

        <Route path="/scam-database" element={<ScamDatabase />} />

        <Route path="/emergency-help" element={<EmergencyHelp />} />

        <Route path="/learn" element={<Learn />} />

        <Route path="/founder" element={<Founder />} />

        <Route path="/pricing" element={<Pricing />} />

      </Routes>
    </Router>
  );
}

export default App;