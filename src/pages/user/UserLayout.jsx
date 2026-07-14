import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
  { to: "/dashboard/clases", label: "Clases Disponibles" },
  { to: "/dashboard/reservas", label: "Mis Reservas" },
  { to: "/dashboard/perfil", label: "Mi Perfil" },
];

export default function UserLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <style>{`
        .sc-topbar { display: none; }
        .sc-sidebar { transform: none; transition: transform 0.25s ease; }
        .sc-backdrop { display: none; }
        @media (max-width: 767.98px) {
          .sc-topbar { display: flex; }
          .sc-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 1040;
            transform: translateX(-100%);
          }
          .sc-sidebar.sc-open { transform: translateX(0); }
          .sc-backdrop.sc-open {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 1030;
          }
        }
      `}</style>

      <div
        className="sc-topbar align-items-center justify-content-between px-3 py-2"
        style={{ backgroundColor: "#1f2e3a" }}
      >
        <Button
          variant="outline-light"
          size="sm"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label="Abrir menú"
        >
          ☰
        </Button>
        <span className="text-white fw-semibold">SportClub</span>
        <span style={{ width: 40 }} />
      </div>

      <div className={`sc-backdrop ${sidebarOpen ? "sc-open" : ""}`} onClick={closeSidebar} />

      <div className="d-flex">
        <aside
          className={`d-flex flex-column p-3 sc-sidebar ${sidebarOpen ? "sc-open" : ""}`}
          style={{ width: 220, backgroundColor: "#1f2e3a", color: "white" }}
        >
          <h5 className="mb-4 d-none d-md-block">SportClub</h5>
          <nav className="d-flex flex-column gap-1 flex-grow-1">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `text-decoration-none rounded px-3 py-2 ${
                    isActive ? "bg-info text-white" : "text-white-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-top pt-3 mt-3">
            <p className="small mb-2 text-white-50">{user?.full_name}</p>
            <Button variant="outline-light" size="sm" className="w-100" onClick={logout}>
              Cerrar sesión
            </Button>
          </div>
        </aside>

        <main className="flex-grow-1 p-4" style={{ backgroundColor: "#f8f9fa", minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
