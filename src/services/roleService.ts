import axios from 'axios';

const API_BASE_URL = 'http://192.168.2.20:8080/api/v1';

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

export interface Role {
  id: number;
  name: string;
  description: string;
  active: boolean;
  systemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
}

export interface UpdateRoleRequest {
  name: string;
  description: string;
}

export const roleService = {
  // Obtener todos los roles
  getAllRoles: async (): Promise<Role[]> => {
    try {
      const response = await axiosInstance.get('/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  // Obtener rol por ID
  getRoleById: async (id: number): Promise<Role> => {
    try {
      const response = await axiosInstance.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  },

  // Crear nuevo rol
  createRole: async (roleData: CreateRoleRequest): Promise<Role> => {
    try {
      const response = await axiosInstance.post('/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  // Actualizar rol
  updateRole: async (id: number, roleData: UpdateRoleRequest): Promise<Role> => {
    try {
      const response = await axiosInstance.put(`/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  // Eliminar rol (desactivar)
  deleteRole: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/roles/${id}`);
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  },

  // Obtener permisos de un rol
  getRolePermissions: async (roleId: number): Promise<string[]> => {
    try {
      const response = await axiosInstance.get(`/roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      throw error;
    }
  },

  // Actualizar permisos de un rol
  updateRolePermissions: async (roleId: number, permissionNames: string[]): Promise<void> => {
    try {
      await axiosInstance.put(`/roles/${roleId}/permissions`, { permissionNames });
    } catch (error) {
      console.error('Error updating role permissions:', error);
      throw error;
    }
  }
};

export default roleService;
