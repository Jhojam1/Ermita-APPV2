import axios from 'axios';

// Configuración base de axios
const API_URL = 'http://localhost:8080/api/v1/auth';

// Crear una instancia de axios con la URL base
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Tipos
export interface LoginCredentials {
  mail: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
}

// Funciones de autenticación
export const authLogin = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const response = await authApi.post('/login', credentials);
    
    // Guardar el token en localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw error.response.data.message || 'Error de autenticación';
    }
    throw 'Error de conexión con el servidor';
  }
};

export const authLogout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await authApi.post('/reset-password-request', { email });
  } catch (error: any) {
    if (error.response) {
      throw error.response.data.message || 'Error al solicitar restablecimiento de contraseña';
    }
    throw 'Error de conexión con el servidor';
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    await authApi.post('/reset-password', { token, newPassword });
  } catch (error: any) {
    if (error.response) {
      throw error.response.data.message || 'Error al restablecer la contraseña';
    }
    throw 'Error de conexión con el servidor';
  }
};

export default {
  authLogin,
  authLogout,
  getCurrentUser,
  isAuthenticated,
  requestPasswordReset,
  resetPassword
};
