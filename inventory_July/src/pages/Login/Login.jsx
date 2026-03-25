import { useState } from 'react'
import logo from '../../assets/img/logo.png'
import './Login.css'

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

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

  return (
    <div className="login-page">
      <div className="bg-circle-1" />
      <div className="bg-circle-2" />

      <div className="login-card">
        {/* Logo */}
        <div className="logo-wrapper">
          <img
            src={logo}
            alt="Logo"
            className="logo-img"
          />
          <div className="logo-text">InventarioPOS</div>
          <div className="logo-sub">Sistema de gestión</div>
        </div>

        <div className="divider" />

        <h2 className="login-title">Bienvenido</h2>
        <p className="login-subtitle">Ingresa tus credenciales para continuar</p>

        {error && (
          <div className="error-box">
            <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo Usuario */}
          <div className="form-group">
            <label className="form-label">
              <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Nombre de usuario
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="ej: jperez"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="form-group">
            <label className="form-label">
              <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Contraseña
            </label>
            <div className="input-wrapper password-wrapper">
              <input
                type={mostrarPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setMostrarPass(!mostrarPass)}
                className="toggle-password"
                title={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarPass ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                    <line x1="3" y1="3" x2="21" y2="21" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={cargando}
            className={`login-button ${cargando ? 'button-loading' : ''}`}
          >
            {cargando ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Verificando...
              </>
            ) : (
              'Iniciar Sesión →'
            )}
          </button>
        </form>

        <div className="login-footer">
          © 2025 InventarioPOS · Todos los derechos reservados
        </div>
      </div>
    </div>
  )
}