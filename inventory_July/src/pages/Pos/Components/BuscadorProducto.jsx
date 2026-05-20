import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function BuscadorProducto({ onProductoSeleccionado }) {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);

  const buscarProducto = async (texto) => {
    setBusqueda(texto);
    if (texto.length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    try {
      const res = await fetch(`${API}/productos?buscar=${texto}`);
      const data = await res.json();
      setResultados(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch {
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  };

  const seleccionar = (producto) => {
    onProductoSeleccionado(producto);
    setBusqueda("");
    setResultados([]);
  };

  return (
    <div className="buscador-producto">
      <div className="buscador-input-wrapper">
        <input
          className="buscador-producto-input"
          placeholder="🔍 Buscar producto por nombre..."
          value={busqueda}
          onChange={(e) => buscarProducto(e.target.value)}
        />
        {buscando && <span className="buscando-mini">...</span>}
      </div>

      {resultados.length > 0 && (
        <div className="producto-resultados">
          {resultados.map((p) => (
            <div
              key={p.id_producto}
              className="producto-resultado-item"
              onClick={() => seleccionar(p)}
            >
              <span className="producto-res-nombre">{p.nombre_producto}</span>
              <span className="producto-res-precio">
                ${parseFloat(p.precio_final).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
