import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h3>SECUVION</h3>
          <p>Click with care, we are always there.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {["X", "In", "Gh", "Yt"].map((s) => (
              <span key={s} style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "#94a3b8", cursor: "pointer",
              }}>{s}</span>
            ))}
          </div>
        </div>

        <div>
          <h4>Platform</h4>
          <ul>
            <li><Link to="/threat-map" style={{ color: "inherit", textDecoration: "none" }}>Threat Map</Link></li>
            <li><Link to="/fraud-analyzer" style={{ color: "inherit", textDecoration: "none" }}>Fraud Analyzer</Link></li>
            <li><Link to="/security-score" style={{ color: "inherit", textDecoration: "none" }}>Security Score</Link></li>
            <li><Link to="/pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</Link></li>
            <li><Link to="/dashboard" style={{ color: "inherit", textDecoration: "none" }}>Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            <li><Link to="/founder" style={{ color: "inherit", textDecoration: "none" }}>About</Link></li>
            <li><Link to="/founder" style={{ color: "inherit", textDecoration: "none" }}>Founder</Link></li>
            <li>Mission</li>
            <li>Contact</li>
          </ul>
        </div>

        <div>
          <h4>Resources</h4>
          <ul>
            <li><Link to="/learn" style={{ color: "inherit", textDecoration: "none" }}>Learn</Link></li>
            <li><Link to="/scam-database" style={{ color: "inherit", textDecoration: "none" }}>Scam Database</Link></li>
            <li><Link to="/emergency-help" style={{ color: "inherit", textDecoration: "none" }}>Emergency Help</Link></li>
            <li>Documentation</li>
          </ul>
        </div>

        <div>
          <h4>Legal</h4>
          <ul>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Cookie Policy</li>
            <li>GDPR Compliance</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div>&copy; 2026 SECUVION. All rights reserved.</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Founded by Sahil Anil Nikam | Built with security in mind | Protecting digital lives worldwide
        </div>
      </div>
    </footer>
  );
};

export default Footer;
