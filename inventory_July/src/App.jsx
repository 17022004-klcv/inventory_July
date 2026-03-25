import { useState } from 'react'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'

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