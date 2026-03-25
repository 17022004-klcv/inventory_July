import { useState, useEffect } from 'react'
import './Proveedores.css' 

const API = 'http://127.0.0.1:8000/api'

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEditar, setModoEditar] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [form, setForm] = useState({
    id_proveedor: null,
    nombre_proveedor: '',
    direccion_proveedor: '',
    telefono_proveedor: '',
    correo_proveedor: '',
    activo: true,
  })

  useEffect(() => {
    cargarProveedores()
  }, [])

  const cargarProveedores = async () => {
    setCargando(true)
    try {
      const res = await fetch(`${API}/proveedores`)
      const data = await res.json()
      setProveedores(data)
    } catch {
      setError('No se pudo cargar los proveedores.')
    } finally {
      setCargando(false)
    }
  }

  const abrirModalNuevo = () => {
    setForm({ id_proveedor: null, nombre_proveedor: '', direccion_proveedor: '', telefono_proveedor: '', correo_proveedor: '', activo: true })
    setModoEditar(false)
    setModalAbierto(true)
    setError('')
  }

  const abrirModalEditar = (p) => {
    setForm(p)
    setModoEditar(true)
    setModalAbierto(true)
    setError('')
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setError('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const mostrarExito = (msg) => {
    setExito(msg)
    setTimeout(() => setExito(''), 3000)
  }

  const guardar = async () => {
    if (!form.nombre_proveedor.trim()) {
      setError('El nombre del proveedor es obligatorio.')
      return
    }
    try {
      const url = modoEditar ? `${API}/proveedores/${form.id_proveedor}` : `${API}/proveedores`
      const method = modoEditar ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        cerrarModal()
        cargarProveedores()
        mostrarExito(modoEditar ? 'Proveedor actualizado correctamente.' : 'Proveedor creado correctamente.')
      } else {
        setError('Error al guardar el proveedor.')
      }
    } catch {
      setError('No se pudo conectar con el servidor.')
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Estás seguro que deseas eliminar este proveedor?')) return
    try {
      const res = await fetch(`${API}/proveedores/${id}`, { method: 'DELETE' })
      if (res.ok) {
        cargarProveedores()
        mostrarExito('Proveedor eliminado correctamente.')
      }
    } catch {
      setError('No se pudo eliminar el proveedor.')
    }
  }

  const proveedoresFiltrados = proveedores.filter(p =>
    p.nombre_proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.correo_proveedor?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="proveedores-page">
      {/* Header */}
      <div className="proveedores-header">
        <div>
          <h1 className="proveedores-titulo">Proveedores</h1>
          <p className="proveedores-subtitulo">Gestiona los proveedores del sistema</p>
        </div>
        <button className="btn-primario" onClick={abrirModalNuevo}>
          + Nuevo Proveedor
        </button>
      </div>

      {/* Notificaciones */}
      {exito && <div className="exito-box">✓ {exito}</div>}
      {error && !modalAbierto && <div className="error-box">⚠ {error}</div>}

      {/* Buscador y tabla */}
      <div className="card">
        <div className="toolbar-row">
          <input
            className="buscador"
            placeholder="🔍 Buscar por nombre o correo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <span className="conteo">{proveedoresFiltrados.length} registros</span>
        </div>

        {cargando ? (
          <div className="cargando">Cargando proveedores...</div>
        ) : (
          <div className="table-wrapper">
            <table className="tabla-proveedores">
              <thead>
                <tr>
                  {['#', 'Nombre', 'Dirección', 'Teléfono', 'Correo', 'Estado', 'Acciones'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proveedoresFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="sin-datos">No hay proveedores registrados.</td>
                  </tr>
                ) : (
                  proveedoresFiltrados.map((p, i) => (
                    <tr key={p.id_proveedor} className="fila-proveedor">
                      <td className="celda">{i + 1}</td>
                      <td className="celda nombre-proveedor">{p.nombre_proveedor}</td>
                      <td className="celda">{p.direccion_proveedor || '—'}</td>
                      <td className="celda">{p.telefono_proveedor || '—'}</td>
                      <td className="celda">{p.correo_proveedor || '—'}</td>
                      <td className="celda">
                        <span className={p.activo ? 'badge-activo' : 'badge-inactivo'}>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="celda">
                        <div className="acciones">
                          <button className="btn-editar" onClick={() => abrirModalEditar(p)}>
                            ✏ Editar
                          </button>
                          <button className="btn-eliminar" onClick={() => eliminar(p.id_proveedor)}>
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
              <h2 className="modal-titulo">{modoEditar ? '✏ Editar Proveedor' : '+ Nuevo Proveedor'}</h2>
              <button className="btn-cerrar" onClick={cerrarModal}>✕</button>
            </div>

            {error && <div className="error-box">⚠ {error}</div>}

            <div className="form-grid">
              {[
                { name: 'nombre_proveedor', label: 'Nombre *', placeholder: 'Nombre del proveedor' },
                { name: 'direccion_proveedor', label: 'Dirección', placeholder: 'Dirección' },
                { name: 'telefono_proveedor', label: 'Teléfono', placeholder: 'Teléfono' },
                { name: 'correo_proveedor', label: 'Correo', placeholder: 'correo@ejemplo.com' },
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