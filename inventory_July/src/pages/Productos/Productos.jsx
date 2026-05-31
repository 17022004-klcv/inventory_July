import React, { useState, useEffect } from "react";
import "./Productos.css";
import Table from "../../components/Table/Table";
import Modal from "../../components/Modal/Modal";

const API = import.meta.env.VITE_API_URL;

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [modoVer, setModoVer] = useState(false); // Estado para la vista de detalles
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [form, setForm] = useState({
    id_producto: "",
    nombre_producto: "",
    id_categoria: "",
    stock: "",
    precio_unitario: "",
    precio_final: "",
    id_proveedor: "",
    activo: true,
    codigo_barras: "",
  });

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarProveedores();
  }, []);

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/productos`);
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("No se pudieron cargar los productos");
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const res = await fetch(`${API}/categorias`);
      const data = await res.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setCategorias([]);
    }
  };

  const cargarProveedores = async () => {
    try {
      const res = await fetch(`${API}/proveedores`);
      const data = await res.json();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
      setProveedores([]);
    }
  };

  const abrirModalNuevo = () => {
    setForm({
      id_producto: "",
      nombre_producto: "",
      id_categoria: "",
      stock: "",
      precio_unitario: "",
      precio_final: "",
      id_proveedor: "",
      activo: true,
      codigo_barras: "",
    });
    setModoEditar(false);
    setModoVer(false);
    setModalAbierto(true);
    setError("");
  };

  const abrirModalEditar = (p) => {
    if (!p) return;
    setForm({
      id_producto: p.id_producto || "",
      nombre_producto: p.nombre_producto || "",
      id_categoria: (p.id_categoria || "").toString(),
      stock: p.stock || "",
      precio_unitario: p.precio_unitario || "",
      precio_final: p.precio_final || "",
      id_proveedor: (p.id_proveedor || "").toString(),
      activo: p.activo !== undefined ? p.activo : true,
      codigo_barras: p.codigo_barras || "",
    });
    setModoEditar(true);
    setModoVer(false);
    setModalAbierto(true);
    setError("");
  };

  const abrirModalVer = (p) => {
    if (!p) return;
    setForm({
      id_producto: p.id_producto || "",
      nombre_producto: p.nombre_producto || "",
      id_categoria: (p.id_categoria || "").toString(),
      stock: p.stock || "",
      precio_unitario: p.precio_unitario || "",
      precio_final: p.precio_final || "",
      id_proveedor: (p.id_proveedor || "").toString(),
      activo: p.activo !== undefined ? p.activo : true,
      codigo_barras: p.codigo_barras || "",
    });
    setModoVer(true);
    setModoEditar(false);
    setModalAbierto(true);
    setError("");
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const mostrarExito = (msg) => {
    setExito(msg);
    setTimeout(() => setExito(""), 3000);
  };

  const guardar = async () => {
    if (
      !form.nombre_producto.trim() ||
      !form.id_categoria.toString().trim() ||
      !form.stock.toString().trim() ||
      !form.precio_unitario.toString().trim() ||
      !form.precio_final.toString().trim() ||
      !form.id_proveedor.toString().trim()
    ) {
      setError("Todos los campos marcados con * son obligatorios");
      return;
    }

    try {
      const url = modoEditar
        ? `${API}/productos/${form.id_producto}`
        : `${API}/productos`;
      const method = modoEditar ? "PUT" : "POST";

      const datosEnvio = {
        nombre_producto: form.nombre_producto,
        id_categoria: parseInt(form.id_categoria),
        id_proveedor: parseInt(form.id_proveedor),
        stock: parseInt(form.stock),
        precio_unitario: parseFloat(form.precio_unitario),
        precio_final: parseFloat(form.precio_final),
        activo: form.activo,
        codigo_barras: form.codigo_barras || null,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(datosEnvio),
      });

      if (res.ok) {
        cerrarModal();
        cargarProductos();
        mostrarExito(
          modoEditar
            ? "Producto actualizado correctamente."
            : "Producto creado correctamente.",
        );
      } else {
        const data = await res.json();
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          setError(`Errores: ${errorMessages}`);
        } else if (data.message) {
          setError(data.message);
        } else {
          setError("Error al guardar el producto.");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setError("No se pudo conectar con el servidor.");
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      const res = await fetch(`${API}/productos/${id}`, { method: "DELETE" });
      if (res.ok) {
        cargarProductos();
        mostrarExito("Producto eliminado correctamente.");
      } else {
        setError("Error al eliminar el producto.");
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    }
  };

  // Configuración de las columnas para <Table />
  const columnasConfig = [
    { header: "#", render: (p, index) => index + 1 },
    {
      header: "Nombre",
      searchValue: (p) => p.nombre_producto,
      render: (p) => p.nombre_producto || "-",
    },
    {
      header: "Categoría",
      searchValue: (p) => p.categoria?.nombre_categoria,
      render: (p) => p.categoria?.nombre_categoria || "-",
    },
    { header: "Stock", render: (p) => p.stock || 0 },
    {
      header: "Precio Final",
      render: (p) => `$${parseFloat(p.precio_final || 0).toFixed(2)}`,
    },
    {
      header: "Estado",
      render: (p) => (
        <span className={p.activo ? "badge-activo" : "badge-inactivo"}>
          {p.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Acciones",
      render: (p) => (
        <div className="acciones">
          <button
            className="btn-icon btn-ver"
            title="Ver detalles"
            onClick={() => abrirModalVer(p)}
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            className="btn-icon btn-editar"
            title="Editar"
            onClick={() => abrirModalEditar(p)}
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn-icon btn-eliminar"
            title="Eliminar"
            onClick={() => eliminar(p.id_producto)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  const obtenerTituloModal = () => {
    if (modoVer)
      return (
        <>
          <i className="bi bi-eye me-2"></i> Detalles del Producto
        </>
      );
    if (modoEditar)
      return (
        <>
          <i className="bi bi-pencil me-2"></i> Editar Producto
        </>
      );
    return (
      <>
        <i className="bi bi-plus-circle me-2"></i> Nuevo Producto
      </>
    );
  };

  return (
    <div className="pro__page">
      {/* Header */}
      <div className="pro__header">
        <div>
          <h1 className="pro__titulo">Productos</h1>
          <p className="pro__subtitulo">Gestiona los productos del sistema</p>
        </div>
        <button className="btn-primario" onClick={abrirModalNuevo}>
          <i className="bi bi-plus-lg"></i> Nuevo Producto
        </button>
      </div>

      {/* Notificaciones */}
      {exito && (
        <div className="exito-box">
          <i className="bi bi-check-circle-fill"></i> {exito}
        </div>
      )}
      {error && !modalAbierto && (
        <div className="error-box">
          <i className="bi bi-exclamation-triangle-fill"></i> {error}
        </div>
      )}

      {/* Tabla Genérica Reutilizable */}
      <Table
        textBuscador="Buscar por nombre o categoría..."
        columnas={columnasConfig}
        datos={productos}
        cargando={cargando}
        filtros={<span className="conteo">{productos.length} totales</span>}
      />

      {/* Modal Genérico Reutilizable */}
      {modalAbierto && (
        <Modal titulo={obtenerTituloModal()} onClose={cerrarModal}>
          {error && (
            <div className="error-box">
              <i className="bi bi-exclamation-triangle-fill"></i> {error}
            </div>
          )}

          <div className="form-grid">
            {[
              {
                name: "nombre_producto",
                label: "Nombre *",
                placeholder: "Nombre del producto",
              },
              {
                name: "codigo_barras",
                label: "Código de Barras",
                placeholder: "Ej: 7501234567890",
              },
              {
                name: "stock",
                label: "Stock *",
                placeholder: "Cantidad en stock",
              },
              {
                name: "precio_unitario",
                label: "Precio Unitario *",
                placeholder: "0.00",
              },
              {
                name: "precio_final",
                label: "Precio Final *",
                placeholder: "0.00",
              },
            ].map((field) => (
              <div key={field.name} className="form-group">
                <label className="form-label">{field.label}</label>
                <input
                  className="form-input"
                  name={field.name}
                  placeholder={field.placeholder}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  disabled={modoVer} // Deshabilitado en vista de detalles
                />
              </div>
            ))}

            {/* Selector de Categoría */}
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select
                className="form-input"
                name="id_categoria"
                value={form.id_categoria}
                onChange={handleChange}
                disabled={modoVer}
              >
                <option value="">-- Selecciona una categoría --</option>
                {categorias.map((cat) =>
                  cat ? (
                    <option
                      key={cat.id_categoria}
                      value={cat.id_categoria.toString()}
                    >
                      {cat.nombre_categoria}
                    </option>
                  ) : null,
                )}
              </select>
            </div>

            {/* Selector de Proveedor */}
            <div className="form-group">
              <label className="form-label">Proveedor *</label>
              <select
                className="form-input"
                name="id_proveedor"
                value={form.id_proveedor}
                onChange={handleChange}
                disabled={modoVer}
              >
                <option value="">-- Selecciona un proveedor --</option>
                {proveedores.map((prov) =>
                  prov ? (
                    <option
                      key={prov.id_proveedor}
                      value={prov.id_proveedor.toString()}
                    >
                      {prov.nombre_proveedor}
                    </option>
                  ) : null,
                )}
              </select>
            </div>

            {/* Selector de Estado */}
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-input"
                name="activo"
                value={form.activo ? "true" : "false"}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    activo: e.target.value === "true",
                  }))
                }
                disabled={modoVer}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Footer de acción interna del modal (Oculto en modo ver) */}
          {!modoVer && (
            <div
              className="modal-actions-inline"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button className="btn-primario" onClick={guardar}>
                <i className="bi bi-save"></i>{" "}
                {modoEditar ? "Actualizar" : "Guardar"}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
