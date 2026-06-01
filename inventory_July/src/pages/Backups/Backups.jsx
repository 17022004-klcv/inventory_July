import { useState, useEffect } from "react";
import Table from "../../components/Table/Table";
import Modal from "../../components/Modal/Modal";
import "./Backups.css";

const API = import.meta.env.VITE_API_URL;

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [restaurando, setRestaurando] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [confirmarRestaurar, setConfirmarRestaurar] = useState(null);

  useEffect(() => {
    cargarBackups();
  }, []);

  const cargarBackups = async () => {
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${API}/backup/listar`);
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setBackups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando backups:", err);
      setError(`No se pudieron cargar los backups: ${err.message}`);
    } finally {
      setCargando(false);
    }
  };

  const mostrarExito = (msg) => {
    setExito(msg);
    setTimeout(() => setExito(""), 4000);
  };

  const mostrarError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  const crearBackup = async () => {
    setCreando(true);
    setError("");
    try {
      const res = await fetch(`${API}/backup/crear`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const msg = `Backup creado: ${data.archivo}\nTablas: ${data.cantidad_tablas}`;
        mostrarExito(msg);
        cargarBackups();
      } else {
        mostrarError(data.error || "Error al crear el backup");
      }
    } catch (err) {
      console.error("Error creando backup:", err);
      mostrarError(`No se pudo conectar con el servidor: ${err.message}`);
    } finally {
      setCreando(false);
    }
  };

  const descargarBackup = async (nombre) => {
    try {
      const res = await fetch(`${API}/backup/descargar/${nombre}`);
      if (!res.ok) {
        mostrarError("Error al descargar el backup");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombre.replace(".enc", "");
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando backup:", err);
      mostrarError("Error al descargar el backup");
    }
  };

  const restaurarBackup = async (nombre) => {
    setRestaurando(nombre);
    setConfirmarRestaurar(null);
    setError("");
    try {
      const res = await fetch(`${API}/backup/restaurar/${nombre}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        mostrarExito(data.mensaje || "Base de datos restaurada correctamente");
      } else {
        const errorMsg = data.error || "Error al restaurar";
        console.error("Error de restauración:", errorMsg);
        mostrarError(errorMsg);
      }
    } catch (err) {
      console.error("Error conectando:", err);
      mostrarError(`No se pudo conectar con el servidor: ${err.message}`);
    } finally {
      setRestaurando(null);
    }
  };

  const eliminarBackup = async (nombre) => {
    setEliminando(nombre);
    try {
      const res = await fetch(`${API}/backup/eliminar/${nombre}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        mostrarExito("Backup eliminado correctamente");
        cargarBackups();
      } else {
        mostrarError(data.error || "Error al eliminar");
      }
    } catch (err) {
      console.error("Error eliminando backup:", err);
      mostrarError("Error al eliminar el backup");
    } finally {
      setEliminando(null);
    }
  };

  const formatearTamanio = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatearFecha = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString("es-SV", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Configuración de columnas para <Table />
  const columnasConfig = [
    {
      header: "Archivo",
      searchValue: (b) => b.nombre,
      render: (b) => (
        <div className="backup-nombre">
          <i className="bi bi-file-earmark-lock2-fill"></i>
          {b.nombre}
        </div>
      ),
    },
    {
      header: "Fecha",
      render: (b) => (
        <span className="backup-fecha">{formatearFecha(b.fecha)}</span>
      ),
    },
    {
      header: "Tamaño",
      render: (b) => (
        <span className="backup-tamanio">{formatearTamanio(b.tamanio)}</span>
      ),
    },
    {
      header: "Estado",
      render: () => (
        <span className="badge-cifrado">
          <i className="bi bi-lock-fill"></i> Cifrado
        </span>
      ),
    },
    {
      header: "Acciones",
      render: (b) => (
        <div className="backup-acciones">
          <button
            className="btn-icon btn-descargar"
            onClick={() => descargarBackup(b.nombre)}
            title="Descargar"
          >
            <i className="bi bi-download"></i>
          </button>
          <button
            className="btn-icon btn-restaurar"
            onClick={() => setConfirmarRestaurar(b.nombre)}
            disabled={restaurando === b.nombre}
            title="Restaurar"
          >
            {restaurando === b.nombre ? (
              <span className="spinner-small"></span>
            ) : (
              <i className="bi bi-arrow-counterclockwise"></i>
            )}
          </button>
          <button
            className="btn-icon btn-eliminar"
            onClick={() => eliminarBackup(b.nombre)}
            disabled={eliminando === b.nombre}
            title="Eliminar"
          >
            {eliminando === b.nombre ? (
              <span className="spinner-small"></span>
            ) : (
              <i className="bi bi-trash"></i>
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="backups-page">
      {/* Header (Sin icono inicial en el título) */}
      <div className="backups-header">
        <div>
          <h1 className="backups-titulo">Backups</h1>
          <p className="backups-subtitulo">
            Gestiona las copias de seguridad de la base de datos
          </p>
        </div>
        <button
          className="btn-primario"
          onClick={crearBackup}
          disabled={creando}
        >
          {creando ? (
            <>
              <span className="spinner-small me-2"></span>
              Creando backup...
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle-fill"></i> Crear Backup
            </>
          )}
        </button>
      </div>

      {/* Notificaciones */}
      {exito && (
        <div className="exito-box">
          <i className="bi bi-check-circle-fill"></i> {exito}
        </div>
      )}
      {error && (
        <div className="error-box">
          <i className="bi bi-exclamation-triangle-fill"></i> {error}
        </div>
      )}

      {/* Caja Informativa de Seguridad */}
      <div className="backup-info-box">
        <i className="bi bi-shield-lock-fill"></i>
        <p>
          Los backups están cifrados con AES-256. Solo pueden ser restaurados
          desde este sistema con la clave de cifrado correcta.
        </p>
      </div>

      {/* Tabla Genérica Reutilizable */}
      <Table
        textBuscador="Buscar backup por nombre..."
        columnas={columnasConfig}
        datos={backups}
        cargando={cargando}
        filtros={
          <span className="conteo">
            {backups.length} backup{backups.length !== 1 ? "s" : ""} totales
          </span>
        }
      />

      {/* Modal Reutilizable para la Confirmación Crítica */}
      {confirmarRestaurar && (
        <Modal
          titulo={
            <>
              <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>{" "}
              Confirmar Restauración
            </>
          }
          onClose={() => setConfirmarRestaurar(null)}
        >
          <div
            className="confirm-box-content"
            style={{ textAlign: "center", padding: "10px" }}
          >
            <p style={{ fontSize: "0.95rem", marginBottom: "15px" }}>
              Esta acción reemplazará permanentemente todos los datos actuales
              con los del siguiente archivo de backup:
            </p>
            <p
              className="confirm-nombre"
              style={{
                fontWeight: "600",
                padding: "8px",
                background: "#f3f4f6",
                borderRadius: "6px",
              }}
            >
              {confirmarRestaurar}
            </p>
            <p
              className="confirm-advertencia"
              style={{ color: "#ef4444", fontWeight: "600", marginTop: "15px" }}
            >
              Esta acción no se puede deshacer y cerrará procesos activos.
            </p>

            <div
              className="modal-actions-inline"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "25px",
              }}
            >
              <button
                className="btn-cancelar"
                onClick={() => setConfirmarRestaurar(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-restaurar-confirm"
                style={{
                  background: "#f59e0b",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                onClick={() => restaurarBackup(confirmarRestaurar)}
              >
                Sí, restaurar base de datos
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
