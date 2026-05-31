export default function ResumenVenta({ items, onCobrar, cargando }) {
  const total = items.reduce(
    (acc, item) => acc + item.precio_final * item.cantidad,
    0,
  );
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
