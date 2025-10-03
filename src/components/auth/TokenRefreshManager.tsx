import { ReactNode } from 'react';
import { useTokenRefresh } from '../../hooks/useTokenRefresh';

interface TokenRefreshManagerProps {
  children: ReactNode;
}

/**
 * Componente que gestiona el refresh automático del token y el logout por inactividad
 * - Refresca el token cada 12 minutos si el usuario está activo
 * - Cierra sesión automáticamente después de 10 minutos de inactividad
 * - Detecta actividad del usuario (mouse, teclado, scroll, touch, clicks)
 */
export const TokenRefreshManager: React.FC<TokenRefreshManagerProps> = ({ children }) => {
  useTokenRefresh();
  return <>{children}</>;
};
