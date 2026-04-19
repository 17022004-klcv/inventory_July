import { useState } from "react";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  const [usuario, setUsuario] = useState(null);

  return (
    <div>
      {usuario ? (
        <Dashboard onLogout={() => setUsuario(null)} usuario={usuario} />
      ) : (
        <Login onLogin={(usuarioData) => setUsuario(usuarioData)} />
      )}
    </div>
  );
}

export default App;
