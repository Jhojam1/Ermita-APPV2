import axios from 'axios';

// Definir la URL base del API
const API_BASE_URL = 'http://localhost:8080';
const INVENTORY_URL = `${API_BASE_URL}/api/inventory`;
const COMPANY_URL = `${API_BASE_URL}/api/companies`;

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

export interface InventoryItem {
  id?: number;
  companyId: number;
  companyName?: string;
  sedeId: number;
  sedeName?: string;
  responsible: string;
  service: string;
  serial: string;
  internalCode?: number;
  brand: Brand;
  model: string;
  processor: string;
  ramMemory: string;
  hardDrive: string;
  typeInventoryItem: TypeInventoryItem;
  quantity: number;
  status: string;
  createdAt?: string;
}

// Servicio para manejar las operaciones de inventario
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
      const response = await inventoryApi.post(`/api/inventory/items`, item);
      return response.data;
    } catch (error) {
      console.error('Error al crear elemento de inventario:', error);
      throw error;
    }
  },

  // Actualizar un elemento de inventario
  updateItem: async (id: number, item: InventoryItem): Promise<InventoryItem> => {
    try {
      const response = await inventoryApi.put(`/api/inventory/items/${id}`, item);
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

  // Obtener todas las marcas
  getAllBrands: async (): Promise<Brand[]> => {
    try {
      const response = await inventoryApi.get(`/api/inventory/brands`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener marcas:', error);
      // En caso de error, devuelve datos de ejemplo
      return [
        { id: 1, name: 'Dell' },
        { id: 2, name: 'HP' },
        { id: 3, name: 'Lenovo' },
        { id: 4, name: 'Apple' },
        { id: 5, name: 'Asus' }
      ];
    }
  },

  // Crear una nueva marca
  createBrand: async (brand: { name: string }): Promise<Brand> => {
    try {
      const response = await inventoryApi.post(`/api/inventory/brands`, brand);
      return response.data;
    } catch (error) {
      console.error('Error al crear marca:', error);
      // Simulación de respuesta para desarrollo
      return { id: Math.floor(Math.random() * 1000), name: brand.name };
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
      // En caso de error, devuelve datos de ejemplo
      return [
        { id: 1, name: 'Laptop' },
        { id: 2, name: 'Desktop' },
        { id: 3, name: 'Servidor' },
        { id: 4, name: 'Impresora' },
        { id: 5, name: 'Monitor' }
      ];
    }
  },

  // Crear un nuevo tipo
  createType: async (type: { name: string }): Promise<TypeInventoryItem> => {
    try {
      const response = await inventoryApi.post(`/api/inventory/types`, type);
      return response.data;
    } catch (error) {
      console.error('Error al crear tipo:', error);
      // Simulación de respuesta para desarrollo
      return { id: Math.floor(Math.random() * 1000), name: type.name };
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
};

// Eliminar los métodos relacionados con empresas y sedes ya que ahora están en companyService.ts
// Métodos eliminados: getAllCompanies y getHeadquartersByCompany
// Ya que ahora están en companyService.ts

export default inventoryService;
