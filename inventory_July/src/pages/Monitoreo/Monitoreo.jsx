import { useState, useEffect } from 'react'
import './Monitoreo.css'  // Importamos los estilos

const API = 'http://127.0.0.1:8000/api'

const COLORES_ACCION = {
  INSERT:        { bg: '#dcfce7', color: '#16a34a', label: 'Inserción' },
  UPDATE:        { bg: '#fef9c3', color: '#ca8a04', label: 'Actualización' },
  DELETE:        { bg: '#fee2e2', color: '#dc2626', label: 'Eliminación' },
  LOGIN_EXITOSO: { bg: '#dbeafe', color: '#2563eb', label: 'Login Exitoso' },
  LOGIN_FALLIDO: { bg: '#fde8d8', color: '#ea580c', label: 'Login Fallido' },
}

const TABLAS = ['Todas', 'proveedores', 'categorias', 'clientes', 'ventas', 'usuarios']

export default function Monitoreo() {
  const [logs, setLogs] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTabla, setFiltroTabla] = useState('Todas')
  const [filtroAccion, setFiltroAccion] = useState('Todas')
  const [logDetalle, setLogDetalle] = useState(null)

  useEffect(() => {
    cargarLogs()
  }, [])

  const cargarLogs = async () => {
    setCargando(true)
    try {
      const res = await fetch(`${API}/monitoreo`)
      const data = await res.json()
      setLogs(data)
    } catch {
      setLogs([])
    } finally {
      setCargando(false)
    }
  }

  const logsFiltrados = logs.filter(log => {
    const coincideBusqueda =
      log.tabla_afectada?.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.accion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.nombre_usuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.ip_origen?.toLowerCase().includes(busqueda.toLowerCase())

    const coincideTabla = filtroTabla === 'Todas' || log.tabla_afectada === filtroTabla
    const coincideAccion = filtroAccion === 'Todas' || log.accion === filtroAccion

    return coincideBusqueda && coincideTabla && coincideAccion
  })

  const formatFecha = (fecha) => {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleString('es-SV', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  }

  const estadisticas = {
    total: logs.length,
    inserts: logs.filter(l => l.accion === 'INSERT').length,
    updates: logs.filter(l => l.accion === 'UPDATE').length,
    deletes: logs.filter(l => l.accion === 'DELETE').length,
  }

  return (
    <div className="monitoreo-page">
      {/* Header */}
      <div className="monitoreo-header">
        <div>
          <h1 className="monitoreo-titulo">Monitoreo del Sistema</h1>
          <p className="monitoreo-subtitulo">Registro de actividad y cambios en la base de datos</p>
        </div>
        <button className="btn-refresh" onClick={cargarLogs}>
          🔄 Actualizar
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{estadisticas.total}</div>
          <div className="stat-label">Total Registros</div>
        </div>
        <div className="stat-card stat-card-inserts">
          <div className="stat-num stat-num-inserts">{estadisticas.inserts}</div>
          <div className="stat-label">Inserciones</div>
        </div>
        <div className="stat-card stat-card-updates">
          <div className="stat-num stat-num-updates">{estadisticas.updates}</div>
          <div className="stat-label">Actualizaciones</div>
        </div>
        <div className="stat-card stat-card-deletes">
          <div className="stat-num stat-num-deletes">{estadisticas.deletes}</div>
          <div className="stat-label">Eliminaciones</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        {/* Filtros */}
        <div className="filtros-row">
          <input
            className="buscador"
            placeholder="🔍 Buscar por tabla, acción o usuario..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <select className="select-filtro" value={filtroTabla} onChange={e => setFiltroTabla(e.target.value)}>
            {TABLAS.map(t => <option key={t} value={t}>{t === 'Todas' ? 'Todas las tablas' : t}</option>)}
          </select>
          <select className="select-filtro" value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)}>
            <option value="Todas">Todas las acciones</option>
            <option value="INSERT">Inserción</option>
            <option value="UPDATE">Actualización</option>
            <option value="DELETE">Eliminación</option>
          </select>
          <span className="conteo">{logsFiltrados.length} registros</span>
        </div>

        {cargando ? (
          <div className="cargando">⏳ Cargando registros...</div>
        ) : (
          <div className="table-wrapper">
            <table className="tabla-monitoreo">
              <thead>
                <tr>
                  {['#', 'Fecha y Hora', 'Usuario', 'Acción', 'Tabla', 'IP Origen', 'Detalle'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="sin-datos">
                      No hay registros de actividad.
                    </td>
                  </tr>
                ) : (
                  logsFiltrados.map((log, i) => {
                    const accion = COLORES_ACCION[log.accion] || { bg: '#f1f5f9', color: '#475569', label: log.accion }
                    return (
                      <tr key={log.id_log} className="fila-log">
                        <td className="celda">{i + 1}</td>
                        <td className="celda">
                          <span className="fecha-texto">{formatFecha(log.fecha)}</span>
                        </td>
                        <td className="celda">
                          <div className="usuario-cell">
                            <div className="avatar-small">
                              {log.nombre_usuario?.charAt(0).toUpperCase() || '?'}
                            </div>
                            {log.nombre_usuario ? `${log.nombre_usuario} ${log.apellido_usuario || ''}` : `Usuario #${log.id_usuario}`}
                          </div>
                        </td>
                        <td className="celda">
                          <span className="badge" style={{ background: accion.bg, color: accion.color }}>
                            {accion.label}
                          </span>
                        </td>
                        <td className="celda">
                          <span className="tabla-chip">{log.tabla_afectada}</span>
                        </td>
                        <td className="celda">{log.ip_origen || '—'}</td>
                        <td className="celda">
                          <button className="btn-detalle" onClick={() => setLogDetalle(log)}>
                            Ver
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {logDetalle && (
        <div className="modal-overlay" onClick={() => setLogDetalle(null)}>
          <div className="modal-contenido" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-titulo">Detalle del Registro</h2>
              <button className="btn-cerrar" onClick={() => setLogDetalle(null)}>✕</button>
            </div>

            <div className="detalle-grid">
              <div className="detalle-item">
                <span className="detalle-label">Fecha</span>
                <span className="detalle-val">{formatFecha(logDetalle.fecha)}</span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">Acción</span>
                <span className="badge" style={{
                  background: COLORES_ACCION[logDetalle.accion]?.bg || '#f1f5f9',
                  color: COLORES_ACCION[logDetalle.accion]?.color || '#475569'
                }}>
                  {COLORES_ACCION[logDetalle.accion]?.label || logDetalle.accion}
                </span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">Tabla</span>
                <span className="tabla-chip">{logDetalle.tabla_afectada}</span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">IP Origen</span>
                <span className="detalle-val">{logDetalle.ip_origen || '—'}</span>
              </div>
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
        </div>
      )}
    </div>
  )
}