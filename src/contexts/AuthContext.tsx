import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  authLogin as loginService, 
  authLogout as logoutService, 
  getCurrentUser,
  User,
  LoginCredentials
} from '../services/authService';

// Definir la interfaz para el contexto
export interface User {
  id: number;
  fullName: string;
  numberIdentification: number;
  mail: string;
  role: string; // Legacy field for backward compatibility
  roleId: number;
  roleName: string;
  companyId: number;
  headquarterId: number;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// Crear el contexto con un valor predeterminado
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props para el proveedor de contexto
interface AuthProviderProps {
  children: ReactNode;
}

// Proveedor de contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar si hay un usuario en localStorage al cargar la aplicación
  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const credentials: LoginCredentials = { mail: email, password };
      const userData = await loginService(credentials);
      setUser(userData);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Error al iniciar sesión');
      setLoading(false);
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    logoutService();
    setUser(null);
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

  // Valor del contexto que se proporcionará
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
