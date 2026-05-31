export default function CarritoItems({ items, onEliminar, onCambiarCantidad }) {
  if (items.length === 0) {
    return (
      <div className="carrito-vacio">
        <p>
          <i className="bi bi-box-seam me-1"></i> Escanea o busca un producto
          para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="carrito-tabla-wrapper">
      <table className="carrito-tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio Unit.</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="carrito-nombre">{item.nombre_producto}</td>
              <td className="carrito-precio">
                ${parseFloat(item.precio_final).toFixed(2)}
              </td>
              <td className="carrito-cantidad-cel">
                <div className="carrito-item-controles">
                  <button
                    className="btn-cantidad"
                    onClick={() => onCambiarCantidad(index, item.cantidad - 1)}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <span className="carrito-item-cantidad">{item.cantidad}</span>
                  <button
                    className="btn-cantidad"
                    onClick={() => onCambiarCantidad(index, item.cantidad + 1)}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
              </td>
              <td className="carrito-subtotal">
                ${(item.precio_final * item.cantidad).toFixed(2)}
              </td>
              <td>
                <button
                  className="btn-eliminar-item"
                  onClick={() => onEliminar(index)}
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
