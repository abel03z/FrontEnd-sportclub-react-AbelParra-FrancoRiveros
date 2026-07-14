import { createContext, useContext, useState, useEffect } from "react";
import { loginRequest } from "../api/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar la app, recupera la sesión guardada en localStorage
  // (equivalente a lo que hacían tus dashboards al leer localStorage directamente).
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const data = await loginRequest(email, password);

    if (!data.ok) {
      throw new Error(data.message || "Credenciales incorrectas");
    }

    const loggedUser = data.data.user;
    const token = data.data.token;

    localStorage.setItem("user", JSON.stringify(loggedUser));
    localStorage.setItem("token", token);
    setUser(loggedUser);

    return loggedUser;
  }

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  }

  const value = {
    user,
    role: user?.role,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
