import { useState, useEffect } from "react";
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
    try {
      const res = await fetch(`${API}/backup/listar`);
      const data = await res.json();
      setBackups(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudieron cargar los backups");
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
        mostrarExito(`Backup creado: ${data.archivo}`);
        cargarBackups();
      } else {
        mostrarError(data.error || "Error al crear el backup");
      }
    } catch {
      mostrarError("No se pudo conectar con el servidor");
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
    } catch {
      mostrarError("Error al descargar el backup");
    }
  };

  const restaurarBackup = async (nombre) => {
    setRestaurando(nombre);
    setConfirmarRestaurar(null);
    try {
      const res = await fetch(`${API}/backup/restaurar/${nombre}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        mostrarExito("Base de datos restaurada correctamente");
      } else {
        mostrarError(data.error || "Error al restaurar");
      }
    } catch {
      mostrarError("No se pudo conectar con el servidor");
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
    } catch {
      mostrarError("No se pudo conectar con el servidor");
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

  return (
    <div className="backups-page">
      {/* Header */}
      <div className="backups-header">
        <div>
          <h1 className="backups-titulo">
            <i className="bi bi-database-fill-gear"></i> Backups
          </h1>
          <p className="backups-subtitulo">
            Gestiona las copias de seguridad de la base de datos
          </p>
        </div>
        <button
          className="btn-crear-backup"
          onClick={crearBackup}
          disabled={creando}
        >
          {creando ? (
            <>
              <span className="spinner-small"></span>
              Creando backup...
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle-fill"></i>
              Crear Backup
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

      {/* Info */}
      <div className="backup-info-box">
        <i className="bi bi-shield-lock-fill"></i>
        <p>
          Los backups están cifrados con AES-256. Solo pueden ser restaurados
          desde este sistema con la clave de cifrado correcta.
        </p>
      </div>

      {/* Modal confirmar restaurar */}
      {confirmarRestaurar && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <i className="bi bi-exclamation-triangle-fill confirm-icon"></i>
            <h3>¿Restaurar base de datos?</h3>
            <p>
              Esta acción reemplazará todos los datos actuales con los del
              backup:
            </p>
            <p className="confirm-nombre">{confirmarRestaurar}</p>
            <p className="confirm-advertencia">
              Esta acción no se puede deshacer.
            </p>
            <div className="confirm-botones">
              <button
                className="btn-cancelar"
                onClick={() => setConfirmarRestaurar(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-restaurar-confirm"
                onClick={() => restaurarBackup(confirmarRestaurar)}
              >
                Sí, restaurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de backups */}
      <div className="backups-card">
        <div className="backups-card-header">
          <h2 className="backups-card-titulo">
            <i className="bi bi-archive-fill"></i> Historial de Backups
          </h2>
          <span className="backups-conteo">
            {backups.length} backup{backups.length !== 1 ? "s" : ""}
          </span>
        </div>

        {cargando ? (
          <div className="backups-cargando">
            <div className="dash-spinner"></div>
            <p>Cargando backups...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="backups-vacio">
            <i className="bi bi-database-slash"></i>
            <p>No hay backups creados aún</p>
            <span>Crea tu primer backup con el botón de arriba</span>
          </div>
        ) : (
          <div className="tabla-wrapper">
            <table className="backups-tabla">
              <thead>
                <tr>
                  <th>
                    <i className="bi bi-file-earmark-zip"></i> Archivo
                  </th>
                  <th>
                    <i className="bi bi-calendar3"></i> Fecha
                  </th>
                  <th>
                    <i className="bi bi-hdd"></i> Tamaño
                  </th>
                  <th>
                    <i className="bi bi-shield-check"></i> Estado
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup, i) => (
                  <tr key={i}>
                    <td className="backup-nombre">
                      <i className="bi bi-file-earmark-lock2-fill"></i>
                      {backup.nombre}
                    </td>
                    <td className="backup-fecha">
                      {formatearFecha(backup.fecha)}
                    </td>
                    <td className="backup-tamanio">
                      {formatearTamanio(backup.tamanio)}
                    </td>
                    <td>
                      <span className="badge-cifrado">
                        <i className="bi bi-lock-fill"></i> Cifrado
                      </span>
                    </td>
                    <td>
                      <div className="backup-acciones">
                        <button
                          className="btn-descargar"
                          onClick={() => descargarBackup(backup.nombre)}
                          title="Descargar"
                        >
                          <i className="bi bi-download"></i>
                        </button>
                        <button
                          className="btn-restaurar"
                          onClick={() => setConfirmarRestaurar(backup.nombre)}
                          disabled={restaurando === backup.nombre}
                          title="Restaurar"
                        >
                          {restaurando === backup.nombre ? (
                            <span className="spinner-small"></span>
                          ) : (
                            <i className="bi bi-arrow-counterclockwise"></i>
                          )}
                        </button>
                        <button
                          className="btn-eliminar"
                          onClick={() => eliminarBackup(backup.nombre)}
                          disabled={eliminando === backup.nombre}
                          title="Eliminar"
                        >
                          {eliminando === backup.nombre ? (
                            <span className="spinner-small"></span>
                          ) : (
                            <i className="bi bi-trash3-fill"></i>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
