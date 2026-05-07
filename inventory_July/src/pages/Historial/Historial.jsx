import { useState, useEffect } from "react";
import "./Historial.css";
import StatsRow from "../../components/StatsRow/StatsRow";
import Table from "../../components/Table/Table";
import Modal from "../../components/Modal/Modal";

const API = import.meta.env.VITE_API_URL

const COLORES_ACCION = {
  Entrada: { bg: "#dcfce7", color: "#16a34a", label: "Entrada" },
  Salida: { bg: "#fee2e2", color: "#dc2626", label: "Salida" },
  Ajuste: { bg: "#fef9c3", color: "#ca8a04", label: "Ajuste" },
};

export default function Historial() {
  const [logs, setLogs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroAccion, setFiltroAccion] = useState("Todas");
  const [logDetalle, setLogDetalle] = useState(null);

  const columnas = [
    { header: "#", render: (fila, i) => i + 1 },
    { header: "Fecha", render: (fila) => formatFecha(fila.fecha_movimiento) },
    { header: "Tipo", render: (fila) => fila.tipo_movimiento },
    { header: "Producto", render: (fila) => fila.nombre_producto },
    { header: "Cantidad", render: (fila) => fila.cantidad },
    {
      header: "Detalle",
      render: (fila) => (
        <button className="btn-detalle" onClick={() => setLogDetalle(fila)}>
          Ver
        </button>
      ),
    },
  ];

  useEffect(() => {
    cargarLogs();
  }, []);

  const cargarLogs = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/historial`);
      const data = await res.json();
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setCargando(false);
    }
  };

  const logsFiltrados = logs.filter((log) => {
    const coincideBusqueda =
      log.nombre_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      false ||
      log.tipo_movimiento?.toLowerCase().includes(busqueda.toLowerCase()) ||
      false ||
      log.cantidad?.toString().includes(busqueda) ||
      false;

    const coincideAccion =
      filtroAccion === "Todas" || log.tipo_movimiento === filtroAccion;

    return coincideBusqueda && coincideAccion;
  });

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleString("es-SV", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const estadisticas = {
    total: logs.length,
    inserts: logs.filter((l) => l.tipo_movimiento === "Entrada").length,
    updates: logs.filter((l) => l.tipo_movimiento === "Ajuste").length,
    deletes: logs.filter((l) => l.tipo_movimiento === "Salida").length,
  };

  return (
    <div className="his__page">
      {/* Header */}
      <div className="his__header">
        <div>
          <h1 className="his__titulo">Historial de Productos</h1>
          <p className="his__subtitulo">
            Registro de actividad y cambios en productos
          </p>
        </div>
        <button className="btn-refresh" onClick={cargarLogs}>
          🔄 Actualizar
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <StatsRow estadisticas={estadisticas} />

      {/*Tabla*/}
      <Table
        textBuscador="🔍 Buscar por producto, tipo o cantidad..."
        columnas={columnas}
        datos={logsFiltrados}
        cargando={cargando}
        filtros={
          <select
            className="select-filtro"
            value={filtroAccion}
            onChange={(e) => setFiltroAccion(e.target.value)}
          >
            <option value="Todas">Todas las acciones</option>
            <option value="Entrada">Entrada</option>
            <option value="Salida">Salida</option>
            <option value="Ajuste">Ajuste</option>
          </select>
        }
      />

      {/* Modal detalle */}
      {logDetalle && (
        <Modal
          titulo={"Detalle del Registro"}
          onClose={() => setLogDetalle(null)}
        >
          <div className="detalle-grid">
            <div className="detalle-item">
              <span className="detalle-label">Fecha</span>
              <span className="detalle-val">
                {formatFecha(logDetalle.fecha_movimiento)}
              </span>
            </div>

            <div className="detalle-item">
              <span className="detalle-label">Acción</span>
              <span
                className="badge"
                style={{
                  background:
                    COLORES_ACCION[logDetalle.tipo_movimiento]?.bg || "#f1f5f9",
                  color:
                    COLORES_ACCION[logDetalle.tipo_movimiento]?.color ||
                    "#475569",
                }}
              >
                {COLORES_ACCION[logDetalle.tipo_movimiento]?.label ||
                  logDetalle.tipo_movimiento}
              </span>
            </div>

            <div className="detalle-item">
              <span className="detalle-label">Producto afectado</span>
              <span className="detalle-val">{logDetalle.nombre_producto}</span>
            </div>

            <div className="detalle-item">
              <span className="detalle-label">Cantidad</span>
              <span className="detalle-val">{logDetalle.cantidad}</span>
            </div>

            <div className="detalle-item">
              <span className="detalle-label">Vendido</span>
              <span className="detalle-val">
                {logDetalle.id_venta ? `#${logDetalle.id_venta}` : "—"}
              </span>
            </div>

            {logDetalle.detalle_json && (
              <div className="json-section">
                <div className="json-label">Datos del cambio:</div>
                <pre className="json-box">
                  {JSON.stringify(logDetalle.detalle_json, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
