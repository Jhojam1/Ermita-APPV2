import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading: authLoading, error: authError, clearError, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Verificar si viene de un restablecimiento exitoso
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('reset') === 'success') {
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 5000);
    }
  }, [location]);

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

  return (
    <div className="h-screen overflow-hidden">
      <AnimatedBackground>
        <div className="bg-white/80 backdrop-blur-md p-5 sm:p-8 rounded-2xl shadow-xl border border-white/50 w-full max-w-md mx-auto">
          {resetSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-xl text-sm">
              ¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión con tu nueva contraseña.
            </div>
          )}
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-xl text-sm">
              {errorMessage}
            </div>
          )}
          
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-pulse">
              Inicio De Sesion
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-600">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="peer w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-transparent
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200 bg-white/50"
                  placeholder="ejemplo@correo.com"
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

              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="peer w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-transparent
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200 bg-white/50"
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
                <Link
                  to="/reset-password"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
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
      </AnimatedBackground>
    </div>
  );
};

export default Login;
