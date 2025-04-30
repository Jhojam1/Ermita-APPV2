import { useState, useEffect } from 'react';
import { requestPasswordReset, resetPassword } from '../services/authService';

export default function ResetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setMounted(true);
    
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
      if (!token.trim()) {
        throw new Error('Debes ingresar el código de verificación');
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

  return (
    <main className="fixed inset-0 flex items-center justify-center min-h-screen w-full">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 animate-gradient">
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

      <div className={`relative w-full max-w-md mx-4 transition-all duration-700 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-blue-200/50">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Restablecer Contraseña</h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 1 && "Te enviaremos un código de verificación"}
              {step === 2 && "Ingresa el código que enviamos a tu correo"}
              {step === 3 && "Ingresa tu nueva contraseña"}
            </p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="w-16 h-16 text-green-500 mx-auto">✓</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¡Contraseña cambiada con éxito!
              </h3>
              <p className="text-gray-600">
                Serás redirigido al inicio de sesión en unos segundos...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
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
                      placeholder="correo@ejemplo.com"
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
                    {isLoading ? <LoadingSpinner /> : 'Enviar código'}
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
                      onChange={(e) => setToken(e.target.value)}
                      required
                      className="peer w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-transparent
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`
                      w-full py-3 px-4 rounded-xl text-white font-medium
                      ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}
                      transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30
                    `}
                  >
                    {isLoading ? <LoadingSpinner /> : 'Verificar código'}
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
                <button
                  onClick={() => window.location.href = '/login'}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}