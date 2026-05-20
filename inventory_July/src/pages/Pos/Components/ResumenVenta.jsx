export default function ResumenVenta({ items, onCobrar, cargando }) {
  const subtotal = items.reduce(
    (acc, item) => acc + item.precio_final * item.cantidad,
    0,
  );
  const iva = subtotal * 0.13;
  const total = subtotal + iva;
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="resumen-container">
      <div className="resumen-fila">
        <span>Productos:</span>
        <span>{totalItems}</span>
      </div>
      <div className="resumen-fila">
        <span>Items distintos:</span>
        <span>{items.length}</span>
      </div>
      <div className="resumen-fila">
        <span>Subtotal:</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="resumen-fila">
        <span>IVA (13%):</span>
        <span>${iva.toFixed(2)}</span>
      </div>
      <div className="resumen-total">
        <span>TOTAL</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <button
        className="btn-cobrar"
        onClick={() => onCobrar(total)}
        disabled={items.length === 0 || cargando}
      >
        {cargando ? "Procesando..." : `Cobrar $${total.toFixed(2)}`}
      </button>
    </div>
  );
}
