import axios from 'axios';

const API_BASE_URL = 'http://192.168.2.64:8080/api/v1';

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

export interface Module {
  id: number;
  name: string;
  description: string;
  icon: string;
  route: string;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleRequest {
  name: string;
  description: string;
  icon: string;
  route: string;
  displayOrder?: number;
}

export interface UpdateModuleRequest {
  name: string;
  description: string;
  icon: string;
  route: string;
  displayOrder?: number;
}

export const moduleService = {
  // Obtener todos los módulos
  getAllModules: async (): Promise<Module[]> => {
    try {
      const response = await axiosInstance.get('/modules');
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  },

  // Obtener módulo por ID
  getModuleById: async (id: number): Promise<Module> => {
    try {
      const response = await axiosInstance.get(`/modules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  },

  // Crear nuevo módulo
  createModule: async (moduleData: CreateModuleRequest): Promise<Module> => {
    try {
      const response = await axiosInstance.post('/modules', moduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  },

  // Actualizar módulo
  updateModule: async (id: number, moduleData: UpdateModuleRequest): Promise<Module> => {
    try {
      const response = await axiosInstance.put(`/modules/${id}`, moduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  },

  // Eliminar módulo (desactivar)
  deleteModule: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/modules/${id}`);
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  }
};

export default moduleService;
