import { useState } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import Proveedores from '../Proveedores/Proveedores'
import Monitoreo from '../Monitoreo/Monitoreo'
import Usuarios from '../Usuarios/Usuarios'
import Clientes from '../Clientes/Clientes'
import Categorias from '../Categorias/Categorias'
import './Dashboard.css'  
import Productos from '../Productos/Productos'

// Páginas placeholder para las demás secciones
const Placeholder = ({ nombre }) => (
  <div className="placeholder-container">
    <div className="placeholder-icon">🚧</div>
    <h2 className="placeholder-titulo">{nombre}</h2>
    <p className="placeholder-texto">Esta sección está en desarrollo</p>
  </div>
)

export default function Dashboard({ onLogout, usuario }) {
  const [paginaActual, setPaginaActual] = useState('dashboard')

  const renderPagina = () => {
    switch (paginaActual) {
      case 'dashboard':       return <Placeholder nombre="Dashboard" />
      case 'proveedores':     return <Proveedores />
      case 'lista-productos': return <Productos />
      case 'categorias':      return <Categorias/>
      case 'clientes':        return <Clientes />
      case 'ventas':          return <Placeholder nombre="Ventas / POS" />
      case 'usuarios':        return <Usuarios />
      case 'historial':       return <Placeholder nombre="Historial" />
      case 'monitoreo':       return <Monitoreo />
      default:                return <Placeholder nombre="Página no encontrada" />
    }
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar fijo */}
      <Sidebar
        paginaActual={paginaActual}
        onNavegar={setPaginaActual}
        onLogout={onLogout}
        usuario={usuario}
      />

      {/* Contenido principal con margen para el sidebar */}
      <main className="dashboard-main">
        {renderPagina()}
      </main>
    </div>
  )
}