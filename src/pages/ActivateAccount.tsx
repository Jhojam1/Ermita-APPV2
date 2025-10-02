import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import authService from '../services/authService';

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de activación no válido');
      return;
    }

    activateAccount(token);
  }, [token]);

  const activateAccount = async (activationToken: string) => {
    try {
      await authService.activateAccount(activationToken);
      setStatus('success');
      setMessage('¡Tu cuenta ha sido activada exitosamente!');
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Error al activar la cuenta. El token puede haber expirado.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SIMAX
            </h1>
          </div>

          {/* Content */}
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Activando tu cuenta...
                </h2>
                <p className="text-gray-600">
                  Por favor espera un momento
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex justify-center mb-6">
                  <CheckCircleIcon className="h-20 w-20 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  ¡Cuenta Activada!
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <p className="text-sm text-gray-500">
                  Serás redirigido al inicio de sesión en unos segundos...
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Ir al Inicio de Sesión
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex justify-center mb-6">
                  <XCircleIcon className="h-20 w-20 text-red-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Error de Activación
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Ir al Inicio de Sesión
                  </button>
                  <button
                    onClick={() => navigate('/reset-password')}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    Solicitar Nuevo Enlace
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2025 SIMAX. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
