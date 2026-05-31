import { useState, useCallback } from "react";
import EscanerCamara from "./components/EscanerCamara";
import Modal from "../../components/Modal/Modal";
import "./Pos.css";

const API = import.meta.env.VITE_API_URL;

export default function POS({ usuario }) {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [buscando, setBuscando] = useState(false);

  // Modales
  const [modalCliente, setModalCliente] = useState(false);
  const [modalProducto, setModalProducto] = useState(false);
  const [modalCobrar, setModalCobrar] = useState(false);
  const [escanerActivo, setEscanerActivo] = useState(false);

  // Cliente
  const [clientes, setClientes] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Productos
  const [productos, setProductos] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");

  // Cobro
  const [montoPagado, setMontoPagado] = useState("");

  // Cálculos sin IVA
  const total = items.reduce(
    (acc, item) => acc + item.precio_final * item.cantidad,
    0,
  );
  const cambio = parseFloat(montoPagado) - total;

  // ── Clientes ──
  const abrirModalCliente = async () => {
    setModalCliente(true);
    setBusquedaCliente("");
    try {
      const res = await fetch(`${API}/clientes`);
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch {
      setClientes([]);
    }
  };

  const buscarCliente = async (texto) => {
    setBusquedaCliente(texto);
    try {
      const res = await fetch(`${API}/clientes?buscar=${texto}`);
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch {
      setClientes([]);
    }
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setModalCliente(false);
  };

  // ── Productos ──
  const abrirModalProducto = async () => {
    setModalProducto(true);
    setBusquedaProducto("");
    try {
      const res = await fetch(`${API}/productos`);
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch {
      setProductos([]);
    }
  };

  const buscarProducto = async (texto) => {
    setBusquedaProducto(texto);
    try {
      const res = await fetch(`${API}/productos?buscar=${texto}`);
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch {
      setProductos([]);
    }
  };

  const agregarProducto = useCallback((producto) => {
    setItems((prev) => {
      const existe = prev.findIndex(
        (i) => i.id_producto === producto.id_producto,
      );
      if (existe >= 0) {
        const nuevos = [...prev];
        nuevos[existe].cantidad += 1;
        return nuevos;
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setModalProducto(false);
  }, []);

  // ── Escáner ──
  const manejarCodigo = useCallback(
    async (codigo) => {
      if (buscando) return;
      setBuscando(true);
      setEscanerActivo(false);
      try {
        const res = await fetch(`${API}/productos/barcode/${codigo}`);
        if (!res.ok) {
          setError(`Producto con código ${codigo} no encontrado`);
          setTimeout(() => setError(""), 3000);
          setEscanerActivo(true);
          return;
        }
        const producto = await res.json();
        agregarProducto(producto);
      } catch {
        setError("Error al buscar el producto");
        setTimeout(() => setError(""), 3000);
      } finally {
        setBuscando(false);
      }
    },
    [buscando, agregarProducto],
  );

  // ── Carrito ──
  const cambiarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    setItems((prev) => {
      const nuevos = [...prev];
      nuevos[index].cantidad = nuevaCantidad;
      return nuevos;
    });
  };

  const limpiarVenta = () => {
    setItems([]);
    setClienteSeleccionado(null);
    setMontoPagado("");
    setError("");
    setEscanerActivo(false);
  };

  // ── Procesar venta ──
  const procesarVenta = async () => {
    if (items.length === 0) return;
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${API}/pos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          id_cliente: clienteSeleccionado?.id_cliente || null,
          total_venta: total,
          items: items.map((item) => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio_final,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setExito(
          `Venta #${data.id_venta} procesada — Total: $${parseFloat(data.total).toFixed(2)}`,
        );
        limpiarVenta();
        setModalCobrar(false);
        setTimeout(() => setExito(""), 5000);
      } else {
        setError(data.error || "Error al procesar la venta");
      }
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pos-page">
      {/* Header */}
      <div className="pos-header">
        <div>
          <h1 className="pos-titulo">Punto de Venta</h1>
          <p className="pos-subtitulo">
            Cajero: {usuario?.nombre_usuario || usuario?.username}
          </p>
        </div>
        <button
          className={`btn-escaner ${escanerActivo ? "btn-escaner-activo" : ""}`}
          onClick={() => setEscanerActivo(!escanerActivo)}
        >
          <i
            className={
              escanerActivo
                ? "bi bi-camera-video-off-fill me-1"
                : "bi bi-camera-video-fill me-1"
            }
          ></i>
          {escanerActivo ? "Detener Cámara" : "Activar Cámara"}
        </button>
      </div>

      {exito && (
        <div className="exito-box">
          <i className="bi bi-check-circle-fill me-1"></i> {exito}
        </div>
      )}
      {error && (
        <div className="error-box">
          <i className="bi bi-exclamation-triangle-fill me-1"></i> {error}
        </div>
      )}

      <div className="pos-contenido">
        {/* Columna izquierda */}
        <div className="pos-izquierda">
          {/* Botones acción */}
          <div className="pos-acciones">
            <button className="btn-accion" onClick={abrirModalCliente}>
              <i className="bi bi-person-fill me-1"></i> Cliente
              {clienteSeleccionado && (
                <span className="badge-cliente">
                  {clienteSeleccionado.nombre_cliente}
                </span>
              )}
            </button>
            <button className="btn-accion" onClick={abrirModalProducto}>
              <i className="bi bi-search me-1"></i> Producto
            </button>
            <button
              className="btn-accion btn-cobrar-accion"
              onClick={() => setModalCobrar(true)}
              disabled={items.length === 0}
            >
              <i className="bi bi-cash-coin me-1"></i> Cobrar
            </button>
          </div>

          {/* Escáner */}
          {escanerActivo && (
            <div className="card">
              <h2 className="card-titulo">
                <i className="bi bi-camera-video-fill me-1"></i> Escáner
              </h2>
              <EscanerCamara
                onCodigoDetectado={manejarCodigo}
                activo={escanerActivo}
              />
              {buscando && (
                <p className="buscando-texto">Buscando producto...</p>
              )}
            </div>
          )}

          {/* Tabla de items */}
          <div className="card">
            <div className="carrito-header">
              <h2 className="card-titulo">
                <i className="bi bi-cart-fill me-1"></i> Items
              </h2>
              {items.length > 0 && (
                <button className="btn-limpiar" onClick={limpiarVenta}>
                  Limpiar
                </button>
              )}
            </div>

            <div className="carrito-tabla-wrapper">
              <table className="carrito-tabla">
                <thead>
                  <tr>
                    <th>N° Item</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="carrito-vacio">
                        <i className="bi bi-box-seam me-1"></i> Agrega productos
                        para comenzar
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => {
                      const subtotalItem = item.precio_final * item.cantidad;
                      return (
                        <tr key={index}>
                          <td className="celda-id">{item.id_producto}</td>
                          <td className="carrito-nombre">
                            {item.nombre_producto}
                          </td>
                          <td className="carrito-cantidad-cel">
                            <div className="carrito-item-controles">
                              <button
                                className="btn-cantidad"
                                onClick={() =>
                                  cambiarCantidad(index, item.cantidad - 1)
                                }
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <span className="carrito-item-cantidad">
                                {item.container || item.cantidad}
                              </span>
                              <button
                                className="btn-cantidad"
                                onClick={() =>
                                  cambiarCantidad(index, item.cantidad + 1)
                                }
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </td>
                          <td className="carrito-precio">
                            ${parseFloat(item.precio_final).toFixed(2)}
                          </td>
                          <td className="carrito-subtotal">
                            ${subtotalItem.toFixed(2)}
                          </td>
                          <td>
                            <button
                              className="btn-eliminar-item"
                              onClick={() => cambiarCantidad(index, 0)}
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            {items.length > 0 && (
              <div className="pos-totales">
                <div className="total-fila total-final">
                  <span>TOTAL:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal Cliente ── */}
      {modalCliente && (
        <Modal
          titulo={
            <>
              <i className="bi bi-person-fill me-1"></i> Seleccionar Cliente
            </>
          }
          onClose={() => setModalCliente(false)}
        >
          <input
            className="modal-buscador"
            placeholder="Buscar por nombre o teléfono..."
            value={busquedaCliente}
            onChange={(e) => buscarCliente(e.target.value)}
            autoFocus
          />
          <div className="modal-lista">
            <div
              className="modal-item modal-item-contado"
              onClick={() => {
                setClienteSeleccionado(null);
                setModalCliente(false);
              }}
            >
              <span>
                <i className="bi bi-person-fill me-1"></i> Cliente Contado
              </span>
              {!clienteSeleccionado && (
                <span className="badge-seleccionado">
                  <i className="bi bi-check-lg"></i>
                </span>
              )}
            </div>
            {clientes.map((c) => (
              <div
                key={c.id_cliente}
                className={`modal-item ${clienteSeleccionado?.id_cliente === c.id_cliente ? "modal-item-activo" : ""}`}
                onClick={() => seleccionarCliente(c)}
              >
                <div>
                  <p className="modal-item-nombre">
                    {c.nombre_cliente} {c.apellido_cliente}
                  </p>
                  <p className="modal-item-sub">
                    {c.telefono_cliente} · {c.correo_cliente}
                  </p>
                </div>
                {clienteSeleccionado?.id_cliente === c.id_cliente && (
                  <span className="badge-seleccionado">
                    <i className="bi bi-check-lg"></i>
                  </span>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ── Modal Producto ── */}
      {modalProducto && (
        <Modal
          titulo={
            <>
              <i className="bi bi-search me-1"></i> Buscar Producto
            </>
          }
          onClose={() => setModalProducto(false)}
        >
          <input
            className="modal-buscador"
            placeholder="Buscar por nombre o código..."
            value={busquedaProducto}
            onChange={(e) => buscarProducto(e.target.value)}
            autoFocus
          />
          <div className="modal-lista">
            {productos.map((p) => (
              <div
                key={p.id_producto}
                className="modal-item"
                onClick={() => agregarProducto(p)}
              >
                <div>
                  <p className="modal-item-nombre">{p.nombre_producto}</p>
                  <p className="modal-item-sub">
                    Stock: {p.stock} · {p.categoria?.nombre_categoria}
                  </p>
                </div>
                <span className="modal-item-precio">
                  ${parseFloat(p.precio_final).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ── Modal Cobrar ── */}
      {modalCobrar && (
        <Modal
          titulo={
            <>
              <i className="bi bi-cash-coin me-1"></i> Confirmar Venta
            </>
          }
          onClose={() => setModalCobrar(false)}
        >
          <div className="cobrar-resumen">
            <div className="cobrar-fila">
              <span>Cliente:</span>
              <span>
                {clienteSeleccionado
                  ? `${clienteSeleccionado.nombre_cliente} ${clienteSeleccionado.apellido_cliente}`
                  : "Contado"}
              </span>
            </div>
            <div className="cobrar-fila cobrar-total">
              <span>TOTAL:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="cobrar-pago">
            <label className="cobrar-label">Monto recibido</label>
            <input
              className="cobrar-input"
              type="number"
              placeholder="$0.00"
              value={montoPagado}
              onChange={(e) => setMontoPagado(e.target.value)}
              autoFocus
            />
            {montoPagado && parseFloat(montoPagado) >= total && (
              <div className="cobrar-cambio">
                <span>Cambio:</span>
                <span className="cambio-valor">${cambio.toFixed(2)}</span>
              </div>
            )}
            {montoPagado && parseFloat(montoPagado) < total && (
              <p className="cobrar-error">
                <i className="bi bi-exclamation-triangle-fill me-1"></i> Monto
                insuficiente
              </p>
            )}
          </div>

          <button
            className="btn-confirmar-venta"
            onClick={procesarVenta}
            disabled={
              cargando || !montoPagado || parseFloat(montoPagado) < total
            }
          >
            {cargando ? (
              "Procesando..."
            ) : (
              <>
                <i className="bi bi-check-lg me-1"></i> Confirmar Venta
              </>
            )}
          </button>
        </Modal>
      )}
    </div>
  );
}
