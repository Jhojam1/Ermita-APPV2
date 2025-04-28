import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GradientButton from '../../components/GradientButton';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      navigate('/');
      setIsLoading(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="relative w-full max-w-md mx-4 transition-all duration-700 ease-out transform translate-y-0 opacity-100">
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-blue-200/50">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-pulse">
            Sistema Ermita
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

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
              <Link
                to="/reset-password"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <GradientButton type="submit" isLoading={isLoading}>
            Iniciar sesión
          </GradientButton>
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
  );
};

export default Login;
