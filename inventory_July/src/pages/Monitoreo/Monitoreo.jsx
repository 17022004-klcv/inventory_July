import { useState, useEffect } from 'react'
import './Monitoreo.css' 
import StatsRow from '../../components/StatsRow/StatsRow' 
import Table from '../../components/Table/Table'
import Modal from '../../components/Modal/Modal'

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

   const columnas = [
    { header: '#', render: (fila, i) => i + 1 },
    { header: 'Usuario', render: (fila) => fila.nombre_usuario || '—'   },
    { header: 'Fecha', render: (fila) => formatFecha(fila.fecha )},
    { header: 'Accion', render: (fila) => fila.accion },
    { header: 'Tabla', render: (fila) => fila.tabla_afectada },
    { header: 'Ip de Origen', render: (fila) => fila.ip_origen },
    { header: 'Detalle', render: (fila) => (
    <button className='btn-detalle' onClick={() => setLogDetalle(fila)}>Ver</button>
)}]

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
      <StatsRow estadisticas={estadisticas} />

      {/* Tabla */}
      <Table
        textBuscador="🔍 Buscar por tabla, acción o usuario..."
        columnas={columnas}
        datos={logsFiltrados}
        cargando={cargando}
        filtros={
        <select className="select-filtro" value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)}>
            <option value="Todas">Todas las acciones</option>
            <option value="INSERT">Inserción</option>
            <option value="UPDATE">Actualización</option>
            <option value="DELETE">Eliminación</option>
        </select>
    }
      >
        </Table>

      {/* Modal detxalle */}
      {logDetalle &&(
      <Modal
      titulo={'Detalle del Registro'}
      onClose={() => setLogDetalle(null)}>

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
      
        </Modal>

 )}
      
    </div>
  )
}