import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://192.168.2.64:8080/api/v1/auth';

// Configuración de tiempos (en milisegundos)
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutos de inactividad
const TOKEN_REFRESH_INTERVAL = 12 * 60 * 1000; // Refrescar cada 12 minutos (antes de los 15 min de expiración)

export const useTokenRefresh = () => {
  const { user, logout } = useAuth();
  const inactivityTimerRef = useRef<number | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Función para refrescar el token
  const refreshToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No hay token para refrescar');
        return;
      }

      console.log('🔄 Refrescando token...');
      const response = await axios.post(
        `${API_URL}/refresh-permissions`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.token) {
        // Actualizar el token en localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('✅ Token refrescado exitosamente');
      }
    } catch (error) {
      console.error('❌ Error al refrescar token:', error);
      // Si el refresh falla, cerrar sesión
      logout();
    }
  }, [logout]);

  // Función para resetear el timer de inactividad
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Limpiar el timer anterior
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Crear un nuevo timer
    inactivityTimerRef.current = setTimeout(() => {
      console.log('⏱️ Usuario inactivo por 10 minutos. Cerrando sesión...');
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [logout]);

  // Función para manejar la actividad del usuario
  const handleUserActivity = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Configurar listeners de actividad y refresh automático
  useEffect(() => {
    if (!user) {
      // Si no hay usuario, limpiar todos los timers
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      return;
    }

    console.log('🚀 Iniciando sistema de gestión de tokens');

    // Eventos que indican actividad del usuario
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Agregar listeners para detectar actividad
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity);
    });

    // Iniciar el timer de inactividad
    resetInactivityTimer();

    // Configurar refresh automático del token
    refreshIntervalRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      // Solo refrescar si el usuario ha estado activo recientemente
      if (timeSinceLastActivity < INACTIVITY_TIMEOUT) {
        console.log('🔄 Ejecutando refresh automático del token');
        refreshToken();
      } else {
        console.log('⏸️ Usuario inactivo, saltando refresh automático');
      }
    }, TOKEN_REFRESH_INTERVAL);

    // Cleanup al desmontar o cuando cambie el usuario
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      console.log('🛑 Sistema de gestión de tokens detenido');
    };
  }, [user, handleUserActivity, resetInactivityTimer, refreshToken]);

  return {
    refreshToken, // Exportar por si se necesita refrescar manualmente
  };
};
