import { useEffect, useState } from "react";

const RISK_LABELS = {
  ALTO: { label: "Alto", color: "#A32D2D", bg: "#FCEBEB" },
  MEDIO: { label: "Medio", color: "#854F0B", bg: "#FAEEDA" },
  BAJO: { label: "Bajo", color: "#3B6D11", bg: "#EAF3DE" },
  NINGUNO: { label: "Ninguno", color: "#888780", bg: "#F1EFE8" },
};

export default function PasswordRiskDashboard() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/password-risks")
      .then((res) => res.json())
      .then((data) => {
        setRisks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const count = (level) => risks.filter((r) => r.risk_level === level).length;

  if (loading) return <p>Cargando análisis...</p>;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>
        Panel de riesgo de contraseñas
      </h2>
      <p style={{ color: "#888", fontSize: 13, marginBottom: "1.5rem" }}>
        Análisis según controles ISO 27001 — A.9.3 / A.9.4
      </p>

      {/* Tarjetas resumen */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
          marginBottom: "1.5rem",
        }}
      >
        {[
          ["Riesgo alto", "ALTO", "#A32D2D"],
          ["Riesgo medio", "MEDIO", "#854F0B"],
          ["Cumplen ISO", "NINGUNO", "#3B6D11"],
        ].map(([label, level, color]) => (
          <div
            key={level}
            style={{ background: "#f5f5f5", borderRadius: 8, padding: "1rem" }}
          >
            <p style={{ fontSize: 12, color: "#888", margin: "0 0 6px" }}>
              {label}
            </p>
            <p style={{ fontSize: 24, fontWeight: 500, color, margin: 0 }}>
              {count(level)}
            </p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
      >
        <thead>
          <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
            {[
              "Usuario",
              "Último acceso",
              "Nivel de riesgo",
              "Problema detectado",
            ].map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 12px",
                  fontWeight: 500,
                  fontSize: 12,
                  color: "#888",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {risks.map((r, i) => {
            const badge = RISK_LABELS[r.risk_level] ?? RISK_LABELS.NINGUNO;
            return (
              <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px" }}>{r.username}</td>
                <td style={{ padding: "12px", color: "#888" }}>
                  {new Date(r.fecha).toLocaleDateString()}
                </td>
                <td style={{ padding: "12px" }}>
                  <span
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      padding: "3px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {badge.label}
                  </span>
                </td>
                <td style={{ padding: "12px", color: "#555", fontSize: 13 }}>
                  {r.issues?.[0] ?? "Cumple todos los controles"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
