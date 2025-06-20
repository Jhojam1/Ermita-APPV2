import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from '../services/authService';
import AnimatedBackground from '../components/ui/AnimatedBackground';

export default function ResetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await requestPasswordReset(email);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el código. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!token.trim() || token.length !== 6 || !/^\d{6}$/.test(token)) {
        throw new Error('Debes ingresar un código numérico válido de 6 dígitos');
      }
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Código inválido. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login?reset=success';
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  );

  return (
    <AnimatedBackground>
      <div className="bg-white/80 backdrop-blur-md p-5 sm:p-8 rounded-2xl shadow-xl border border-white/50 w-full max-w-md mx-auto">
        {success ? (
          <div className="text-center py-8">
            <div className="bg-green-50 text-green-800 p-4 rounded-xl mb-4">
              <h2 className="text-xl font-semibold mb-2">¡Contraseña restablecida!</h2>
              <p>Tu contraseña ha sido cambiada exitosamente. Serás redirigido al inicio de sesión en unos segundos.</p>
            </div>
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mt-4"></div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {step === 1 && 'Recuperar contraseña'}
                {step === 2 && 'Verificar código'}
                {step === 3 && 'Nueva contraseña'}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                {step === 1 && 'Ingresa tu correo para recibir instrucciones'}
                {step === 2 && 'Ingresa el código de 6 dígitos recibido en tu correo'}
                {step === 3 && 'Crea una nueva contraseña para tu cuenta'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-xl text-sm">
                {error}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    w-full py-3 px-4 rounded-xl text-white font-medium
                    ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}
                    transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30
                  `}
                >
                  {isLoading ? <LoadingSpinner /> : 'Enviar instrucciones'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleCodeVerification} className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    id="token"
                    value={token}
                    onChange={(e) => {
                      // Solo permitir dígitos numéricos y limitar a 6 caracteres
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        setToken(value);
                      }
                    }}
                    maxLength={6}
                    pattern="\d{6}"
                    required
                    className="peer w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-transparent text-center text-2xl tracking-widest
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all duration-200 bg-white/50"
                    placeholder="Código de verificación"
                  />
                  <label
                    htmlFor="token"
                    className="absolute left-4 -top-6 text-sm text-gray-600 peer-placeholder-shown:text-base
                             peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                             peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-600
                             transition-all duration-200"
                  >
                    Código de verificación
                  </label>
                </div>
                <p className="text-xs text-gray-600">Ingresa el código numérico de 6 dígitos que recibiste en tu correo electrónico para restablecer tu contraseña de forma segura.</p>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    w-full py-3 px-4 rounded-xl text-white font-medium
                    ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}
                    transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30
                  `}
                >
                  {isLoading ? <LoadingSpinner /> : 'Verificar código numérico'}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div className="relative">
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="peer w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-transparent
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all duration-200 bg-white/50"
                    placeholder="Nueva contraseña"
                  />
                  <label
                    htmlFor="newPassword"
                    className="absolute left-4 -top-6 text-sm text-gray-600 peer-placeholder-shown:text-base
                             peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                             peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-600
                             transition-all duration-200"
                  >
                    Nueva contraseña
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="peer w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-transparent
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all duration-200 bg-white/50"
                    placeholder="Confirmar contraseña"
                  />
                  <label
                    htmlFor="confirmPassword"
                    className="absolute left-4 -top-6 text-sm text-gray-600 peer-placeholder-shown:text-base
                             peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                             peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-600
                             transition-all duration-200"
                  >
                    Confirmar contraseña
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    w-full py-3 px-4 rounded-xl text-white font-medium
                    ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}
                    transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30
                  `}
                >
                  {isLoading ? <LoadingSpinner /> : 'Cambiar contraseña'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </AnimatedBackground>
  );
}