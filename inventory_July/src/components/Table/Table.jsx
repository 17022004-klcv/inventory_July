import { useState } from 'react'
import './Table.css'

export default function Table({textBuscador, columnas, datos, cargando, filtros}){

    const [busqueda, setBusqueda] = useState('')
    const [paginaActual, setPaginaActual] = useState(1)
    const datosFiltrados = busqueda === '' ? datos : datos.filter(fila =>
    columnas.some(columna => 
        columna.searchValue?.(fila)?.toLowerCase().includes(busqueda.toLowerCase())
    )
)

    const registrosPorPagina = 10      
    const inicio = (paginaActual - 1) * registrosPorPagina
    const fin = inicio + registrosPorPagina
    const datosPaginados = datosFiltrados.slice(inicio, fin)
    const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina)

    
    return(
        <div className='card'>
            <div className='filtros-row'>
                <input
                className='buscador'
                placeholder={textBuscador}
                value={busqueda}
                onChange={e => {
                setBusqueda(e.target.value)
                setPaginaActual(1)}} />

                {filtros && filtros}

            </div>

            <div className='table-wrapper'>
                {cargando ? (
                    <div className="cargando">⏳ Cargando registros...</div>
                ) : (
                    <>
                    
                <table className='table'>
                    <thead>
                        <tr>
                            {columnas.map((columna, index) => (
                                <th key={index}>{columna.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                            {datosPaginados.map((fila, i) => (
                                <tr key={i} className='fila'>
                                    {columnas.map((columna, j) => (
                                        <td className='celda' key={j}>{columna.render(fila, i)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                </table>
                <div className='paginacion'>
                    <button 
                        onClick={() => setPaginaActual(p => p - 1)} 
                        disabled={paginaActual === 1}>
                        Anterior
                    </button>
                    
                    <span>{paginaActual} / {totalPaginas}</span>
                    
                    <button 
                        onClick={() => setPaginaActual(p => p + 1)} 
                        disabled={paginaActual === totalPaginas}>
                        Siguiente
                    </button>
                </div>
                </>
                )}
            </div>

        </div>
    )
}