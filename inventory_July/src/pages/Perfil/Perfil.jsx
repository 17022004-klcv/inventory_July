import { useState } from "react";
import "./Perfil.css";

const API = import.meta.env.VITE_API_URL;

export default function PerfilView({ usuario, onActualizarUsuario }) {
  const [formData, setFormData] = useState({
    nombre_usuario: usuario?.nombre_usuario || "",
    apellido_usuario: usuario?.apellido_usuario || "",
    telefono_usuario: usuario?.telefono_usuario || "",
    correo_usuario: usuario?.correo_usuario || "",
    username: usuario?.username || "",
    password: "",
    password_confirmation: "",
  });

  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [guardando, setGuardando] = useState(false);

  // 🌟 FUNCIÓN EXTRA: Formatea el teléfono automáticamente (Ej: 7777-8888)
  const formatearTelefonoInput = (valor) => {
    // Deja solo los números
    const soloNumeros = valor.replace(/\D/g, "");

    // Si tiene más de 4 dígitos, le mete el guion automáticamente
    if (soloNumeros.length > 4) {
      return `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4, 8)}`;
    }
    return soloNumeros;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🌟 Si está escribiendo en el teléfono, lo formateamos en tiempo real
    if (name === "telefono_usuario") {
      setFormData({ ...formData, [name]: formatearTelefonoInput(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ tipo: "", texto: "" });

    // 🌟 VALIDACIÓN 1: Validar campos vacíos (Por si acaso)
    if (
      !formData.nombre_usuario.trim() ||
      !formData.apellido_usuario.trim() ||
      !formData.correo_usuario.trim() ||
      !formData.username.trim()
    ) {
      setMensaje({
        tipo: "error",
        texto: "Todos los campos obligatorios deben estar llenos.",
      });
      setGuardando(false);
      return;
    }

    // 🌟 VALIDACIÓN 2: Validar formato de Correo Electrónico mediante Expresión Regular
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(formData.correo_usuario)) {
      setMensaje({
        tipo: "error",
        texto: "Por favor, introduce un correo electrónico válido.",
      });
      setGuardando(false);
      return;
    }

    // 🌟 VALIDACIÓN 3: Validar longitud mínima del teléfono si se ingresó
    if (formData.telefono_usuario && formData.telefono_usuario.length < 9) {
      // 8 números + 1 guion = 9 caracteres
      setMensaje({
        tipo: "error",
        texto: "El número de teléfono debe tener 8 dígitos.",
      });
      setGuardando(false);
      return;
    }

    if (
      formData.password &&
      formData.password !== formData.password_confirmation
    ) {
      setMensaje({ tipo: "error", texto: "Las contraseñas no coinciden." });
      setGuardando(false);
      return;
    }

    try {
      const idUsuario = usuario?.id_usuario;

      const res = await fetch(`${API}/perfil/${idUsuario}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje({ tipo: "exito", texto: "¡Perfil actualizado con éxito!" });
        setEditando(false);
        setFormData((prev) => ({
          ...prev,
          password: "",
          password_confirmation: "",
        }));
        if (onActualizarUsuario) onActualizarUsuario(data.user);
      } else {
        setMensaje({
          tipo: "error",
          texto: data.errors ? Object.values(data.errors)[0][0] : data.message,
        });
      }
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: "Error de conexión con el servidor.",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="perfil-page">
      <div className="perfil-card">
        <div className="perfil-header">
          <div className="perfil-avatar">
            {formData.nombre_usuario.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="perfil-nombre">
              {formData.nombre_usuario} {formData.apellido_usuario}
            </h2>
            <p className="perfil-rol">Usuario del Sistema</p>
          </div>

          {!editando && (
            <button
              className="btn-accion-editar"
              onClick={() => setEditando(true)}
              title="Editar perfil"
            >
              <i className="bi bi-pencil-fill"></i>
            </button>
          )}
        </div>

        {mensaje.texto && (
          <div className={`perfil-alerta alerta-${mensaje.tipo}`}>
            <i
              className={`bi ${mensaje.tipo === "exito" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"}`}
            ></i>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="perfil-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={handleChange}
                disabled={!editando}
                required
              />
            </div>

            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido_usuario"
                value={formData.apellido_usuario}
                onChange={handleChange}
                disabled={!editando}
                required
              />
            </div>

            <div className="form-group">
              <label>Nombre de Usuario (Username)</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!editando}
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="text"
                name="telefono_usuario"
                value={formData.telefono_usuario}
                onChange={handleChange}
                disabled={!editando}
                placeholder="0000-0000"
                maxLength={9} // Evita que escriban de más
              />
            </div>

            <div className="form-group col-span-2">
              <label>Correo Electrónico</label>
              <input
                type="email"
                name="correo_usuario"
                value={formData.correo_usuario}
                onChange={handleChange}
                disabled={!editando}
                required
              />
            </div>

            {editando && (
              <>
                <div className="form-group">
                  <label>Nueva Contraseña (Opcional)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="form-group">
                  <label>Confirmar Contraseña</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          {editando && (
            <div className="perfil-form-acciones">
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => {
                  setEditando(false);
                  setMensaje({ tipo: "", texto: "" });
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-guardar"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
