import axios from 'axios';

// Configuración base de axios
const API_URL = 'http://localhost:8080/api/maintenance/maintenances';

// Crear una instancia de axios con la URL base
const maintenanceApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
maintenanceApi.interceptors.request.use(
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

export interface MaintenanceItem {
  id?: number;
  inventoryItemId: number;
  inventoryItemName?: string;
  companyId?: number;
  headquarterId?: number;
  serviceArea?: string;
  responsible?: string;
  description: string;
  scheduledDate: string;
  completionDate?: string;
  type: 'PREVENTIVO' | 'CORRECTIVO';
  status: 'PROGRAMADO' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  technicianId?: number;
  technicianName?: string;
  observations?: string;
  signature?: string; // Campo para almacenar la firma digital
  signerName?: string; // Nombre de la persona que firma
  createdBy?: number;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
  isAutoScheduled?: boolean;
}

// Interfaz para mapear los datos a la UI
export interface MaintenanceItemUI {
  id: string;
  equipo: string;
  estado: string;
  fechaProgramada: string;
  fechaCompletado?: string;
  tecnico: string;
  tipo: string;
  prioridad?: string;
  descripcion: string;
  observaciones?: string;
  inventoryItemId: number;
  technicianId?: number;
  area?: string;
  responsable?: string;
  firma?: string; // Firma digital en formato base64
  nombreFirmante?: string; // Nombre de la persona que firma
  isAutoScheduled?: boolean;
}

const maintenanceService = {
  // Funciones auxiliares exportadas
  mapStatus,
  mapStatusToBackend,
  mapType,
  mapTypeToBackend,
  formatDate,
  parseDate,
  
  // Obtener todos los mantenimientos
  getAllMaintenances: async (): Promise<MaintenanceItem[]> => {
    try {
      const response = await maintenanceApi.get('');
      return response.data;
    } catch (error) {
      console.error('Error al obtener mantenimientos:', error);
      throw error;
    }
  },

  // Obtener un mantenimiento por ID
  getMaintenanceById: async (id: number): Promise<MaintenanceItem> => {
    try {
      const response = await maintenanceApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener mantenimiento con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo mantenimiento
  createMaintenance: async (maintenance: MaintenanceItem): Promise<MaintenanceItem> => {
    try {
      const response = await maintenanceApi.post('', maintenance);
      return response.data;
    } catch (error) {
      console.error('Error al crear mantenimiento:', error);
      throw error;
    }
  },

  // Actualizar un mantenimiento existente
  updateMaintenance: async (id: number, maintenance: Partial<MaintenanceItem>): Promise<MaintenanceItem> => {
    try {
      const response = await maintenanceApi.put(`/${id}`, maintenance);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar mantenimiento con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un mantenimiento
  deleteMaintenance: async (id: number): Promise<void> => {
    try {
      await maintenanceApi.delete(`/${id}`);
    } catch (error) {
      console.error(`Error al eliminar mantenimiento con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener mantenimientos por estado
  getMaintenancesByStatus: async (status: string): Promise<MaintenanceItem[]> => {
    try {
      const response = await maintenanceApi.get(`/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener mantenimientos con estado ${status}:`, error);
      throw error;
    }
  },

  // Obtener mantenimientos por tipo
  getMaintenancesByType: async (type: string): Promise<MaintenanceItem[]> => {
    try {
      const response = await maintenanceApi.get(`/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener mantenimientos de tipo ${type}:`, error);
      throw error;
    }
  },

  // Obtener mantenimientos por equipo de inventario
  getMaintenancesByInventoryItem: async (inventoryItemId: number): Promise<MaintenanceItem[]> => {
    try {
      const response = await maintenanceApi.get(`/inventory-item/${inventoryItemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener mantenimientos para el equipo ${inventoryItemId}:`, error);
      throw error;
    }
  },

  // Mapear datos del backend a la UI
  mapToUI: (maintenanceItem: MaintenanceItem): MaintenanceItemUI => {
    // Asegurarse de que la firma sea una cadena válida para una imagen base64
    let firmaValida = null;
    if (maintenanceItem.signature && typeof maintenanceItem.signature === 'string' && maintenanceItem.signature.trim() !== '') {
      // Verificar si la firma ya tiene el prefijo de data URL
      if (!maintenanceItem.signature.startsWith('data:')) {
        // Agregar el prefijo si no lo tiene
        firmaValida = `data:image/png;base64,${maintenanceItem.signature}`;
      } else {
        firmaValida = maintenanceItem.signature;
      }
    }
    
    return {
      id: maintenanceItem.id?.toString() || '',
      equipo: maintenanceItem.inventoryItemName || 'Sin nombre',
      estado: mapStatus(maintenanceItem.status),
      fechaProgramada: formatDate(maintenanceItem.scheduledDate),
      fechaCompletado: maintenanceItem.completionDate ? formatDate(maintenanceItem.completionDate) : undefined,
      tecnico: maintenanceItem.technicianName || 'Sin asignar',
      tipo: mapType(maintenanceItem.type),
      descripcion: maintenanceItem.description || (maintenanceItem.isAutoScheduled ? 'Mantenimiento preventivo programado automáticamente' : 'Sin descripción'),
      observaciones: maintenanceItem.observations,
      inventoryItemId: maintenanceItem.inventoryItemId,
      technicianId: maintenanceItem.technicianId,
      area: maintenanceItem.serviceArea || 'No especificada',
      responsable: maintenanceItem.responsible || 'No asignado',
      firma: firmaValida,
      nombreFirmante: maintenanceItem.signerName,
      isAutoScheduled: maintenanceItem.isAutoScheduled
    };
  },

  // Mapear datos de la UI al backend
  mapToBackend: (maintenanceItemUI: MaintenanceItemUI): MaintenanceItem => {
    return {
      id: maintenanceItemUI.id ? parseInt(maintenanceItemUI.id) : undefined,
      inventoryItemId: maintenanceItemUI.inventoryItemId,
      description: maintenanceItemUI.descripcion,
      scheduledDate: parseDate(maintenanceItemUI.fechaProgramada),
      completionDate: maintenanceItemUI.fechaCompletado ? parseDate(maintenanceItemUI.fechaCompletado) : undefined,
      type: mapTypeToBackend(maintenanceItemUI.tipo),
      status: mapStatusToBackend(maintenanceItemUI.estado),
      technicianId: maintenanceItemUI.technicianId,
      technicianName: maintenanceItemUI.tecnico,
      observations: maintenanceItemUI.observaciones,
      serviceArea: maintenanceItemUI.area,
      responsible: maintenanceItemUI.responsable,
      signature: maintenanceItemUI.firma,
      signerName: maintenanceItemUI.nombreFirmante
    };
  }
};

// Funciones auxiliares para mapeo y formateo
function mapStatus(status: string): string {
  switch (status) {
    case 'PROGRAMADO': return 'Pendiente';
    case 'EN_PROCESO': return 'En Proceso';
    case 'COMPLETADO': return 'Completado';
    case 'CANCELADO': return 'Cancelado';
    default: return status;
  }
}

function mapStatusToBackend(status: string): 'PROGRAMADO' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO' {
  switch (status.toLowerCase()) {
    case 'pendiente': return 'PROGRAMADO';
    case 'en proceso': return 'EN_PROCESO';
    case 'completado': return 'COMPLETADO';
    case 'cancelado': return 'CANCELADO';
    default: return 'PROGRAMADO';
  }
}

function mapType(type: string): string {
  switch (type) {
    case 'PREVENTIVO': return 'Preventivo';
    case 'CORRECTIVO': return 'Correctivo';
    default: return type;
  }
}

function mapTypeToBackend(type: string): 'PREVENTIVO' | 'CORRECTIVO' {
  switch (type.toLowerCase()) {
    case 'preventivo': return 'PREVENTIVO';
    case 'correctivo': return 'CORRECTIVO';
    default: return 'PREVENTIVO';
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

function parseDate(dateString: string): string {
  if (!dateString) return '';
  // Asumiendo que dateString está en formato YYYY-MM-DD
  return `${dateString}T00:00:00`; // Añadimos la parte de la hora
}

export default maintenanceService;
