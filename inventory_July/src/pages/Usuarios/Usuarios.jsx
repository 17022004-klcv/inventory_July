import { useState, useEffect } from "react";
import Table from "../../components/Table/Table";
import Modal from "../../components/Modal/Modal";
import "./Usuarios.css";

const API = import.meta.env.VITE_API_URL;
const ROLES = {
  1: { label: "Administrador", bg: "#dbeafe", color: "#1d4ed8" },
  2: { label: "Vendedor", bg: "#dcfce7", color: "#16a34a" },
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [modoVer, setModoVer] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [form, setForm] = useState({
    id_usuario: null,
    nombre_usuario: "",
    apellido_usuario: "",
    telefono_usuario: "",
    correo_usuario: "",
    username: "",
    password_usuario: "",
    id_tipousuario: 2,
    activo: true,
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/usuarios`);
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setUsuarios(data);
      setError("");
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError(`No se pudo cargar los usuarios: ${err.message}`);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setForm({
      id_usuario: null,
      nombre_usuario: "",
      apellido_usuario: "",
      telefono_usuario: "",
      correo_usuario: "",
      username: "",
      password_usuario: "",
      id_tipousuario: 2,
      activo: true,
    });
    setModoEditar(false);
    setModoVer(false);
    setModalAbierto(true);
    setError("");
    setMostrarPass(false);
  };

  const abrirModalEditar = (u) => {
    setForm({ ...u, password_usuario: "" });
    setModoEditar(true);
    setModoVer(false);
    setModalAbierto(true);
    setError("");
    setMostrarPass(false);
  };

  const abrirModalVer = (u) => {
    setForm(u);
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

    if (name === "telefono_usuario") {
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
    if (!form.nombre_usuario.trim())
      return setError("El nombre es obligatorio.");
    if (!form.apellido_usuario.trim())
      return setError("El apellido es obligatorio.");
    if (!form.correo_usuario.trim())
      return setError("El correo es obligatorio.");
    if (!form.username.trim()) return setError("El username es obligatorio.");
    if (!modoEditar && !form.password_usuario.trim())
      return setError("La contraseña es obligatoria.");

    try {
      const url = modoEditar
        ? `${API}/usuarios/${form.id_usuario}`
        : `${API}/usuarios`;
      const method = modoEditar ? "PUT" : "POST";

      const body = { ...form };
      if (modoEditar && !body.password_usuario) delete body.password_usuario;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        cerrarModal();
        cargarUsuarios();
        mostrarExito(
          modoEditar
            ? "Usuario actualizado correctamente."
            : "Usuario creado correctamente.",
        );
      } else {
        try {
          const data = await res.json();
          setError(
            data.error || data.message || "Error al guardar el usuario.",
          );
          console.error("Error response:", data);
        } catch (e) {
          setError(`Error ${res.status}: ${res.statusText}`);
          console.error("Error parsing response:", e);
        }
      }
    } catch (err) {
      setError(`No se pudo conectar con el servidor: ${err.message}`);
      console.error("Network error:", err);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar este usuario?"))
      return;
    try {
      const res = await fetch(`${API}/usuarios/${id}`, { method: "DELETE" });
      if (res.ok) {
        cargarUsuarios();
        mostrarExito("Usuario eliminado correctamente.");
      }
    } catch {
      setError("No se pudo eliminar el usuario.");
    }
  };

  const columnasConfig = [
    { header: "#", render: (u, index) => index + 1 },
    {
      header: "Nombre completo",
      searchValue: (u) => `${u.nombre_usuario} ${u.apellido_usuario}`,
      render: (u) => (
        <div className="nombre-cell">
          <div className="avatar-usuario">
            {u.nombre_usuario?.charAt(0).toUpperCase()}
          </div>
          <div className="nombre-texto">
            {u.nombre_usuario} {u.apellido_usuario}
          </div>
        </div>
      ),
    },

    {
      header: "Correo",
      searchValue: (u) => u.correo_usuario,
      render: (u) => u.correo_usuario,
    },
    {
      header: "Rol",
      render: (u) => {
        const rol = ROLES[u.id_tipousuario] || {
          label: "Desconocido",
          bg: "#f1f5f9",
          color: "#475569",
        };
        return (
          <span
            className="badge"
            style={{ background: rol.bg, color: rol.color }}
          >
            {rol.label}
          </span>
        );
      },
    },
    {
      header: "Estado",
      render: (u) => (
        <span className={u.activo ? "badge-activo" : "badge-inactivo"}>
          {u.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "F. Registro",
      render: (u) =>
        u.fecha_registrousuario
          ? new Date(u.fecha_registrousuario).toLocaleDateString("es-SV")
          : "—",
    },
    {
      header: "Acciones",
      render: (u) => (
        <div className="acciones">
          <button
            className="btn-icon btn-ver"
            title="Ver detalles"
            onClick={() => abrirModalVer(u)}
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            className="btn-icon btn-editar"
            title="Editar"
            onClick={() => abrirModalEditar(u)}
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn-icon btn-eliminar"
            title="Eliminar"
            onClick={() => eliminar(u.id_usuario)}
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
          <i className="bi bi-eye me-2"></i> Detalles del Usuario
        </>
      );
    if (modoEditar)
      return (
        <>
          <i className="bi bi-pencil me-2"></i> Editar Usuario
        </>
      );
    return (
      <>
        <i className="bi bi-plus-circle me-2"></i> Nuevo Usuario
      </>
    );
  };

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <div>
          <h1 className="usuarios-titulo">Usuarios</h1>
          <p className="usuarios-subtitulo">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <button className="btn-primario" onClick={abrirModalNuevo}>
          <i className="bi bi-plus-lg"></i> Nuevo Usuario
        </button>
      </div>

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

      <Table
        textBuscador="Buscar por nombre, username o correo..."
        columnas={columnasConfig}
        datos={usuarios}
        cargando={cargando}
        filtros={<span className="conteo">{usuarios.length} totales</span>}
      />

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
                name: "nombre_usuario",
                label: "Nombre *",
                placeholder: "Nombre",
              },
              {
                name: "apellido_usuario",
                label: "Apellido *",
                placeholder: "Apellido",
              },
              {
                name: "correo_usuario",
                label: "Correo *",
                placeholder: "correo@ejemplo.com",
              },
              {
                name: "telefono_usuario",
                label: "Teléfono",
                placeholder: "Teléfono",
              },
              {
                name: "username",
                label: "Username *",
                placeholder: "usuario123",
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
                  disabled={modoVer}
                />
              </div>
            ))}

            {!modoEditar && !modoVer && (
              <div className="form-group">
                <label className="form-label">Contraseña *</label>
                <div className="password-wrapper">
                  <input
                    className="form-input password-input"
                    name="password_usuario"
                    type={mostrarPass ? "text" : "password"}
                    placeholder="Contraseña"
                    value={form.password_usuario || ""}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setMostrarPass(!mostrarPass)}
                  >
                    <i
                      className={mostrarPass ? "bi bi-eye-slash" : "bi bi-eye"}
                    ></i>
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Rol *</label>
              <select
                className="form-input"
                name="id_tipousuario"
                value={form.id_tipousuario}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    id_tipousuario: parseInt(e.target.value),
                  }))
                }
                disabled={modoVer}
              >
                <option value={1}>Administrador</option>
                <option value={2}>Vendedor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-input"
                name="activo"
                value={form.activo}
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
