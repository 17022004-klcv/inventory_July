import { useState, useEffect, use } from 'react'
import './Categorias.css';

const API = 'http://127.0.0.1:8000/api'

export default function Categorias(){

    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [form, setForm] = useState({
        id_categoria: null,
        nombre_categoria: '',
        activo: true,
    })

    useEffect(() => {
        cargarCategorias()
      }, [])
    
      const cargarCategorias = async () => {
        setCargando(true)
        try {
          const res = await fetch(`${API}/categorias`)
          const data = await res.json()
          setCategorias(data)
        } catch {
          setError('No se pudieron cargar las categorias.')
        } finally {
          setCargando(false)
        }
      }

      const abrirModalNuevo = () => {
    setForm({ id_categoria: null, nombre_categoria: '', activo: true })
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
    if (!form.nombre_categoria.trim()) {
      setError('El nombre de la categoria es obligatorio.')
      return
    }
    try {
      const url = modoEditar ? `${API}/categorias/${form.id_categoria}` : `${API}/categorias`
      const method = modoEditar ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        cerrarModal()
        cargarCategorias()
        mostrarExito(modoEditar ? 'Categoria actualizada correctamente.' : 'Categoria creada correctamente.')
      } else {
        setError('Error al guardar la categoria.')
      }
    } catch {
      setError('No se pudo conectar con el servidor.')
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Estás seguro que deseas eliminar esta categoria?')) return
    try {
      const res = await fetch(`${API}/categorias/${id}`, { method: 'DELETE' })
      if (res.ok) {
        cargarCategorias()
        mostrarExito('Categoria eliminada correctamente.')
      }
    } catch {
      setError('No se pudo eliminar la categoria.')
    }
  }

  const categoriasFiltradas = categorias.filter(p =>
    p.nombre_categoria?.toLowerCase().includes(busqueda.toLowerCase())
  )


    return(
            <div className='cat__page'>
                {/* Header */}
                <div className="cat__header">
                    <div>
                    <h1 className="cat__titulo">Categorias</h1>
                    <p className="cat__subtitulo">Gestiona las categorias del sistema</p>
                    </div>
                    <button className="btn-primario" onClick={abrirModalNuevo}>
                    + Nueva Categoria
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
            placeholder="🔍 Buscar por nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <span className="conteo">{categoriasFiltradas.length} registros</span>
        </div>

        {cargando ? (
          <div className="cargando">Cargando categorias...</div>
        ) : (
          <div className="table-wrapper">
            <table className="tabla-categorias">
              <thead>
                <tr>
                  {['#', 'Nombre', 'Estado', 'Acciones'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categoriasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="sin-datos">No hay categorias registradas.</td>
                  </tr>
                ) : (
                  categoriasFiltradas.map((p, i) => (
                    <tr key={p.id_categoria} className="fila-categoria">
                      <td className="celda">{i + 1}</td>
                      <td className="celda nombre-categoria">{p.nombre_categoria}</td>
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
                          <button className="btn-eliminar" onClick={() => eliminar(p.id_categoria)}>
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
              <h2 className="modal-titulo">{modoEditar ? '✏ Editar Categoria' : '+ Nueva Categoria'}</h2>
              <button className="btn-cerrar" onClick={cerrarModal}>✕</button>
            </div>

            {error && <div className="error-box">⚠ {error}</div>}

            <div className="form-grid">
              {[
                { name: 'nombre_categoria', label: 'Nombre *', placeholder: 'Nombre de la categoria' },
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
                  value={form.activo ? 'true' : 'false'}
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

    );
}