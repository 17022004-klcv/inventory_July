import { useState, useEffect } from "react";
import Table from "../../components/Table/Table";
import Modal from "../../components/Modal/Modal";
import "./Categorias.css";

const API = import.meta.env.VITE_API_URL;

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [modoVer, setModoVer] = useState(false); // Estado para la vista de detalles
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [form, setForm] = useState({
    id_categoria: null,
    nombre_categoria: "",
    activo: true,
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/categorias`);
      const data = await res.json();
      setCategorias(data);
    } catch {
      setError("No se pudieron cargar las categorías.");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setForm({ id_categoria: null, nombre_categoria: "", activo: true });
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
    if (!form.nombre_categoria.trim()) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }
    try {
      const url = modoEditar
        ? `${API}/categorias/${form.id_categoria}`
        : `${API}/categorias`;
      const method = modoEditar ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        cerrarModal();
        cargarCategorias();
        mostrarExito(
          modoEditar
            ? "Categoría actualizada correctamente."
            : "Categoría creada correctamente.",
        );
      } else {
        setError("Error al guardar la categoría.");
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar esta categoría?"))
      return;
    try {
      const res = await fetch(`${API}/categorias/${id}`, { method: "DELETE" });
      if (res.ok) {
        cargarCategorias();
        mostrarExito("Categoría eliminada correctamente.");
      }
    } catch {
      setError("No se pudo eliminar la categoría.");
    }
  };

  // Configuración de columnas para <Table />
  const columnasConfig = [
    { header: "#", render: (p, index) => index + 1 },
    {
      header: "Nombre",
      searchValue: (p) => p.nombre_categoria,
      render: (p) => p.nombre_categoria || "-",
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
            onClick={() => eliminar(p.id_categoria)}
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
          <i className="bi bi-eye me-2"></i> Detalles de la Categoría
        </>
      );
    if (modoEditar)
      return (
        <>
          <i className="bi bi-pencil me-2"></i> Editar Categoría
        </>
      );
    return (
      <>
        <i className="bi bi-plus-circle me-2"></i> Nueva Categoría
      </>
    );
  };

  return (
    <div className="cat__page">
      {/* Header */}
      <div className="cat__header">
        <div>
          <h1 className="cat__titulo">Categorías</h1>
          <p className="cat__subtitulo">Gestiona las categorías del sistema</p>
        </div>
        <button className="btn-primario" onClick={abrirModalNuevo}>
          <i className="bi bi-plus-lg"></i> Nueva Categoría
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

      {/* Tabla e Infraestructura Genérica */}
      <Table
        textBuscador="Buscar por nombre..."
        columnas={columnasConfig}
        datos={categorias}
        cargando={cargando}
        filtros={<span className="conteo">{categorias.length} totales</span>}
      />

      {/* Modal Reutilizable */}
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
                name: "nombre_categoria",
                label: "Nombre *",
                placeholder: "Nombre de la categoría",
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
                  disabled={modoVer} // Bloqueado si es modo detalles
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

          {/* Botón de envío inline (Oculto en modo visualización) */}
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
