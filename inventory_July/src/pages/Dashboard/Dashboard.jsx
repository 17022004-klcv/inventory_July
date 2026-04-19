import { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Proveedores from "../Proveedores/Proveedores";
import Monitoreo from "../Monitoreo/Monitoreo";
import Usuarios from "../Usuarios/Usuarios";
import Clientes from "../Clientes/Clientes";
import Categorias from "../Categorias/Categorias";
import "./Dashboard.css";
import Productos from "../Productos/Productos";
import Historial from "../Historial/Historial";

// Páginas placeholder para las demás secciones
const Placeholder = ({ nombre }) => (
  <div className="placeholder-container">
    <div className="placeholder-icon">🚧</div>
    <h2 className="placeholder-titulo">{nombre}</h2>
    <p className="placeholder-texto">Esta sección está en desarrollo</p>
  </div>
);

export default function Dashboard({ onLogout, usuario }) {
  const [paginaActual, setPaginaActual] = useState("dashboard");
  const rol = usuario?.id_tipousuario;

  const renderPagina = () => {
    switch (paginaActual) {
      case "dashboard":
        return <Placeholder nombre="Dashboard" />;
      case "proveedores":
        return rol === 1 ? (
          <Proveedores />
        ) : (
          <Placeholder nombre="No autorizado" />
        );
      case "lista-productos":
        return rol === 1 ? (
          <Productos />
        ) : (
          <Placeholder nombre="No autorizado" />
        );
      case "categorias":
        return rol === 1 ? (
          <Categorias />
        ) : (
          <Placeholder nombre="No autorizado" />
        );
      case "clientes":
        return rol === 1 ? (
          <Clientes />
        ) : (
          <Placeholder nombre="No autorizado" />
        );
      case "ventas":
        return <Placeholder nombre="Ventas / POS" />;
      case "usuarios":
        return rol === 1 ? (
          <Usuarios />
        ) : (
          <Placeholder nombre="No autorizado" />
        );
      case "historial":
        return rol === 1 ? (
          <Historial />
        ) : (
          <Placeholder nombre="No autorizado" />
        );
      case "monitoreo":
        return rol === 1 ? (
          <Monitoreo />
        ) : (
          <Placeholder nombre="No autorizado" />
        );
      default:
        return <Placeholder nombre="Página no encontrada" />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar fijo */}
      <Sidebar
        paginaActual={paginaActual}
        onNavegar={setPaginaActual}
        onLogout={onLogout}
        usuario={usuario}
      />

      {/* Contenido principal con margen para el sidebar */}
      <main className="dashboard-main">{renderPagina()}</main>
    </div>
  );
}
