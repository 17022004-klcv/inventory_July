import { useState, useEffect } from "react";
import Table from "../../components/Table/Table";
import Modal from "../../components/Modal/Modal";
import "./Proveedores.css";

const API = import.meta.env.VITE_API_URL;

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [modoVer, setModoVer] = useState(false); // Estado para la vista de detalles
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [form, setForm] = useState({
    id_proveedor: null,
    nombre_proveedor: "",
    direccion_proveedor: "",
    telefono_proveedor: "",
    correo_proveedor: "",
    activo: true,
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/proveedores`);
      const data = await res.json();
      setProveedores(data);
    } catch {
      setError("No se pudo cargar los proveedores.");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setForm({
      id_proveedor: null,
      nombre_proveedor: "",
      direccion_proveedor: "",
      telefono_proveedor: "",
      correo_proveedor: "",
      activo: true,
    });
    setModoEditar(false);
    setModoVer(false);
    setModalAbierto(true);
    setError("");
  };

  const abrirModalEditar = (p) => {
    setForm(p);
    setModoEditar(true);
    setModoVer(false);
    setModalAbierto(true);
    setError("");
  };

  const abrirModalVer = (p) => {
    setForm(p);
    setModoVer(true);
    setModoEditar(false);
    setModalAbierto(true);
    setError("");
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const mostrarExito = (msg) => {
    setExito(msg);
    setTimeout(() => setExito(""), 3000);
  };

  const guardar = async () => {
    if (!form.nombre_proveedor.trim()) {
      setError("El nombre del proveedor es obligatorio.");
      return;
    }
    try {
      const url = modoEditar
        ? `${API}/proveedores/${form.id_proveedor}`
        : `${API}/proveedores`;
      const method = modoEditar ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        cerrarModal();
        cargarProveedores();
        mostrarExito(
          modoEditar
            ? "Proveedor actualizado correctamente."
            : "Proveedor creado correctamente.",
        );
      } else {
        setError("Error al guardar el proveedor.");
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar este proveedor?"))
      return;
    try {
      const res = await fetch(`${API}/proveedores/${id}`, { method: "DELETE" });
      if (res.ok) {
        cargarProveedores();
        mostrarExito("Proveedor eliminado correctamente.");
      }
    } catch {
      setError("No se pudo eliminar el proveedor.");
    }
  };

  // Configuración de las columnas para <Table />
  const columnasConfig = [
    { header: "#", render: (p, index) => index + 1 },
    {
      header: "Nombre",
      searchValue: (p) => p.nombre_proveedor,
      render: (p) => p.nombre_proveedor || "-",
    },
    { header: "Dirección", render: (p) => p.direccion_proveedor || "—" },
    { header: "Teléfono", render: (p) => p.telefono_proveedor || "—" },
    {
      header: "Correo",
      searchValue: (p) => p.correo_proveedor,
      render: (p) => p.correo_proveedor || "—",
    },
    {
      header: "Estado",
      render: (p) => (
        <span className={p.activo ? "badge-activo" : "badge-inactivo"}>
          {p.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Acciones",
      render: (p) => (
        <div className="acciones">
          <button
            className="btn-icon btn-ver"
            title="Ver detalles"
            onClick={() => abrirModalVer(p)}
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            className="btn-icon btn-editar"
            title="Editar"
            onClick={() => abrirModalEditar(p)}
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn-icon btn-eliminar"
            title="Eliminar"
            onClick={() => eliminar(p.id_proveedor)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  const obtenerTituloModal = () => {
    if (modoVer)
      return (
        <>
          <i className="bi bi-eye me-2"></i> Detalles del Proveedor
        </>
      );
    if (modoEditar)
      return (
        <>
          <i className="bi bi-pencil me-2"></i> Editar Proveedor
        </>
      );
    return (
      <>
        <i className="bi bi-plus-circle me-2"></i> Nuevo Proveedor
      </>
    );
  };

  return (
    <div className="proveedores-page">
      {/* Header */}
      <div className="proveedores-header">
        <div>
          <h1 className="proveedores-titulo">Proveedores</h1>
          <p className="proveedores-subtitulo">
            Gestiona los proveedores del sistema
          </p>
        </div>
        <button className="btn-primario" onClick={abrirModalNuevo}>
          <i className="bi bi-plus-lg"></i> Nuevo Proveedor
        </button>
      </div>

      {/* Notificaciones */}
      {exito && (
        <div className="exito-box">
          <i className="bi bi-check-circle-fill"></i> {exito}
        </div>
      )}
      {error && !modalAbierto && (
        <div className="error-box">
          <i className="bi bi-exclamation-triangle-fill"></i> {error}
        </div>
      )}

      {/* Tabla Genérica Reutilizable */}
      <Table
        textBuscador="Buscar por nombre o correo..."
        columnas={columnasConfig}
        datos={proveedores}
        cargando={cargando}
        filtros={<span className="conteo">{proveedores.length} totales</span>}
      />

      {/* Modal Genérico Reutilizable */}
      {modalAbierto && (
        <Modal titulo={obtenerTituloModal()} onClose={cerrarModal}>
          {error && (
            <div className="error-box">
              <i className="bi bi-exclamation-triangle-fill"></i> {error}
            </div>
          )}

          <div className="form-grid">
            {[
              {
                name: "nombre_proveedor",
                label: "Nombre *",
                placeholder: "Nombre del proveedor",
              },
              {
                name: "direccion_proveedor",
                label: "Dirección",
                placeholder: "Dirección",
              },
              {
                name: "telefono_proveedor",
                label: "Teléfono",
                placeholder: "Teléfono",
              },
              {
                name: "correo_proveedor",
                label: "Correo",
                placeholder: "correo@ejemplo.com",
              },
            ].map((field) => (
              <div key={field.name} className="form-group">
                <label className="form-label">{field.label}</label>
                <input
                  className="form-input"
                  name={field.name}
                  placeholder={field.placeholder}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  disabled={modoVer} // Campos bloqueados si es modo inspección
                />
              </div>
            ))}

            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-input"
                name="activo"
                value={form.activo ? "true" : "false"}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    activo: e.target.value === "true",
                  }))
                }
                disabled={modoVer}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Acciones de envío (Oculto en modo visualización) */}
          {!modoVer && (
            <div
              className="modal-actions-inline"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button className="btn-primario" onClick={guardar}>
                <i className="bi bi-save"></i>{" "}
                {modoEditar ? "Actualizar" : "Guardar"}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
