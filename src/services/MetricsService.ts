import axios from 'axios';

// Configuración base de axios
const API_URL = 'http://192.168.2.64:8080';

// Crear una instancia de axios con la URL base
const metricsApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
metricsApi.interceptors.request.use(
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

export interface SystemResources {
  cpuUsage: number;
  totalMemory: number;
  freeMemory: number;
  usedMemory: number;
  totalDiskSpace: number;
  freeDiskSpace: number;
  usedDiskSpace: number;
  serverUptime: string;
}

export const getSystemResources = async (): Promise<SystemResources> => {
  try {
    const response = await metricsApi.get('/api/config/metrics/system-resources');
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw error.response.data.message || 'Error al obtener métricas del sistema';
    }
    throw 'Error de conexión con el servidor';
  }
};

export default {
  getSystemResources
};
