import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "rgba(3,7,18,0.7)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(148,163,184,0.06)",
    }}>
      <Link to="/" style={{
        fontSize: 20, fontWeight: 800, color: "#f1f5f9", textDecoration: "none",
        fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{
          width: 30, height: 30, borderRadius: 8,
          background: "linear-gradient(135deg, #14e3c5, #6366f1)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, color: "#fff",
        }}>S</span>
        SECUVION
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <Link to="/threat-map" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Threat Map</Link>
        <Link to="/fraud-analyzer" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Fraud Analyzer</Link>
        <Link to="/security-score" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Security Score</Link>
        <Link to="/learn" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Learn</Link>
        <Link to="/pricing" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Pricing</Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user ? (
          <>
            <Link to="/dashboard" style={{
              padding: "8px 20px", background: "linear-gradient(135deg, #6366f1, #14e3c5)",
              borderRadius: 8, color: "#fff", textDecoration: "none", fontSize: 13,
              fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
            }}>Dashboard</Link>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              padding: "8px 20px", border: "1px solid rgba(148,163,184,0.15)",
              borderRadius: 8, color: "#f1f5f9", textDecoration: "none", fontSize: 13,
              fontWeight: 500, background: "transparent",
            }}>Login</Link>
            <Link to="/signup" style={{
              padding: "8px 20px", background: "linear-gradient(135deg, #6366f1, #14e3c5)",
              borderRadius: 8, color: "#fff", textDecoration: "none", fontSize: 13,
              fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
            }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
