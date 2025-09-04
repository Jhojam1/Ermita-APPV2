import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 pt-16 lg:pt-0 h-full overflow-auto">
        <main className="p-4 sm:p-6 md:p-8 min-h-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
