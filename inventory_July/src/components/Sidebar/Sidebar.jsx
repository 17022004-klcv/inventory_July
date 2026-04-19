import { useState } from "react";
import "./Sidebar.css";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <i className="bi bi-grid-1x2-fill"></i>,
    roles: [1],
  },
  {
    id: "productos",
    label: "Productos",
    icon: <i className="bi bi-box-seam-fill"></i>,
    roles: [1],
    submenu: [
      {
        id: "lista-productos",
        label: "Lista de Productos",
        icon: <i className="bi bi-box-seam-fill"></i>,
        roles: [1],
      },
      {
        id: "categorias",
        label: "Categorías",
        icon: <i className="bi bi-list-task"></i>,
        roles: [1],
      },
    ],
  },
  {
    id: "proveedores",
    label: "Proveedores",
    icon: <i className="bi bi-truck"></i>,
    roles: [1],
  },
  {
    id: "clientes",
    label: "Clientes",
    icon: <i className="bi bi-people-fill"></i>,
    roles: [1],
  },
  {
    id: "ventas",
    label: "Ventas / POS",
    icon: <i className="bi bi-cart-fill"></i>,
    roles: [1],
  },
  {
    id: "usuarios",
    label: "Usuarios",
    icon: <i className="bi bi-person-fill"></i>,
    roles: [1],
  },
  {
    id: "historial",
    label: "Historial de Productos",
    icon: <i className="bi bi-clock-history"></i>,
    roles: [1],
  },
  {
    id: "monitoreo",
    label: "Monitoreo",
    icon: <i className="bi bi-shield-exclamation"></i>,
    roles: [1],
  },
];

export default function Sidebar({
  paginaActual,
  onNavegar,
  onLogout,
  usuario,
}) {
  const [productosAbierto, setProductosAbierto] = useState(false);
  const rol = usuario?.id_tipousuario;

  const itemVisibles = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(rol),
  );

  const handleNavItem = (item) => {
    if (item.submenu) {
      setProductosAbierto(!productosAbierto);
    } else {
      onNavegar(item.id);
    }
  };

  return (
    <aside className="sidebar">
      {/* Header del sidebar */}
      <div className="sidebar-header">
        <div className="logo-box">
          <span className="logo-icon">▣</span>
        </div>
        <div>
          <div className="logo-text">Julio's Sistem</div>
          <div className="logo-sub">Sistema de Gestión</div>
        </div>
      </div>

      <div className="divider" />

      {/* Navegación */}
      <nav className="nav">
        <div className="nav-label">MENÚ PRINCIPAL</div>
        {itemVisibles.map((item) => (
          <div key={item.id}>
            <button
              className={`nav-item ${paginaActual === item.id || (item.submenu && item.submenu.some((s) => s.id === paginaActual)) ? "nav-item-active" : ""}`}
              onClick={() => handleNavItem(item)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
              {item.submenu && (
                <span
                  className={`arrow ${productosAbierto ? "arrow-rotated" : ""}`}
                >
                  ›
                </span>
              )}
            </button>

            {/* Submenu de Productos */}
            {item.submenu && productosAbierto && (
              <div className="submenu">
                {item.submenu.map((sub) => (
                  <button
                    key={sub.id}
                    className={`sub-item ${paginaActual === sub.id ? "sub-item-active" : ""}`}
                    onClick={() => onNavegar(sub.id)}
                  >
                    <span className="nav-icon">{sub.icon}</span>
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer del sidebar */}
      <div className="sidebar-footer">
        <div className="divider" />
        <div className="footer-content">
          {/* Perfil */}
          <button className="footer-btn" title="Ver perfil">
            <div className="avatar">
              {usuario ? usuario.nombre_usuario?.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-info">
              <div className="user-name">
                {usuario ? `${usuario.nombre_usuario}` : "Usuario"}
              </div>
              <div className="user-role">Ver perfil</div>
            </div>
          </button>

          {/* Cerrar sesión */}
          <button
            className="logout-btn"
            onClick={onLogout}
            title="Cerrar sesión"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
