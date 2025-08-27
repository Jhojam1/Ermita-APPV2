import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Maintenance from './pages/Maintenance';
import MaintenanceConfig from './pages/MaintenanceConfig';
import Reports from './pages/ReportsNew';
import ReportesHosvital from './pages/ReportesHosvital';
import History from './pages/History';
import Configuration from './pages/Configuration';
import Users from './pages/Users';
import Companies from './pages/Companies';
import Locations from './pages/Locations';
import ResetPassword from './pages/ResetPassword';
import TechnicianAssignmentManager from './components/maintenance/TechnicianAssignmentManager';
import TechnicianProductivityReport from './components/maintenance/TechnicianProductivityReport';
import TechnicianDashboard from './components/maintenance/TechnicianDashboard';
import './index.css';

// Componente para manejar la redirección basada en roles
function HomeRedirect() {
  const { user } = useAuth();
  
  // Si es técnico, redirigir al dashboard de técnico
  if (user?.role === 'Tecnico') {
    return <Navigate to="/dashboard/tecnico" replace />;
  }
  
  // Para otros roles, mostrar el Home normal
  return <Home />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={
            <Layout>
              <HomeRedirect />
            </Layout>
          } />
          <Route path="/inventario" element={
            <Layout>
              <Inventory />
            </Layout>
          } />
          <Route path="/mantenimientos" element={
            <Layout>
              <Maintenance />
            </Layout>
          } />
          <Route path="/configuracion/mantenimientos" element={
            <Layout>
              <MaintenanceConfig />
            </Layout>
          } />
          <Route path="/reportes" element={
            <Layout>
              <Reports />
            </Layout>
          } />
          <Route path="/reportes/hosvital" element={
            <Layout>
              <ReportesHosvital />
            </Layout>
          } />
          <Route path="/historial" element={
            <Layout>
              <History />
            </Layout>
          } />
          <Route path="/configuracion" element={
            <Layout>
              <Configuration />
            </Layout>
          } />
          <Route path="/configuracion/usuarios" element={
            <Layout>
              <Users />
            </Layout>
          } />
          <Route path="/configuracion/empresas" element={
            <Layout>
              <Companies />
            </Layout>
          } />
          <Route path="/configuracion/sedes" element={
            <Layout>
              <Locations />
            </Layout>
          } />
          <Route path="/mantenimientos/asignaciones" element={
            <Layout>
              <TechnicianAssignmentManager />
            </Layout>
          } />
          <Route path="/mantenimientos/productividad" element={
            <Layout>
              <TechnicianProductivityReport />
            </Layout>
          } />
          <Route path="/dashboard/tecnico" element={
            <Layout>
              <TechnicianDashboard />
            </Layout>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;