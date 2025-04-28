import { useState } from 'react';
import { Link } from 'react-router-dom';
import GradientButton from '../../components/GradientButton';

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulación de envío de correo
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="relative w-full max-w-md mx-4 transition-all duration-700 ease-out transform translate-y-0 opacity-100">
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-blue-200/50">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-pulse">
            Recuperar Contraseña
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            {!isSent 
              ? 'Ingresa tu correo para recibir instrucciones' 
              : 'Revisa tu bandeja de entrada para continuar'}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

            <GradientButton type="submit" isLoading={isLoading}>
              Enviar instrucciones
            </GradientButton>
          </form>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Hemos enviado un correo a <span className="font-medium text-gray-900">{email}</span> con las instrucciones para recuperar tu contraseña.
            </p>
            <button
              onClick={() => setIsSent(false)}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 cursor-pointer"
            >
              Intentar con otro correo
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center px-4 py-2 border border-blue-300 bg-white/50 backdrop-blur-sm rounded-md font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          <svg className="mr-2 -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
