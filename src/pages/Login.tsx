import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading, error: authError, clearError, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [mounted, setMounted] = useState(false);
  const [bubbles, setBubbles] = useState<Array<{
    id: number;
    size: number;
    color: string;
    animation: string;
    top: string;
    left: string;
    delay: string;
  }>>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Limpiar errores al montar el componente
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Manejar el overflow al montar/desmontar el componente y controlar la animación inicial
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // Asegurarse de que los elementos estén posicionados correctamente desde el inicio
    setMounted(true);
    
    // Generar las burbujas solo del lado del cliente para evitar errores de hidratación
    setBubbles(Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: 150 + Math.random() * 250,
      color: i % 3 === 0 
        ? '96, 165, 250' 
        : i % 3 === 1 
          ? '59, 130, 246' 
          : '37, 99, 235',
      animation: i % 3 === 0 ? 'animate-move-1' : i % 3 === 1 ? 'animate-move-2' : 'animate-move-3',
      top: `${Math.random() * 90}%`,
      left: `${Math.random() * 90}%`,
      delay: `${Math.random() * 8}s`
    })));
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Mostrar error de autenticación si existe
  useEffect(() => {
    if (authError) {
      setErrorMessage(authError);
      setButtonLoading(false);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si ya está cargando, no hacemos nada
    if (buttonLoading || authLoading) {
      return;
    }
    
    setButtonLoading(true);
    setErrorMessage('');
    
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        // La redirección se maneja en el useEffect que observa el usuario
      } else {
        setButtonLoading(false);
      }
    } catch (error: any) {
      setButtonLoading(false);
      if (typeof error === 'string') {
        setErrorMessage(error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limpiar errores al cambiar los campos
    if (errorMessage) {
      setErrorMessage('');
      clearError();
    }
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/reset-password');
  };

  return (
    <main className="fixed inset-0 flex items-center justify-center min-h-screen w-full">
      {/* Fondo animado */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 animate-gradient">
          {/* Burbujas que se mueven por toda la pantalla - Solo renderizadas del lado del cliente */}
          {mounted && (
            <div className="absolute inset-0 overflow-hidden">
              {bubbles.map(bubble => (
                <div
                  key={`bubble-${bubble.id}`}
                  className={`absolute rounded-full mix-blend-multiply filter blur-xl ${bubble.animation}`}
                  style={{
                    backgroundColor: `rgba(${bubble.color}, 0.25)`,
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`,
                    top: bubble.top,
                    left: bubble.left,
                    animationDelay: bubble.delay
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Círculos pulsantes estáticos - Renderizados con valores fijos para evitar errores de hidratación */}
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={`pulse-${i}`}
                className="absolute rounded-full animate-pulse-slow"
                style={{
                  background: `radial-gradient(circle at center, rgba(${i % 2 ? '96, 165, 250' : '59, 130, 246'}, 0.2) 0%, transparent 70%)`,
                  width: `${300 + (i * 30)}px`,
                  height: `${300 + (i * 30)}px`,
                  top: `${15 + (i * 15)}%`,
                  left: `${10 + (i * 20)}%`,
                  animationDelay: `${i * 0.8}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className={`relative w-full max-w-md mx-4 transition-all duration-700 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-blue-200/50">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-pulse">
              Sistema Ermita
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-600">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="peer w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 placeholder-transparent
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200 bg-white/50 focus:bg-white cursor-text"
                  placeholder="nombre@empresa.com"
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 -top-6 text-sm text-gray-600 peer-placeholder-shown:text-base
                           peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                           peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-600
                           transition-all duration-200"
                >
                  Correo electrónico
                </label>
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="peer w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 placeholder-transparent
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200 bg-white/50 focus:bg-white cursor-text"
                  placeholder="••••••••"
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 -top-6 text-sm text-gray-600 peer-placeholder-shown:text-base
                           peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                           peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-600
                           transition-all duration-200"
                >
                  Contraseña
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <button
                  onClick={handleForgotPassword}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={buttonLoading}
              className={`
                relative w-full py-2 sm:py-3 px-4 rounded-xl text-white overflow-hidden
                ${buttonLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}
                transition-all duration-300 font-medium group
                hover:shadow-lg hover:shadow-blue-500/30
              `}
            >
              <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-blue-500 to-blue-700 group-hover:skew-x-12"></span>
              <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform skew-x-12 bg-gradient-to-l from-blue-600 to-blue-800 group-hover:-skew-x-12"></span>
              <span className="absolute bottom-0 left-0 hidden w-10 h-20 transition-all duration-100 ease-out transform -translate-x-8 translate-y-10 bg-blue-700 -rotate-12"></span>
              <span className="absolute bottom-0 right-0 hidden w-10 h-20 transition-all duration-100 ease-out transform translate-x-10 translate-y-8 bg-blue-500 -rotate-12"></span>
              <span className="absolute inset-0 w-full h-full animate-shimmer opacity-0 group-hover:opacity-100"></span>
              <span className="relative z-10">
                {buttonLoading ? (
                  <svg className="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                ) : 'Iniciar sesión'}
              </span>
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs sm:text-sm text-gray-600">
          ¿Necesitas ayuda?{' '}
          <a 
            href="https://wa.me/573106992881" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 cursor-pointer"
          >
            Contacta a soporte
          </a>
        </p>
      </div>
    </main>
  );
};

export default Login;
