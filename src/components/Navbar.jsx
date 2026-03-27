import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const links = [
    { to: "/threat-map", label: "Threat Map" },
    { to: "/fraud-analyzer", label: "Fraud Analyzer" },
    { to: "/security-score", label: "Security Score" },
    { to: "/learn", label: "Learn" },
    { to: "/pricing", label: "Pricing" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? "10px 40px" : "14px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(3,7,18,0.92)" : "rgba(3,7,18,0.7)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(148,163,184,0.06)",
        transition: "all 0.3s ease",
      }}>
        {/* Logo */}
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

        {/* Desktop links */}
        <div className="nav-desktop-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              color: isActive(l.to) ? "#6366f1" : "#94a3b8",
              textDecoration: "none", fontSize: 14, fontWeight: 500,
              transition: "color 0.2s",
            }}>{l.label}</Link>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="nav-desktop-auth" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <Link to="/dashboard" style={{
              padding: "8px 20px", background: "linear-gradient(135deg, #6366f1, #14e3c5)",
              borderRadius: 8, color: "#fff", textDecoration: "none", fontSize: 13,
              fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
            }}>Dashboard</Link>
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

        {/* Mobile hamburger */}
        <button className="nav-mobile-burger" onClick={() => setOpen(!open)} style={{
          display: "none", background: "none", border: "none", cursor: "pointer",
          padding: 6, flexDirection: "column", gap: 5, zIndex: 1001,
        }}>
          <span style={{ display: "block", width: 22, height: 2, background: "#f1f5f9", borderRadius: 2, transition: "all 0.3s", transform: open ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <span style={{ display: "block", width: 22, height: 2, background: "#f1f5f9", borderRadius: 2, transition: "all 0.3s", opacity: open ? 0 : 1 }} />
          <span style={{ display: "block", width: 22, height: 2, background: "#f1f5f9", borderRadius: 2, transition: "all 0.3s", transform: open ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999,
          background: "rgba(3,7,18,0.97)", backdropFilter: "blur(20px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
          animation: "navFadeIn 0.25s ease",
        }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              color: isActive(l.to) ? "#6366f1" : "#f1f5f9",
              textDecoration: "none", fontSize: 22, fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
              padding: "12px 24px", transition: "color 0.2s",
            }}>{l.label}</Link>
          ))}
          <div style={{ width: 60, height: 1, background: "rgba(148,163,184,0.1)", margin: "12px 0" }} />
          {user ? (
            <Link to="/dashboard" style={{
              padding: "12px 36px", background: "linear-gradient(135deg, #6366f1, #14e3c5)",
              borderRadius: 10, color: "#fff", textDecoration: "none", fontSize: 16,
              fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
            }}>Dashboard</Link>
          ) : (
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <Link to="/login" style={{
                padding: "12px 28px", border: "1px solid rgba(148,163,184,0.15)",
                borderRadius: 10, color: "#f1f5f9", textDecoration: "none", fontSize: 15, fontWeight: 500,
              }}>Login</Link>
              <Link to="/signup" style={{
                padding: "12px 28px", background: "linear-gradient(135deg, #6366f1, #14e3c5)",
                borderRadius: 10, color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 600,
              }}>Sign Up</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes navFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @media (max-width: 900px) {
          .nav-desktop-links, .nav-desktop-auth { display: none !important; }
          .nav-mobile-burger { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
