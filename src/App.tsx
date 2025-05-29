import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Maintenance from './pages/Maintenance';
import MaintenanceConfig from './pages/MaintenanceConfig';
import Reports from './pages/Reports';
import ReportesHosvital from './pages/ReportesHosvital';
import History from './pages/History';
import Configuration from './pages/Configuration';
import Users from './pages/Users';
import Companies from './pages/Companies';
import Locations from './pages/Locations';
import ResetPassword from './pages/ResetPassword';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={
            <Layout>
              <Home />
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
          <Route path="/mantenimientos/configuracion" element={
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
