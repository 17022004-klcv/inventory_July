import { useState, useEffect } from "react";
import Table from "../../components/Table/Table";
import Modal from "../../components/Modal/Modal";
import "./Clientes.css";

const API = import.meta.env.VITE_API_URL;

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [modoVer, setModoVer] = useState(false); // Estado para la vista de detalles
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [form, setForm] = useState({
    id_cliente: null,
    nombre_cliente: "",
    apellido_cliente: "",
    telefono_cliente: "",
    correo_cliente: "",
    activo: true,
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/clientes`);
      const data = await res.json();
      setClientes(data);
    } catch {
      setError("No se pudo cargar los clientes.");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setForm({
      id_cliente: null,
      nombre_cliente: "",
      apellido_cliente: "",
      telefono_cliente: "",
      correo_cliente: "",
      activo: true,
    });
    setModoEditar(false);
    setModoVer(false);
    setModalAbierto(true);
    setError("");
  };

  const abrirModalEditar = (c) => {
    setForm(c);
    setModoEditar(true);
    setModoVer(false);
    setModalAbierto(true);
    setError("");
  };

  const abrirModalVer = (c) => {
    setForm(c);
    setModoVer(true);
    setModoEditar(false);
    setModalAbierto(true);
    setError("");
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setError("");
  };

  const formatearTelefonoInput = (valor) => {
    const soloNumeros = valor.replace(/\D/g, "");
    if (soloNumeros.length > 4) {
      return `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4, 8)}`;
    }
    return soloNumeros;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefono_cliente") {
      setForm((prev) => ({ ...prev, [name]: formatearTelefonoInput(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const mostrarExito = (msg) => {
    setExito(msg);
    setTimeout(() => setExito(""), 3000);
  };

  const guardar = async () => {
    if (!form.nombre_cliente.trim())
      return setError("El nombre es obligatorio.");
    if (!form.apellido_cliente.trim())
      return setError("El apellido es obligatorio.");

    try {
      const url = modoEditar
        ? `${API}/clientes/${form.id_cliente}`
        : `${API}/clientes`;
      const method = modoEditar ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        cerrarModal();
        cargarClientes();
        mostrarExito(
          modoEditar
            ? "Cliente actualizado correctamente."
            : "Cliente creado correctamente.",
        );
      } else {
        const data = await res.json();
        setError(data.message || "Error al guardar el cliente.");
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar este cliente?"))
      return;
    try {
      const res = await fetch(`${API}/clientes/${id}`, { method: "DELETE" });
      if (res.ok) {
        cargarClientes();
        mostrarExito("Cliente eliminado correctamente.");
      }
    } catch {
      setError("No se pudo eliminar el cliente.");
    }
  };

  // Configuración de columnas para <Table />
  const columnasConfig = [
    { header: "#", render: (p, index) => index + 1 },
    {
      header: "Cliente",
      searchValue: (c) => `${c.nombre_cliente} ${c.apellido_cliente}`,
      render: (c) => (
        <div className="cliente-cell">
          <div className="avatar-cliente">
            {c.nombre_cliente?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="nombre-texto">
              {c.nombre_cliente} {c.apellido_cliente}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Teléfono",
      searchValue: (c) => c.telefono_cliente,
      render: (c) => c.telefono_cliente || "—",
    },
    {
      header: "Correo",
      searchValue: (c) => c.correo_cliente,
      render: (c) => c.correo_cliente || "—",
    },
    {
      header: "Estado",
      render: (c) => (
        <span className={c.activo ? "badge-activo" : "badge-inactivo"}>
          {c.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "F. Registro",
      render: (c) => (
        <span className="fecha-texto">
          {c.fecha_registrocliente
            ? new Date(c.fecha_registrocliente).toLocaleDateString("es-SV")
            : "—"}
        </span>
      ),
    },
    {
      header: "Acciones",
      render: (c) => (
        <div className="acciones">
          <button
            className="btn-icon btn-ver"
            title="Ver detalles"
            onClick={() => abrirModalVer(c)}
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            className="btn-icon btn-editar"
            title="Editar"
            onClick={() => abrirModalEditar(c)}
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn-icon btn-eliminar"
            title="Eliminar"
            onClick={() => eliminar(c.id_cliente)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  // Cálculos estadísticos
  const totalActivos = clientes.filter((c) => c.activo).length;
  const totalInactivos = clientes.filter((c) => !c.activo).length;

  const obtenerTituloModal = () => {
    if (modoVer)
      return (
        <>
          <i className="bi bi-eye me-2"></i> Detalles del Cliente
        </>
      );
    if (modoEditar)
      return (
        <>
          <i className="bi bi-pencil me-2"></i> Editar Cliente
        </>
      );
    return (
      <>
        <i className="bi bi-plus-circle me-2"></i> Nuevo Cliente
      </>
    );
  };

  return (
    <div className="clientes-page">
      {/* Header */}
      <div className="clientes-header">
        <div>
          <h1 className="clientes-titulo">Clientes</h1>
          <p className="clientes-subtitulo">
            Gestiona los clientes del sistema
          </p>
        </div>
        <button className="btn-primario" onClick={abrirModalNuevo}>
          <i className="bi bi-plus-lg"></i> Nuevo Cliente
        </button>
      </div>

      {/* Tarjetas estadísticas */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{clientes.length}</div>
          <div className="stat-label">Total Clientes</div>
        </div>
        <div className="stat-card stat-card-activos">
          <div className="stat-num stat-num-activos">{totalActivos}</div>
          <div className="stat-label">Activos</div>
        </div>
        <div className="stat-card stat-card-inactivos">
          <div className="stat-num stat-num-inactivos">{totalInactivos}</div>
          <div className="stat-label">Inactivos</div>
        </div>
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

      {/* Tabla de Infraestructura Genérica */}
      <Table
        textBuscador="Buscar por nombre, correo o teléfono..."
        columnas={columnasConfig}
        datos={clientes}
        cargando={cargando}
        filtros={<span className="conteo">{clientes.length} registrados</span>}
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
                name: "nombre_cliente",
                label: "Nombre *",
                placeholder: "Nombre",
              },
              {
                name: "apellido_cliente",
                label: "Apellido *",
                placeholder: "Apellido",
              },
              {
                name: "telefono_cliente",
                label: "Teléfono",
                placeholder: "Teléfono",
              },
              {
                name: "correo_cliente",
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
                  disabled={modoVer} // Bloqueado si se encuentra en modo detalles
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

          {/* Acciones de guardado inline (Oculto si es inspección) */}
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
