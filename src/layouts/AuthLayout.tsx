import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';

const AuthLayout = () => {
  // Manejar el overflow al montar/desmontar el componente
  useEffect(() => {
    // Importante: aseguramos que el body tenga overflow hidden para evitar scroll
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <main className="fixed inset-0 flex items-center justify-center min-h-screen w-full overflow-hidden">
      {/* Fondo animado compartido para todas las páginas de autenticación */}
      <AnimatedBackground />

      {/* Contenido - Se usa Outlet para renderizar las páginas hijas */}
      <Outlet />
    </main>
  );
};

export default AuthLayout;
