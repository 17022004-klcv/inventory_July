import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function EscanerCamara({ onCodigoDetectado, activo }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [error, setError] = useState("");
  const [camaras, setCamaras] = useState([]);
  const [camaraSeleccionada, setCamaraSeleccionada] = useState("");

  // 1. Inicializar lector y listar cámaras
  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    // VALIDACIÓN: Verificar si navigator.mediaDevices existe
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(
        "Tu navegador o entorno no soporta el acceso a la cámara (requiere HTTPS o localhost).",
      );
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        // Apagar los tracks de prueba inmediatamente para liberar el hardware
        stream.getTracks().forEach((track) => track.stop());
        return reader.listVideoInputDevices();
      })
      .then((dispositivos) => {
        setCamaras(dispositivos);
        if (dispositivos.length > 0) {
          // Buscar cámara trasera o usar la primera disponible
          const trasera = dispositivos.find(
            (d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("camera 0"),
          );
          setCamaraSeleccionada(trasera?.deviceId || dispositivos[0].deviceId);
        }
      })
      .catch((err) => {
        setError(`No se pudo acceder a la cámara: ${err.message}`);
      });

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, []);

  // 2. Controlar encendido y apagado del stream de decodificación
  useEffect(() => {
    if (!activo || !camaraSeleccionada || !videoRef.current) return;

    const reader = readerRef.current;

    // Pequeño timeout para asegurar que el nodo <video> ya exista en el DOM
    const t = setTimeout(() => {
      reader
        .decodeFromVideoDevice(
          camaraSeleccionada,
          videoRef.current,
          (resultado) => {
            if (resultado) {
              onCodigoDetectado(resultado.getText());
            }
          },
        )
        .catch((err) => {
          console.error(err);
          setError(`Error al iniciar transmisión: ${err.message}`);
        });
    }, 300);

    return () => {
      clearTimeout(t);
      reader.reset(); // Detiene la cámara limpia al desmontar o desactivar
    };
  }, [activo, camaraSeleccionada, onCodigoDetectado]);

  return (
    <div className="escaner-container">
      {error && <p className="escaner-error">{error}</p>}

      {camaras.length > 1 && (
        <select
          className="escaner-select"
          value={camaraSeleccionada}
          onChange={(e) => setCamaraSeleccionada(e.target.value)}
        >
          {camaras.map((c) => (
            <option key={c.deviceId} value={c.deviceId}>
              {c.label || `Cámara ${c.deviceId}`}
            </option>
          ))}
        </select>
      )}

      <div className="escaner-video-wrapper">
        <video
          ref={videoRef}
          className="escaner-video"
          style={{ width: "100%", borderRadius: "8px" }}
        />
        <div className="escaner-linea" />
      </div>
    </div>
  );
}
