import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function BuscadorCliente({ onClienteSeleccionado }) {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const buscarCliente = async (texto) => {
    setBusqueda(texto);
    if (texto.length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    try {
      const res = await fetch(`${API}/clientes?buscar=${texto}`);
      const data = await res.json();
      setResultados(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch {
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  };

  const seleccionar = (cliente) => {
    setClienteSeleccionado(cliente);
    onClienteSeleccionado(cliente.id_cliente);
    setResultados([]);
    setBusqueda("");
  };

  const limpiar = () => {
    setClienteSeleccionado(null);
    onClienteSeleccionado(null);
    setBusqueda("");
    setResultados([]);
  };

  return (
    <div className="buscador-cliente">
      {clienteSeleccionado ? (
        <div className="cliente-seleccionado">
          <div className="cliente-info">
            <span className="cliente-icono">
              <i className="bi bi-person-fill"></i>
            </span>
            <div>
              <p className="cliente-nombre">
                {clienteSeleccionado.nombre_cliente}{" "}
                {clienteSeleccionado.apellido_cliente}
              </p>
              <p className="cliente-telefono">
                {clienteSeleccionado.telefono_cliente}
              </p>
            </div>
          </div>
          <button className="btn-limpiar-cliente" onClick={limpiar}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      ) : (
        <div className="cliente-contado">
          <div className="buscador-input-wrapper">
            <input
              className="buscador-cliente-input"
              placeholder="Buscar cliente o dejar como Contado"
              value={busqueda}
              onChange={(e) => buscarCliente(e.target.value)}
            />
            {buscando && <span className="buscando-mini">...</span>}
          </div>

          {resultados.length > 0 && (
            <div className="cliente-resultados">
              {resultados.map((c) => (
                <div
                  key={c.id_cliente}
                  className="cliente-resultado-item"
                  onClick={() => seleccionar(c)}
                >
                  <span>
                    {c.nombre_cliente} {c.apellido_cliente}
                  </span>
                  <span className="cliente-tel">{c.telefono_cliente}</span>
                </div>
              ))}
            </div>
          )}

          {busqueda.length === 0 && (
            <p className="cliente-contado-label">
              <i className="bi bi-person-fill me-1"></i> Cliente:{" "}
              <strong>Contado</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
