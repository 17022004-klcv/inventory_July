import { useState, useEffect } from "react";
// Cambiar el import
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./DashboardHome.css";

const API = import.meta.env.VITE_API_URL;

export default function DashboardHome({ usuario }) {
  const [stats, setStats] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [clientesFrecuentes, setClientesFrecuentes] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);
  const [vencimientos, setVencimientos] = useState({
    criticos: [],
    advertencias: [],
  });
  const [periodoVentas, setPeriodoVentas] = useState("semana");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarTodo();
  }, []);

  useEffect(() => {
    cargarVentas();
  }, [periodoVentas]);

  const cargarTodo = async () => {
    setCargando(true);
    try {
      const [statsRes, clientesRes, stockRes, vencRes] = await Promise.all([
        fetch(`${API}/dashboard/stats`),
        fetch(`${API}/dashboard/clientes-frecuentes`),
        fetch(`${API}/dashboard/stock-bajo`),
        fetch(`${API}/dashboard/vencimientos`),
      ]);
      const [statsData, clientesData, stockData, vencData] = await Promise.all([
        statsRes.json(),
        clientesRes.json(),
        stockRes.json(),
        vencRes.json(),
      ]);
      setStats(statsData);
      setClientesFrecuentes(Array.isArray(clientesData) ? clientesData : []);
      setStockBajo(Array.isArray(stockData) ? stockData : []);
      setVencimientos(vencData);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setCargando(false);
    }
  };

  const cargarVentas = async () => {
    try {
      const res = await fetch(
        `${API}/dashboard/ventas?periodo=${periodoVentas}`,
      );
      const data = await res.json();
      setVentas(Array.isArray(data) ? data : []);
    } catch {
      setVentas([]);
    }
  };

  const totalAlertas =
    stockBajo.length +
    vencimientos.criticos.length +
    vencimientos.advertencias.length;

  if (cargando) {
    return (
      <div className="dash-cargando">
        <div className="dash-spinner" />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-titulo">Dashboard</h1>
          <p className="dash-subtitulo">
            Bienvenido, {usuario?.nombre_usuario || usuario?.username} 👋
          </p>
        </div>
        <span className="dash-fecha">
          {new Date().toLocaleDateString("es-SV", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* ── Stats Cards ── */}
      <div className="dash-cards">
        <div className="stat-card stat-blue">
          <div className="stat-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-info">
            <p className="stat-label">Clientes</p>
            <p className="stat-valor">{stats?.total_clientes ?? 0}</p>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon">
            <i className="bi bi-person-badge-fill"></i>
          </div>
          <div className="stat-info">
            <p className="stat-label">Empleados</p>
            <p className="stat-valor">{stats?.total_usuarios ?? 0}</p>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">
            <i className="bi bi-box-seam-fill"></i>
          </div>
          <div className="stat-info">
            <p className="stat-label">Productos</p>
            <p className="stat-valor">{stats?.total_productos ?? 0}</p>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-icon">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="stat-info">
            <p className="stat-label">Ventas hoy</p>
            <p className="stat-valor">
              ${parseFloat(stats?.ventas_hoy ?? 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Alertas ── */}
      {totalAlertas > 0 && (
        <div className="dash-alertas">
          <h2 className="dash-seccion-titulo">
            <i className="bi bi-bell-fill"></i> Alertas
            <span className="badge-alerta">{totalAlertas}</span>
          </h2>
          <div className="alertas-lista">
            {vencimientos.criticos.map((v) => (
              <div
                key={v.id_vencimiento}
                className="alerta-item alerta-critica"
              >
                <i className="bi bi-x-circle-fill alerta-icono"></i>
                <div>
                  <p className="alerta-titulo">
                    {v.producto?.nombre_producto} — Lote: {v.lote}
                  </p>
                  <p className="alerta-sub">
                    Vence el{" "}
                    {new Date(v.fecha_vencimiento).toLocaleDateString("es-SV")}{" "}
                    (menos de 7 días)
                  </p>
                </div>
              </div>
            ))}
            {vencimientos.advertencias.map((v) => (
              <div
                key={v.id_vencimiento}
                className="alerta-item alerta-advertencia"
              >
                <i className="bi bi-exclamation-triangle-fill alerta-icono"></i>
                <div>
                  <p className="alerta-titulo">
                    {v.producto?.nombre_producto} — Lote: {v.lote}
                  </p>
                  <p className="alerta-sub">
                    Vence el{" "}
                    {new Date(v.fecha_vencimiento).toLocaleDateString("es-SV")}{" "}
                    (menos de 30 días)
                  </p>
                </div>
              </div>
            ))}
            {stockBajo.map((p) => (
              <div key={p.id_producto} className="alerta-item alerta-stock">
                <i className="bi bi-box-seam alerta-icono"></i>
                <div>
                  <p className="alerta-titulo">{p.nombre_producto}</p>
                  <p className="alerta-sub">
                    Stock bajo: {p.stock} unidades restantes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Gráfica de ventas ── */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h2 className="dash-seccion-titulo">
            <i className="bi bi-bar-chart-fill"></i> Ventas
          </h2>{" "}
          <div className="periodo-tabs">
            {["semana", "mes", "anio"].map((p) => (
              <button
                key={p}
                className={`periodo-btn ${periodoVentas === p ? "periodo-activo" : ""}`}
                onClick={() => setPeriodoVentas(p)}
              >
                {p === "semana" ? "Semana" : p === "mes" ? "Mes" : "Año"}
              </button>
            ))}
          </div>
        </div>

        {ventas.length === 0 ? (
          <div className="dash-vacio">No hay ventas en este período</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={ventas}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                vertical={false}
              />
              <XAxis
                dataKey="periodo"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                formatter={(value) => [
                  `$${parseFloat(value).toFixed(2)}`,
                  "Total",
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.85rem",
                }}
                cursor={{ fill: "#f3f4f6" }}
              />
              <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Fila inferior: clientes + stock ── */}
      <div className="dash-fila-inferior">
        {/* Clientes frecuentes */}
        <div className="dash-card dash-card-grande">
          <div className="dash-card-header">
            <h2 className="dash-seccion-titulo">
              <i className="bi bi-trophy-fill"></i> Clientes Frecuentes
            </h2>
          </div>
          {clientesFrecuentes.length === 0 ? (
            <div className="dash-vacio">No hay datos de clientes aún</div>
          ) : (
            <div className="tabla-wrapper">
              <table className="dash-tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Compras</th>
                    <th>Total gastado</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesFrecuentes.map((c, i) => (
                    <tr key={c.id_cliente}>
                      <td>
                        <span className={`rank rank-${i + 1}`}>
                          {i === 0
                            ? "🥇"
                            : i === 1
                              ? "🥈"
                              : i === 2
                                ? "🥉"
                                : i + 1}
                        </span>
                      </td>
                      <td>
                        <p className="cliente-nombre-tabla">
                          {c.nombre_cliente} {c.apellido_cliente}
                        </p>
                        <p className="cliente-correo-tabla">
                          {c.correo_cliente}
                        </p>
                      </td>
                      <td>
                        <span className="badge-compras">{c.total_compras}</span>
                      </td>
                      <td className="total-gastado">
                        ${parseFloat(c.total_gastado).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stock bajo */}
        <div className="dash-card dash-card-chico">
          <h2 className="dash-seccion-titulo">
            <i className="bi bi-exclamation-circle-fill"></i> Stock Bajo
          </h2>
          {stockBajo.length === 0 ? (
            <div className="dash-vacio">
              ✅ Todos los productos tienen stock suficiente
            </div>
          ) : (
            <div className="stock-lista">
              {stockBajo.map((p) => (
                <div key={p.id_producto} className="stock-item">
                  <div>
                    <p className="stock-nombre">{p.nombre_producto}</p>
                    <p className="stock-categoria">
                      {p.categoria?.nombre_categoria}
                    </p>
                  </div>
                  <span
                    className={`stock-badge ${p.stock === 0 ? "stock-cero" : "stock-bajo"}`}
                  >
                    {p.stock === 0 ? "Agotado" : `${p.stock} uds`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
