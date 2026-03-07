import { useState } from 'react'
import logo from '../assets/img/logo.png'

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1b304e 0%, #0d2347 40%, #2980a9 100%)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
    top: '-100px',
    right: '-100px',
    pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
    bottom: '-80px',
    left: '-80px',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
    position: 'relative',
    zIndex: 1,
  },
  logoWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '36px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.3px',
    marginBottom: '4px',
  },
  logoSub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '6px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: '32px',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
    marginBottom: '28px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.97)',
    marginBottom: '8px',
    letterSpacing: '0.3px',
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: '20px',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255, 255, 255, 0.61)',
    fontSize: '16px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '13px 14px 13px 42px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #2980a9, #1d4ed8)',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.2s',
    letterSpacing: '0.3px',
    boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px',
    padding: '11px 14px',
    color: '#d52b2b',
    fontSize: '13px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '28px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.25)',
  }
}

export default function Login({ onLogin }) {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HOOKS — siempre van aquí arriba
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [inputFocus, setInputFocus] = useState('')

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FUNCIONES — también van aquí arriba
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!usuario || !contrasena) {
      setError('Por favor completa todos los campos.')
      return
    }

    setCargando(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usuario, password_usuario: contrasena })
      })

      const data = await response.json()

      if (response.ok) {
        if (onLogin) onLogin(data.usuario)
      } else {
        setError(data.error || 'Credenciales incorrectas.')
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  const getFocusStyle = (field) => ({
    ...styles.input,
    borderColor: inputFocus === field ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.1)',
    background: inputFocus === field ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.06)',
    boxShadow: inputFocus === field ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // JSX — todo lo visual va dentro del return
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div style={styles.page}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logoWrapper}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              marginBottom: '16px',
              borderRadius: '50%'
            }}
          />
          <div style={styles.logoText}>InventarioPOS</div>
          <div style={styles.logoSub}>Sistema de gestión</div>
        </div>

        <div style={styles.divider} />

        <h2 style={styles.title}>Bienvenido</h2>
        <p style={styles.subtitle}>Ingresa tus credenciales para continuar</p>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Campo Usuario */}
          <label style={styles.label}>Usuario</label>
          <div style={styles.inputWrapper}>
            <span style={styles.inputIcon}>👤</span>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              onFocus={() => setInputFocus('usuario')}
              onBlur={() => setInputFocus('')}
              style={getFocusStyle('usuario')}
            />
          </div>

          {/* Campo Contraseña */}
          <label style={styles.label}>Contraseña</label>
          <div style={styles.inputWrapper}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              type={mostrarPass ? 'text' : 'password'}
              placeholder="Ingresa tu contraseña"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              onFocus={() => setInputFocus('contrasena')}
              onBlur={() => setInputFocus('')}
              style={{ ...getFocusStyle('contrasena'), paddingRight: '44px' }}
            />
            <button
              type="button"
              onClick={() => setMostrarPass(!mostrarPass)}
              style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)',
                fontSize: '14px', padding: '4px'
              }}
            >
              {mostrarPass ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={cargando}
            style={{
              ...styles.button,
              opacity: cargando ? 0.7 : 1,
              transform: cargando ? 'scale(0.98)' : 'scale(1)',
            }}
            onMouseEnter={e => { if (!cargando) e.target.style.background = 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}
            onMouseLeave={e => { e.target.style.background = 'linear-gradient(135deg, #2980a9, #1d4ed8)' }}
          >
            {cargando ? '⏳ Verificando...' : 'Iniciar Sesión →'}
          </button>

        </form>

        <div style={styles.footer}>
          © 2025 InventarioPOS · Todos los derechos reservados
        </div>

      </div>
    </div>
  )
}