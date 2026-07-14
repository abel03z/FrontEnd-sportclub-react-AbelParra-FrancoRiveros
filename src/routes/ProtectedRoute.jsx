import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// allowedRoles opcional: si se pasa, solo esos roles pueden entrar.
// Ej: <ProtectedRoute allowedRoles={["admin"]}><DashboardAdmin /></ProtectedRoute>
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null; // o un spinner

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
