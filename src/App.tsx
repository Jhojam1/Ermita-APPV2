import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import RootLayout from './layouts/RootLayout'

// Auth Pages
import Login from './pages/auth/Login'
import ResetPassword from './pages/auth/ResetPassword'

// App Pages
import Dashboard from './pages/Dashboard'
import Inventario from './pages/inventario'
import Configuracion from './pages/configuracion'
import Historial from './pages/historial'
import Mantenimientos from './pages/mantenimientos'
import Reportes from './pages/reportes'

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes con layout compartido (fondo animado de burbujas) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        
        {/* App Routes con layout principal */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/configuracion/*" element={<Configuracion />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/mantenimientos" element={<Mantenimientos />} />
          <Route path="/reportes/*" element={<Reportes />} />
        </Route>
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
