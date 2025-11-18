import axios from 'axios';

const API_BASE_URL = 'http://192.168.2.20:8080/api/v1';

// Configurar axios para incluir el token en todas las peticiones
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
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

export interface Permission {
  id: number;
  name: string;
  description: string;
  module: string;
  action: string;
  active: boolean;
}

export const permissionService = {
  // Obtener permisos de un usuario específico
  getUserPermissions: async (userId: number): Promise<string[]> => {
    try {
      const response = await axiosInstance.get(`/users/permissions/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  },

  // Obtener todos los permisos disponibles
  getAllPermissions: async (): Promise<Permission[]> => {
    try {
      const response = await axiosInstance.get('/permissions/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching all permissions:', error);
      throw error;
    }
  },

  // Obtener permisos por módulo
  getPermissionsByModule: async (module: string): Promise<Permission[]> => {
    try {
      const response = await axiosInstance.get(`/permissions/module/${module}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions by module:', error);
      throw error;
    }
  },

  // Verificar si el usuario tiene un permiso específico
  hasPermission: (userPermissions: string[], permission: string): boolean => {
    return userPermissions.includes(permission);
  },

  // Verificar si el usuario tiene permisos para un módulo específico
  hasModuleAccess: (userPermissions: string[], module: string): boolean => {
    return userPermissions.some(permission => permission.startsWith(module));
  },

  // Verificar si el usuario puede realizar una acción específica en un módulo
  canPerformAction: (userPermissions: string[], module: string, action: string): boolean => {
    const permissionName = `${module}_${action}`;
    return userPermissions.includes(permissionName);
  }
};

export default permissionService;
