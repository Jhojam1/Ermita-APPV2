import axios from 'axios';

// Configuración base de axios
const API_URL = 'http://192.168.2.20:8080/api/maintenance/configs';

// Crear una instancia de axios con la URL base
const maintenanceConfigApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
maintenanceConfigApi.interceptors.request.use(
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

export interface AutoMaintenanceConfigItem {
  id?: number;
  cityId?: number;
  companyId?: number;
  headquarterId?: number;
  equipmentTypeId?: number;
  equipmentTypeName?: string;
  monthsInterval: number;
  isActive: boolean;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaz para mapear los datos a la UI
export interface AutoMaintenanceConfigUI {
  id?: string;
  companyId?: number;
  headquarterId?: number;
  equipmentTypeId?: number;
  tipoEquipo: string;
  intervaloMeses: number;
  activo: boolean;
}

// Función para obtener los datos del usuario del localStorage
const getUserData = () => {
  try {
    const userString = localStorage.getItem('user');
    console.log('Contenido del localStorage (user):', userString);
    
    if (!userString) return null;
    
    const userData = JSON.parse(userString);
    console.log('Datos del usuario parseados:', userData);
    console.log('idcompany:', userData.idcompany, 'tipo:', typeof userData.idcompany);
    console.log('idheadquarter:', userData.idheadquarter, 'tipo:', typeof userData.idheadquarter);
    
    return userData;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

const maintenanceConfigService = {
  // Obtener todas las configuraciones
  getAllConfigs: async (): Promise<AutoMaintenanceConfigItem[]> => {
    try {
      console.log('🔍 Llamando a getAllConfigs...');
      console.log('🔍 URL:', API_URL);
      const response = await maintenanceConfigApi.get('');
      console.log('✅ Respuesta recibida:', response.data);
      console.log('✅ Cantidad de configuraciones:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener configuraciones de mantenimiento:', error);
      throw error;
    }
  },

  // Obtener una configuración por ID
  getConfigById: async (id: number): Promise<AutoMaintenanceConfigItem> => {
    try {
      const response = await maintenanceConfigApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener configuración con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear una nueva configuración
  createConfig: async (config: AutoMaintenanceConfigItem): Promise<AutoMaintenanceConfigItem> => {
    try {
      // Obtener el ID del usuario para createdBy
      const userData = getUserData();
      
      if (!userData) {
        throw new Error('No se encontraron datos del usuario. Por favor, inicie sesión nuevamente.');
      }
      
      // Solo agregar createdBy, mantener companyId y headquarterId del formulario
      config.createdBy = userData.id ? Number(userData.id) : undefined;
      
      console.log('Enviando configuración al backend:', config);
      
      // Usar el endpoint correcto para crear configuraciones
      const response = await maintenanceConfigApi.post('/save', config);
      return response.data;
    } catch (error) {
      console.error('Error al crear configuración de mantenimiento:', error);
      throw error;
    }
  },

  // Actualizar una configuración existente
  updateConfig: async (id: number, config: Partial<AutoMaintenanceConfigItem>): Promise<AutoMaintenanceConfigItem> => {
    try {
      console.log('Actualizando configuración en el backend:', config);
      
      const response = await maintenanceConfigApi.put(`/${id}`, config);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar configuración con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar una configuración
  deleteConfig: async (id: number): Promise<void> => {
    try {
      await maintenanceConfigApi.delete(`/${id}`);
    } catch (error) {
      console.error(`Error al eliminar configuración con ID ${id}:`, error);
      throw error;
    }
  },

  // Mapear datos del backend a la UI
  mapToUI: (config: AutoMaintenanceConfigItem): AutoMaintenanceConfigUI => {
    return {
      id: config.id?.toString(),
      companyId: config.companyId,
      headquarterId: config.headquarterId,
      equipmentTypeId: config.equipmentTypeId,
      tipoEquipo: config.equipmentTypeName || '',
      intervaloMeses: config.monthsInterval,
      activo: config.isActive
    };
  },

  // Mapear datos de la UI al backend
  mapToBackend: (configUI: AutoMaintenanceConfigUI): AutoMaintenanceConfigItem => {
    return {
      id: configUI.id ? parseInt(configUI.id) : undefined,
      companyId: configUI.companyId,
      headquarterId: configUI.headquarterId,
      equipmentTypeId: configUI.equipmentTypeId,
      equipmentTypeName: configUI.tipoEquipo,
      monthsInterval: configUI.intervaloMeses,
      isActive: configUI.activo
    };
  }
};

export default maintenanceConfigService;
