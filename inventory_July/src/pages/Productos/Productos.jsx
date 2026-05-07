import React, { useState, useEffect } from "react";
import './Productos.css'

const API = import.meta.env.VITE_API_URL
export default function Productos(){
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [form, setForm] = useState({
        id_producto: '',
        nombre_producto: '',
        id_categoria: '', 
        stock: '',
        precio_unitario: '',
        precio_final: '',
        id_proveedor: '',
        activo: true,
    })

    useEffect(() => {
        cargarProductos()
        cargarCategorias()
        cargarProveedores()
    },[])

    const cargarProductos = async() => {
        setCargando(true)
        try{
            const res = await fetch(`${API}/productos`)
            const data = await res.json()
            console.log('Productos cargados:', data)
            setProductos(Array.isArray(data) ? data : [])
        }catch(err){
            console.error('Error al cargar productos:', err)
            setError('No se pudieron cargar los productos')
            setProductos([])
        }finally{
            setCargando(false)
        }
    }

    const cargarCategorias = async() => {
        try{
            const res = await fetch(`${API}/categorias`)
            const data = await res.json()
            console.log('Categorías cargadas:', data)
            setCategorias(Array.isArray(data) ? data : [])
        }catch(err){
            console.error('Error al cargar categorías:', err)
            setError('No se pudieron cargar las categorías')
            setCategorias([])
        }
    }

    const cargarProveedores = async() => {
        try{
            const res = await fetch(`${API}/proveedores`)
            const data = await res.json()
            console.log('Proveedores cargados:', data)
            setProveedores(Array.isArray(data) ? data : [])
        }catch(err){
            console.error('Error al cargar proveedores:', err)
            setError('No se pudieron cargar los proveedores')
            setProveedores([])
        }
    }

    const abrirModalNuevo =() => {
        setForm({ id_producto: '',
        nombre_producto: '',
        id_categoria: '',
        stock: '',
        precio_unitario: '',
        precio_final: '',
        id_proveedor: '',
        activo: true, })
        setModoEditar(false)
        setModalAbierto(true)
        setError('')
    }

    const abrirModalEditar = (p) => {
        if (!p) return
        setForm({
            id_producto:     p.id_producto || '',
            nombre_producto: p.nombre_producto || '',
            id_categoria:    (p.id_categoria || '').toString(),
            stock:           p.stock || '',
            precio_unitario: p.precio_unitario || '',
            precio_final:    p.precio_final || '',
            id_proveedor:    (p.id_proveedor || '').toString(),
            activo:          p.activo !== undefined ? p.activo : true,
        })
        setModoEditar(true)
        setModalAbierto(true)
        setError('')
    }

    const cerrarModal = () => {
        setModalAbierto(false)
        setError('')
    }

    const handleChange = (e) => {
        const {name, value} = e.target
        setForm(prev => ({ ...prev, [name]: value}))
    }

    const mostrarExito = (msg) => {
        setExito(msg)
        setTimeout(() => setExito(''), 3000)
    }

    const guardar = async () => {
    if(!form.nombre_producto.trim() || 
    !form.id_categoria.toString().trim() ||
    !form.stock.toString().trim() ||
    !form.precio_unitario.toString().trim() ||
    !form.precio_final.toString().trim() ||
    !form.id_proveedor.toString().trim()){
        setError('Todos los campos son obligatorios')
        return
    }
    
    try{
        const url = modoEditar ? `${API}/productos/${form.id_producto}` : `${API}/productos`
        const method = modoEditar ? 'PUT' : 'POST'
        
        // Convertir tipos de datos correctamente
        const datosEnvio = {
            nombre_producto: form.nombre_producto,
            id_categoria: parseInt(form.id_categoria),
            id_proveedor: parseInt(form.id_proveedor),
            stock: parseInt(form.stock),
            precio_unitario: parseFloat(form.precio_unitario),
            precio_final: parseFloat(form.precio_final),
            activo: form.activo
        }
        
        const res = await fetch(url, {
            method,
             headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
    },
            body: JSON.stringify(datosEnvio)
        })
        if (res.ok) {
            cerrarModal()
            cargarProductos()
            mostrarExito(modoEditar ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.')
        } else {
            const data = await res.json()
            console.log('Error response:', data)
            
            // Mostrar errores de validación si existen
            if (data.errors) {
                const errorMessages = Object.values(data.errors).flat().join(', ')
                setError(`Errores: ${errorMessages}`)
            } else if (data.message) {
                setError(data.message)
            } else {
                setError('Error al guardar el producto.')
            }
        }
    } catch (err) {
        console.log('Error:', err)
        setError('No se pudo conectar con el servidor.')
    }
}

    const eliminar = async (id) =>{
        if(!window.confirm('¿Estás seguro de eliminar este producto?')) return
        try{
            const res = await fetch(`${API}/productos/${id}`, { method: 'DELETE' })
            if(res.ok){
                cargarProductos()
                mostrarExito('Producto eliminado correctamente.')
            } else {
                setError('Error al eliminar el producto.')
            }
        } catch {
            setError('No se pudo conectar con el servidor.')

        }
    }

    const productosFiltrados = productos && Array.isArray(productos) ? productos.filter(p => {
        if (!p) return false
        const nombre = (p.nombre_producto || '').toLowerCase()
        const categoria = (p.categoria?.nombre_categoria || '').toLowerCase()
        const busquedaLower = busqueda.toLowerCase()
        return nombre.includes(busquedaLower) || categoria.includes(busquedaLower)
    }) : []

    return(
            <div className='pro__page'>
                {/* Header */}
                <div className="pro__header">
                    <div>
                    <h1 className="pro__titulo">Productos</h1>
                    <p className="pro__subtitulo">Gestiona los productos del sistema</p>
                    </div>
                    <button className="btn-primario" onClick={abrirModalNuevo}>
                    + Nuevo Producto
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
          <span className="conteo">{productosFiltrados.length} registros</span>
        </div>

        {cargando ? (
          <div className="cargando">Cargando productos...</div>
        ) : (
          <div className="table-wrapper">
            <table className="tabla-productos">
              <thead>
                <tr>
                  {['#', 'Nombre', 'Categoría', 'Stock', 'Precio Final', 'Estado', 'Acciones'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="sin-datos">No hay productos registrados.</td>
                  </tr>
                ) : (
                  productosFiltrados.map((p, i) => (
                    <tr key={p?.id_producto || i} className="fila-producto">
                      <td className="celda">{i + 1}</td>
                      <td>{p?.nombre_producto || '-'}</td>
                      <td>{p?.categoria?.nombre_categoria || '-'}</td>  
                      <td className="celda">{p?.stock || 0}</td>
                      <td className="celda">${parseFloat(p?.precio_final || 0).toFixed(2)}</td>
                      <td className="celda">
                        <span className={p?.activo ? 'badge-activo' : 'badge-inactivo'}>
                          {p?.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="celda">
                        <div className="acciones">
                          <button className="btn-editar" onClick={() => abrirModalEditar(p)}>
                            ✏ Editar
                          </button>
                          <button className="btn-eliminar" onClick={() => eliminar(p?.id_producto)}>
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
              <h2 className="modal-titulo">{modoEditar ? '✏ Editar Producto' : '+ Nuevo Producto'}</h2>
              <button className="btn-cerrar" onClick={cerrarModal}>✕</button>
            </div>

            {error && <div className="error-box">⚠ {error}</div>}

            <div className="form-grid">
             {[
    { name: 'nombre_producto', label: 'Nombre *', placeholder: 'Nombre del producto' },
    { name: 'stock', label: 'Stock *', placeholder: 'Cantidad en stock' },
    { name: 'precio_unitario', label: 'Precio Unitario *', placeholder: '0.00' },
    { name: 'precio_final', label: 'Precio Final *', placeholder: '0.00' },
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
                <label className="form-label">Categoría *</label>
                <select
                  className="form-input"
                  name="id_categoria"
                  value={form.id_categoria}
                  onChange={handleChange}
                >
                  <option value="">-- Selecciona una categoría --</option>
                  {categorias && Array.isArray(categorias) && categorias.map(cat => cat ? (
                    <option key={cat?.id_categoria} value={(cat?.id_categoria || '').toString()}>
                      {cat?.nombre_categoria || 'Sin nombre'}
                    </option>
                  ) : null)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Proveedor *</label>
                <select
                  className="form-input"
                  name="id_proveedor"
                  value={form.id_proveedor}
                  onChange={handleChange}
                >
                  <option value="">-- Selecciona un proveedor --</option>
                  {proveedores && Array.isArray(proveedores) && proveedores.map(prov => prov ? (
                    <option key={prov?.id_proveedor} value={(prov?.id_proveedor || '').toString()}>
                      {prov?.nombre_proveedor || 'Sin nombre'}
                    </option>
                  ) : null)}
                </select>
              </div>

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