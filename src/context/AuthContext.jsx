import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const DEMO_USERS = [
  { id: 1, email: "admin@secuvion.com", password: "admin123", name: "Sahil Nikam", role: "admin", avatar: null, plan: "enterprise" },
  { id: 2, email: "user@secuvion.com", password: "user123", name: "Demo User", role: "user", avatar: null, plan: "pro" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("secuvion_session");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const found = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (found) {
      const session = { ...found };
      delete session.password;
      setUser(session);
      localStorage.setItem("secuvion_session", JSON.stringify(session));
      return { success: true, user: session };
    }
    const allUsers = JSON.parse(localStorage.getItem("secuvion_users") || "[]");
    const registered = allUsers.find((u) => u.email === email && u.password === password);
    if (registered) {
      const session = { ...registered };
      delete session.password;
      setUser(session);
      localStorage.setItem("secuvion_session", JSON.stringify(session));
      return { success: true, user: session };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const signup = (data) => {
    const allUsers = JSON.parse(localStorage.getItem("secuvion_users") || "[]");
    if (DEMO_USERS.find((u) => u.email === data.email) || allUsers.find((u) => u.email === data.email)) {
      return { success: false, error: "Email already registered" };
    }
    const newUser = {
      id: Date.now(),
      email: data.email,
      password: data.password,
      name: data.firstName + (data.lastName ? " " + data.lastName : ""),
      role: "user",
      avatar: null,
      plan: "free",
      createdAt: new Date().toISOString(),
    };
    allUsers.push(newUser);
    localStorage.setItem("secuvion_users", JSON.stringify(allUsers));
    const session = { ...newUser };
    delete session.password;
    setUser(session);
    localStorage.setItem("secuvion_session", JSON.stringify(session));
    return { success: true, user: session };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("secuvion_session");
  };

  const updatePlan = (plan) => {
    const updated = { ...user, plan };
    setUser(updated);
    localStorage.setItem("secuvion_session", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updatePlan, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
