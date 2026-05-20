import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function EscanerCamara({ onCodigoDetectado, activo }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [error, setError] = useState("");
  const [camaras, setCamaras] = useState([]);
  const [camaraSeleccionada, setCamaraSeleccionada] = useState("");
  const [log, setLog] = useState([]); // 👈 para ver qué pasa

  const agregarLog = (msg) => {
    setLog((prev) => [...prev, msg]);
  };

  useEffect(() => {
    agregarLog("Iniciando lector...");
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    // Primero pedir permiso, luego listar cámaras
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        agregarLog("Permiso de cámara concedido");
        return reader.listVideoInputDevices();
      })
      .then((dispositivos) => {
        agregarLog(`Cámaras encontradas: ${dispositivos.length}`);
        dispositivos.forEach((d) =>
          agregarLog(`- ${d.label || "sin label"} | id: ${d.deviceId}`),
        );
        setCamaras(dispositivos);

        const trasera = dispositivos.find((d) =>
          d.label.toLowerCase().includes("camera 0"),
        );
        const seleccionada =
          trasera?.deviceId || dispositivos[0]?.deviceId || "";
        agregarLog(`Seleccionada: ${seleccionada}`);
        setCamaraSeleccionada(seleccionada);
      })
      .catch((err) => {
        agregarLog(`Error: ${err.message}`);
        setError(`No se pudo acceder a la cámara: ${err.message}`);
      });

    return () => {
      reader.reset();
    };
  }, []);

  useEffect(() => {
    if (!activo || !camaraSeleccionada || !videoRef.current) {
      agregarLog(
        `No inicia: activo=${activo} camara=${camaraSeleccionada} video=${!!videoRef.current}`,
      );
      return;
    }

    agregarLog("Iniciando cámara...");
    const reader = readerRef.current;

    reader
      .decodeFromVideoDevice(
        camaraSeleccionada,
        videoRef.current,
        (resultado, err) => {
          if (resultado) {
            agregarLog(`Código detectado: ${resultado.getText()}`);
            onCodigoDetectado(resultado.getText());
          }
          if (err && err.name !== "NotFoundException") {
            agregarLog(`Error escáner: ${err.message}`);
          }
        },
      )
      .catch((err) => {
        agregarLog(`Error al iniciar cámara: ${err.message}`);
        setError(`Error: ${err.message}`);
      });

    return () => {
      reader.reset();
    };
  }, [activo, camaraSeleccionada]);

  return (
    <div className="escaner-container">
      {error && <p className="escaner-error">{error}</p>}

      {camaras.length > 0 && (
        <select
          className="escaner-select"
          value={camaraSeleccionada}
          onChange={(e) => {
            agregarLog(`Cambiando a: ${e.target.value}`);
            setCamaraSeleccionada(e.target.value);
          }}
        >
          {camaras.map((c) => (
            <option key={c.deviceId} value={c.deviceId}>
              {c.label || `Cámara ${c.deviceId}`}
            </option>
          ))}
        </select>
      )}

      <div className="escaner-video-wrapper">
        <video ref={videoRef} className="escaner-video" />
        <div className="escaner-linea" />
      </div>

      {/* Log visible en pantalla */}
      <div
        style={{
          marginTop: "10px",
          background: "#1a1a1a",
          color: "#00ff00",
          padding: "10px",
          borderRadius: "8px",
          fontSize: "11px",
          maxHeight: "150px",
          overflowY: "auto",
        }}
      >
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}
