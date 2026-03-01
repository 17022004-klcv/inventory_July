export default function Dashboard({ onLogout }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700' }}>✅ ¡Bienvenido al sistema!</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)' }}>Aquí irá tu Dashboard de Inventario & POS</p>
      <button
        onClick={onLogout}
        style={{
          marginTop: '16px',
          padding: '10px 24px',
          background: '#2563eb',
          border: 'none',
          borderRadius: '10px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  )
}