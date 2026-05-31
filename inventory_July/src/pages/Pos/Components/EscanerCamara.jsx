import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function EscanerCamara({ onCodigoDetectado, activo }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [error, setError] = useState("");
  const [camaras, setCamaras] = useState([]);
  const [camaraSeleccionada, setCamaraSeleccionada] = useState("");

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        return reader.listVideoInputDevices();
      })
      .then((dispositivos) => {
        setCamaras(dispositivos);

        const trasera = dispositivos.find((d) =>
          d.label.toLowerCase().includes("camera 0"),
        );
        const seleccionada =
          trasera?.deviceId || dispositivos[0]?.deviceId || "";
        setCamaraSeleccionada(seleccionada);
      })
      .catch((err) => {
        setError(`No se pudo acceder a la cámara: ${err.message}`);
      });

    return () => {
      reader.reset();
    };
  }, []);

  useEffect(() => {
    if (!activo || !camaraSeleccionada || !videoRef.current) {
      return;
    }

    const reader = readerRef.current;

    reader
      .decodeFromVideoDevice(
        camaraSeleccionada,
        videoRef.current,
        (resultado, err) => {
          if (resultado) {
            onCodigoDetectado(resultado.getText());
          }
        },
      )
      .catch((err) => {
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
        <video ref={videoRef} className="escaner-video" />
        <div className="escaner-linea" />
      </div>
    </div>
  );
}
