import { useState, useEffect } from 'react'
import './Usuarios.css'  

const API = import.meta.env.VITE_API_URL
const ROLES = {
  1: { label: 'Administrador', bg: '#dbeafe', color: '#1d4ed8' },
  2: { label: 'Vendedor', bg: '#dcfce7', color: '#16a34a' },
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEditar, setModoEditar] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)
  const [form, setForm] = useState({
    id_usuario: null,
    nombre_usuario: '',
    apellido_usuario: '',
    telefono_usuario: '',
    correo_usuario: '',
    username: '',
    password_usuario: '',
    id_tipousuario: 2,
    activo: true,
  })

  useEffect(() => { cargarUsuarios() }, [])

  const cargarUsuarios = async () => {
    setCargando(true)
    try {
      const res = await fetch(`${API}/usuarios`)
      const data = await res.json()
      setUsuarios(data)
    } catch {
      setError('No se pudo cargar los usuarios.')
    } finally {
      setCargando(false)
    }
  }

  const abrirModalNuevo = () => {
    setForm({
      id_usuario: null, nombre_usuario: '', apellido_usuario: '',
      telefono_usuario: '', correo_usuario: '', username: '',
      password_usuario: '', id_tipousuario: 2, activo: true,
    })
    setModoEditar(false)
    setModalAbierto(true)
    setError('')
    setMostrarPass(false)
  }

  const abrirModalEditar = (u) => {
    setForm({ ...u, password_usuario: '' })
    setModoEditar(true)
    setModalAbierto(true)
    setError('')
    setMostrarPass(false)
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
    if (!form.nombre_usuario.trim()) return setError('El nombre es obligatorio.')
    if (!form.apellido_usuario.trim()) return setError('El apellido es obligatorio.')
    if (!form.correo_usuario.trim()) return setError('El correo es obligatorio.')
    if (!form.username.trim()) return setError('El username es obligatorio.')
    if (!modoEditar && !form.password_usuario.trim()) return setError('La contraseña es obligatoria.')

    try {
      const url = modoEditar ? `${API}/usuarios/${form.id_usuario}` : `${API}/usuarios`
      const method = modoEditar ? 'PUT' : 'POST'

      // Si editamos y no cambió la contraseña, no la enviamos
      const body = { ...form }
      if (modoEditar && !body.password_usuario) delete body.password_usuario

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        cerrarModal()
        cargarUsuarios()
        mostrarExito(modoEditar ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.')
      } else {
        const data = await res.json()
        setError(data.message || 'Error al guardar el usuario.')
      }
    } catch {
      setError('No se pudo conectar con el servidor.')
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Estás seguro que deseas eliminar este usuario?')) return
    try {
      const res = await fetch(`${API}/usuarios/${id}`, { method: 'DELETE' })
      if (res.ok) {
        cargarUsuarios()
        mostrarExito('Usuario eliminado correctamente.')
      }
    } catch {
      setError('No se pudo eliminar el usuario.')
    }
  }

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre_usuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.apellido_usuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.username?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo_usuario?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="usuarios-page">
      {/* Header */}
      <div className="usuarios-header">
        <div>
          <h1 className="usuarios-titulo">Usuarios</h1>
          <p className="usuarios-subtitulo">Gestiona los usuarios del sistema</p>
        </div>
        <button className="btn-primario" onClick={abrirModalNuevo}>
          + Nuevo Usuario
        </button>
      </div>

      {exito && <div className="exito-box">✓ {exito}</div>}
      {error && !modalAbierto && <div className="error-box">⚠ {error}</div>}

      {/* Tabla */}
      <div className="card">
        <div className="toolbar-row">
          <input
            className="buscador"
            placeholder="🔍 Buscar por nombre, username o correo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <span className="conteo">{usuariosFiltrados.length} registros</span>
        </div>

        {cargando ? (
          <div className="cargando">Cargando usuarios...</div>
        ) : (
          <div className="table-wrapper">
            <table className="tabla-usuarios">
              <thead>
                <tr>
                  {['#', 'Nombre completo', 'Username', 'Correo', 'Teléfono', 'Rol', 'Estado', 'F. Registro', 'Acciones'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="sin-datos">No hay usuarios registrados.</td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u, i) => {
                    const rol = ROLES[u.id_tipousuario] || { label: 'Desconocido', bg: '#f1f5f9', color: '#475569' }
                    return (
                      <tr key={u.id_usuario} className="fila-usuario">
                        <td className="celda">{i + 1}</td>
                        <td className="celda">
                          <div className="nombre-cell">
                            <div className="avatar-usuario">
                              {u.nombre_usuario?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="nombre-texto">{u.nombre_usuario} {u.apellido_usuario}</div>
                            </div>
                          </div>
                        </td>
                        <td className="celda">
                          <span className="username-chip">@{u.username}</span>
                        </td>
                        <td className="celda">{u.correo_usuario}</td>
                        <td className="celda">{u.telefono_usuario || '—'}</td>
                        <td className="celda">
                          <span className="badge" style={{ background: rol.bg, color: rol.color }}>
                            {rol.label}
                          </span>
                        </td>
                        <td className="celda">
                          <span className={u.activo ? 'badge-activo' : 'badge-inactivo'}>
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="celda">
                          <span className="fecha-texto">
                            {u.fecha_registrousuario
                              ? new Date(u.fecha_registrousuario).toLocaleDateString('es-SV')
                              : '—'}
                          </span>
                        </td>
                        <td className="celda">
                          <div className="acciones">
                            <button className="btn-editar" onClick={() => abrirModalEditar(u)}>
                              ✏ Editar
                            </button>
                            <button className="btn-eliminar" onClick={() => eliminar(u.id_usuario)}>
                              🗑 Eliminar
                            </button>
                          </div>
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

      {/* Modal */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-contenido" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-titulo">
                {modoEditar ? '✏ Editar Usuario' : '+ Nuevo Usuario'}
              </h2>
              <button className="btn-cerrar" onClick={cerrarModal}>✕</button>
            </div>

            {error && <div className="error-box">⚠ {error}</div>}

            <div className="form-grid">
              {[
                { name: 'nombre_usuario',   label: 'Nombre *',   placeholder: 'Nombre' },
                { name: 'apellido_usuario', label: 'Apellido *', placeholder: 'Apellido' },
                { name: 'correo_usuario',   label: 'Correo *',   placeholder: 'correo@ejemplo.com' },
                { name: 'telefono_usuario', label: 'Teléfono',   placeholder: 'Teléfono' },
                { name: 'username',         label: 'Username *', placeholder: 'usuario123' },
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

              {/* Contraseña solo al crear */}
              {!modoEditar && (
                <div className="form-group">
                  <label className="form-label">Contraseña *</label>
                  <div className="password-wrapper">
                    <input
                      className="form-input password-input"
                      name="password_usuario"
                      type={mostrarPass ? 'text' : 'password'}
                      placeholder="Contraseña"
                      value={form.password_usuario || ''}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setMostrarPass(!mostrarPass)}
                    >
                      {mostrarPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              )}

              {/* Rol */}
              <div className="form-group">
                <label className="form-label">Rol *</label>
                <select
                  className="form-input"
                  name="id_tipousuario"
                  value={form.id_tipousuario}
                  onChange={e => setForm(prev => ({ ...prev, id_tipousuario: parseInt(e.target.value) }))}
                >
                  <option value={1}>Administrador</option>
                  <option value={2}>Vendedor</option>
                </select>
              </div>

              {/* Estado */}
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