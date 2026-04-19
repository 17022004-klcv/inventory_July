import "./Modal.css";

export default function Modal({ titulo, onClose, children }) {
  return (
    <div className="mod__overlay" onClick={onClose}>
      <div className="mod__content" onClick={(e) => e.stopPropagation()}>
        <div className="mod__header">
          <h2 className="mod__titulo">{titulo}</h2>
          <button className="btn-cerrar" onClick={onClose}>
            X
          </button>
        </div>

        <div className="mod__body">{children}</div>
        <div className="mod__footer">
          <button className="btn-cancelar" onClick={onClose}>
            <i className="bi bi-x-circle"></i> Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
