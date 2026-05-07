import { useState, useEffect } from 'react'
import './Clientes.css'  

const API = import.meta.env.VITE_API_URL

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEditar, setModoEditar] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [form, setForm] = useState({
    id_cliente: null,
    nombre_cliente: '',
    apellido_cliente: '',
    telefono_cliente: '',
    correo_cliente: '',
    activo: true,
  })

  useEffect(() => { cargarClientes() }, [])

  const cargarClientes = async () => {
    setCargando(true)
    try {
      const res = await fetch(`${API}/clientes`)
      const data = await res.json()
      setClientes(data)
    } catch {
      setError('No se pudo cargar los clientes.')
    } finally {
      setCargando(false)
    }
  }

  const abrirModalNuevo = () => {
    setForm({ id_cliente: null, nombre_cliente: '', apellido_cliente: '', telefono_cliente: '', correo_cliente: '', activo: true })
    setModoEditar(false)
    setModalAbierto(true)
    setError('')
  }

  const abrirModalEditar = (c) => {
    setForm(c)
    setModoEditar(true)
    setModalAbierto(true)
    setError('')
  }

  const cerrarModal = () => { setModalAbierto(false); setError('') }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const mostrarExito = (msg) => {
    setExito(msg)
    setTimeout(() => setExito(''), 3000)
  }

  const guardar = async () => {
    if (!form.nombre_cliente.trim()) return setError('El nombre es obligatorio.')
    if (!form.apellido_cliente.trim()) return setError('El apellido es obligatorio.')

    try {
      const url = modoEditar ? `${API}/clientes/${form.id_cliente}` : `${API}/clientes`
      const method = modoEditar ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        cerrarModal()
        cargarClientes()
        mostrarExito(modoEditar ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.')
      } else {
        const data = await res.json()
        setError(data.message || 'Error al guardar el cliente.')
      }
    } catch {
      setError('No se pudo conectar con el servidor.')
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Estás seguro que deseas eliminar este cliente?')) return
    try {
      const res = await fetch(`${API}/clientes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        cargarClientes()
        mostrarExito('Cliente eliminado correctamente.')
      }
    } catch {
      setError('No se pudo eliminar el cliente.')
    }
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.apellido_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.correo_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono_cliente?.toLowerCase().includes(busqueda.toLowerCase())
  )

  // Estadísticas rápidas
  const totalActivos = clientes.filter(c => c.activo).length
  const totalInactivos = clientes.filter(c => !c.activo).length

  return (
    <div className="clientes-page">
      {/* Header */}
      <div className="clientes-header">
        <div>
          <h1 className="clientes-titulo">Clientes</h1>
          <p className="clientes-subtitulo">Gestiona los clientes del sistema</p>
        </div>
        <button className="btn-primario" onClick={abrirModalNuevo}>
          + Nuevo Cliente
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

      {exito && <div className="exito-box">✓ {exito}</div>}
      {error && !modalAbierto && <div className="error-box">⚠ {error}</div>}

      {/* Tabla */}
      <div className="card">
        <div className="toolbar-row">
          <input
            className="buscador"
            placeholder="🔍 Buscar por nombre, correo o teléfono..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <span className="conteo">{clientesFiltrados.length} registros</span>
        </div>

        {cargando ? (
          <div className="cargando">Cargando clientes...</div>
        ) : (
          <div className="table-wrapper">
            <table className="tabla-clientes">
              <thead>
                <tr>
                  {['#', 'Cliente', 'Teléfono', 'Correo', 'Estado', 'F. Registro', 'Acciones'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr><td colSpan={7} className="sin-datos">No hay clientes registrados.</td></tr>
                ) : (
                  clientesFiltrados.map((c, i) => (
                    <tr key={c.id_cliente} className="fila-cliente">
                      <td>{i + 1}</td>
                      <td>
                        <div className="cliente-cell">
                          <div className="avatar-cliente">
                            {c.nombre_cliente?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="nombre-texto">{c.nombre_cliente} {c.apellido_cliente}</div>
                          </div>
                        </div>
                      </td>
                      <td>{c.telefono_cliente || '—'}</td>
                      <td>{c.correo_cliente || '—'}</td>
                      <td>
                        <span className={c.activo ? 'badge-activo' : 'badge-inactivo'}>
                          {c.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <span className="fecha-texto">
                          {c.fecha_registrocliente
                            ? new Date(c.fecha_registrocliente).toLocaleDateString('es-SV')
                            : '—'}
                        </span>
                      </td>
                      <td>
                        <div className="acciones">
                          <button className="btn-editar" onClick={() => abrirModalEditar(c)}>
                            ✏ Editar
                          </button>
                          <button className="btn-eliminar" onClick={() => eliminar(c.id_cliente)}>
                            🗑 Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-contenido" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-titulo">
                {modoEditar ? '✏ Editar Cliente' : '+ Nuevo Cliente'}
              </h2>
              <button className="btn-cerrar" onClick={cerrarModal}>✕</button>
            </div>

            {error && <div className="error-box">⚠ {error}</div>}

            <div className="form-grid">
              {[
                { name: 'nombre_cliente',   label: 'Nombre *',   placeholder: 'Nombre' },
                { name: 'apellido_cliente', label: 'Apellido *', placeholder: 'Apellido' },
                { name: 'telefono_cliente', label: 'Teléfono',   placeholder: 'Teléfono' },
                { name: 'correo_cliente',   label: 'Correo',     placeholder: 'correo@ejemplo.com' },
              ].map(field => (
                <div key={field.name} className="form-group">
                  <label className="form-label">{field.label}</label>
                  <input
                    className="form-input"
                    name={field.name}
                    placeholder={field.placeholder}
                    value={form[field.name] || ''}
                    onChange={handleChange}
                  />
                </div>
              ))}

              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  className="form-input"
                  name="activo"
                  value={form.activo}
                  onChange={e => setForm(prev => ({ ...prev, activo: e.target.value === 'true' }))}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
              <button className="btn-primario" onClick={guardar}>
                {modoEditar ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}