import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const [logueado, setLogueado] = useState(false)

  return (
    <div>
      {logueado
        ? <Dashboard onLogout={() => setLogueado(false)} />
        : <Login onLogin={() => setLogueado(true)} />
      }
    </div>
  )
}

export default App