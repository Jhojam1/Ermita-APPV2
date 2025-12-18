import axios from 'axios';

// Definir la URL base del API
const API_BASE_URL = 'http://192.168.2.20:8080';
const INVENTORY_URL = `${API_BASE_URL}/api/inventory`;

// Crear una instancia de axios con la URL base
const inventoryApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
inventoryApi.interceptors.request.use(
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

// Interfaces adicionales para inventario
export interface Brand {
  id?: number;
  name: string;
}

export interface TypeInventoryItem {
  id?: number;
  name: string;
}

export interface EquipmentStatus {
  id?: number;
  name: string;
}

export interface InventoryItem {
  id?: number;
  cityId: number;
  cityName?: string;
  companyId: number;
  companyName?: string;
  sedeId: number;
  sedeName?: string;
  responsible: string;
  service: string;
  program?: string;
  equipmentName?: string;
  serial: string;
  internalCode?: string;
  brand: Brand;
  model: string;
  processor: string;
  ramMemory: string;
  hardDrive: string;
  monitor?: string;
  typeInventoryItem: TypeInventoryItem;
  quantity: number;
  status: string;
  equipmentStatus?: EquipmentStatus;
  lastMaintenanceDate?: string;
  purchaseDate?: string;
  anyDeskId?: string;
  email?: string;
  observations?: string;
  createdByUserId?: number;
  createdAt?: string;
  updatedByUserId?: number;
  updatedAt?: string;
}

// Servicio para manejar las operaciones de inventario
// Interfaz para movimientos de inventario
export interface InventoryMovement {
  id: number;
  inventoryItemId: number;
  type: string;
  quantity: number;
  movementDate: string;
  userId: number;
  userName: string;
  description: string;
}

const inventoryService = {
  // Obtener todos los elementos del inventario
  getAllItems: async (): Promise<InventoryItem[]> => {
    try {
      const response = await inventoryApi.get(`/api/inventory/items`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener elementos del inventario:', error);
      throw error;
    }
  },

  // Obtener un elemento del inventario por ID
  getItemById: async (id: number): Promise<InventoryItem> => {
    try {
      const response = await inventoryApi.get(`/api/inventory/items/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el elemento con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo elemento de inventario
  createItem: async (item: InventoryItem): Promise<InventoryItem> => {
    try {
      console.log('📤 [FRONTEND] Enviando petición POST a /api/inventory/items');
      console.log('📦 [FRONTEND] Datos a enviar:', JSON.stringify(item, null, 2));
      const response = await inventoryApi.post(`/api/inventory/items`, item);
      console.log('✅ [FRONTEND] Respuesta recibida:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [FRONTEND] Error al crear elemento de inventario:', error);
      console.error('❌ [FRONTEND] Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Actualizar un elemento del inventario
  updateItem: async (id: number, itemData: Partial<InventoryItem>): Promise<InventoryItem> => {
    try {
      const response = await axios.put(`${INVENTORY_URL}/items/${id}`, itemData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el elemento con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un elemento de inventario
  deleteItem: async (id: number): Promise<void> => {
    try {
      await inventoryApi.delete(`/api/inventory/items/${id}`);
    } catch (error) {
      console.error(`Error al eliminar el elemento con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener resumen de estado de equipos (activo/inactivo)
  getEquipmentStatusSummary: async (): Promise<{active: number, inactive: number}> => {
    try {
      const items = await inventoryService.getAllItems();
      
      // Contar elementos por estado
      const statusCount = {
        active: 0,
        inactive: 0
      };
      
      items.forEach(item => {
        if (item.status?.toLowerCase() === 'activo') {
          statusCount.active++;
        } else {
          statusCount.inactive++;
        }
      });
      
      return statusCount;
    } catch (error) {
      console.error('Error al obtener resumen de estados de equipos:', error);
      // Devolver datos de respaldo si falla
      return { active: 0, inactive: 0 };
    }
  },

  // Obtener todas las marcas
  getAllBrands: async (): Promise<Brand[]> => {
    try {
      const response = await inventoryApi.get(`/api/inventory/brands`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener marcas:', error);
      throw error;
    }
  },

  // Crear una nueva marca
  createBrand: async (brand: { name: string }): Promise<Brand> => {
    try {
      const response = await inventoryApi.post(`/api/inventory/brands`, brand);
      return response.data;
    } catch (error) {
      console.error('Error al crear marca:', error);
      throw error;
    }
  },

  // Eliminar una marca
  deleteBrand: async (id: number): Promise<void> => {
    try {
      await inventoryApi.delete(`/api/inventory/brands/${id}`);
    } catch (error) {
      console.error(`Error al eliminar la marca con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener todos los tipos de elementos de inventario
  getAllTypes: async (): Promise<TypeInventoryItem[]> => {
    try {
      const response = await inventoryApi.get(`/api/inventory/types`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener tipos de elementos:', error);
      throw error;
    }
  },

  // Crear un nuevo tipo
  createType: async (type: { name: string }): Promise<TypeInventoryItem> => {
    try {
      const response = await inventoryApi.post(`/api/inventory/types`, type);
      return response.data;
    } catch (error) {
      console.error('Error al crear tipo:', error);
      throw error;
    }
  },

  // Eliminar un tipo
  deleteType: async (id: number): Promise<void> => {
    try {
      await inventoryApi.delete(`/api/inventory/types/${id}`);
    } catch (error) {
      console.error(`Error al eliminar el tipo con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener todos los estados de equipo
  getAllEquipmentStatuses: async (): Promise<EquipmentStatus[]> => {
    try {
      const response = await inventoryApi.get(`/api/inventory/equipment-statuses`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estados de equipo:', error);
      throw error;
    }
  },

  // Crear un nuevo estado de equipo
  createEquipmentStatus: async (status: { name: string }): Promise<EquipmentStatus> => {
    try {
      const response = await inventoryApi.post(`/api/inventory/equipment-statuses`, status);
      return response.data;
    } catch (error) {
      console.error('Error al crear estado de equipo:', error);
      throw error;
    }
  },

  // Eliminar un estado de equipo
  deleteEquipmentStatus: async (id: number): Promise<void> => {
    try {
      await inventoryApi.delete(`/api/inventory/equipment-statuses/${id}`);
    } catch (error) {
      console.error(`Error al eliminar el estado de equipo con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Obtener todos los movimientos de un elemento de inventario
  getMovementsByItem: async (itemId: number): Promise<InventoryMovement[]> => {
    try {
      const response = await inventoryApi.get(`/api/inventory/movements/item/${itemId}`);
      const data = response.data;
      
      // Verificar si los datos son un objeto único o un array
      // y convertir a array si es necesario
      if (data && !Array.isArray(data) && typeof data === 'object') {
        console.log('Convirtiendo objeto único a array:', data);
        return [data];
      } else if (Array.isArray(data)) {
        return data;
      } else {
        console.log('Datos de movimientos no válidos:', data);
        return [];
      }
    } catch (error) {
      console.error(`Error al obtener movimientos del elemento con ID ${itemId}:`, error);
      // En caso de error, devolver un array vacío para evitar errores en la UI
      return [];
    }
  },
};

// Eliminar los métodos relacionados con empresas y sedes ya que ahora están en companyService.ts
// Métodos eliminados: getAllCompanies y getHeadquartersByCompany
// Ya que ahora están en companyService.ts

export default inventoryService;
