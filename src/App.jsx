import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Registro from "./pages/auth/Registro";

import AdminLayout from "./pages/admin/AdminLayout";
import GestionUsuarios from "./pages/admin/GestionUsuarios";
import GestionDeportes from "./pages/admin/GestionDeportes";
import GestionSalas from "./pages/admin/GestionSalas";
import GestionAsignaciones from "./pages/admin/GestionAsignaciones";
import GestionHorarios from "./pages/admin/GestionHorarios";

import CoachLayout from "./pages/coach/CoachLayout";
import MisClases from "./pages/coach/MisClases";
import MiHorario from "./pages/coach/MiHorario";

import UserLayout from "./pages/user/UserLayout";
import ClasesDisponibles from "./pages/user/ClasesDisponibles";
import MisReservas from "./pages/user/MisReservas";

import MiPerfil from "./pages/shared/MiPerfil";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Rutas de Administrador */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="usuarios" replace />} />
        <Route path="usuarios" element={<GestionUsuarios />} />
        <Route path="deportes" element={<GestionDeportes />} />
        <Route path="salas" element={<GestionSalas />} />
        <Route path="asignaciones" element={<GestionAsignaciones />} />
        <Route path="horarios" element={<GestionHorarios />} />
        <Route path="perfil" element={<MiPerfil />} />
      </Route>

      {/* Rutas de Coach */}
      <Route
        path="/coach/dashboard"
        element={
          <ProtectedRoute allowedRoles={["coach"]}>
            <CoachLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="clases" replace />} />
        <Route path="clases" element={<MisClases />} />
        <Route path="horario" element={<MiHorario />} />
        <Route path="perfil" element={<MiPerfil />} />
      </Route>

      {/* Rutas de Usuario */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="clases" replace />} />
        <Route path="clases" element={<ClasesDisponibles />} />
        <Route path="reservas" element={<MisReservas />} />
        <Route path="perfil" element={<MiPerfil />} />
      </Route>
    </Routes>
  );
}

export default App;
