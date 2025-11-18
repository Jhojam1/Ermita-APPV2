import axios, { AxiosResponse } from 'axios';

// Definir la URL base del API
const API_BASE_URL = 'http://192.168.2.20:8080';

// Crear una instancia de axios con la URL base
const transferApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
transferApi.interceptors.request.use(
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

export interface InventoryTransfer {
  id: number;
  inventoryItemId: number;
  inventoryItemName: string;
  type: string;
  quantity: number;
  movementDate: string;
  userId: number;
  userName: string;
  description: string;
  reason: string;
  destinationCityId: number;
  destinationCityName: string;
  destinationCompanyId: number;
  destinationCompanyName: string;
  destinationHeadquarterId: number;
  destinationHeadquarterName: string;
  sourceCityId: number;
  sourceCityName: string;
  sourceCompanyId: number;
  sourceCompanyName: string;
  sourceHeadquarterId: number;
  sourceHeadquarterName: string;
}

export interface CreateInventoryTransferDTO {
  // Datos básicos de movimiento
  inventoryItemId: number;
  quantity: number;
  reason: string;
  description?: string;
  
  // Datos de origen
  sourceCityId: number;
  sourceCityName: string;
  sourceCompanyId: number;
  sourceCompanyName: string;
  sourceHeadquarterId: number;
  sourceHeadquarterName: string;
  
  // Datos de destino
  destinationCityId: number;
  destinationCityName: string;
  destinationCompanyId: number;
  destinationCompanyName: string;
  destinationHeadquarterId: number;
  destinationHeadquarterName: string;
}

const inventoryTransferService = {
  createTransfer: (transferData: CreateInventoryTransferDTO): Promise<AxiosResponse<InventoryTransfer>> => {
    return transferApi.post('/api/inventory/transfers', transferData);
  },

  getTransfersByItem: async (itemId: number): Promise<AxiosResponse<InventoryTransfer[]>> => {
    try {
      const response = await transferApi.get(`/api/inventory/transfers/item/${itemId}`);
      
      // Verificar si los datos son un objeto único o un array
      // y convertir a array si es necesario
      if (response.data && !Array.isArray(response.data) && typeof response.data === 'object') {
        console.log('Convirtiendo objeto único de traslado a array:', response.data);
        const normalizedData = [response.data];
        return { ...response, data: normalizedData };
      }
      
      return response;
    } catch (error) {
      console.error(`Error al obtener traslados del elemento con ID ${itemId}:`, error);
      // En caso de error, devolver un objeto de respuesta con array vacío
      return { 
        data: [], 
        status: 200, 
        statusText: 'Error controlado', 
        headers: {}, 
        config: {} as any,
        request: {}
      };
    }
  },

  getAllTransfers: (): Promise<AxiosResponse<InventoryTransfer[]>> => {
    return transferApi.get('/api/inventory/transfers');
  },

  getTransfersBySourceCompany: (companyId: number): Promise<AxiosResponse<InventoryTransfer[]>> => {
    return transferApi.get(`/api/inventory/transfers/source/company/${companyId}`);
  },

  getTransfersByDestinationCompany: (companyId: number): Promise<AxiosResponse<InventoryTransfer[]>> => {
    return transferApi.get(`/api/inventory/transfers/destination/company/${companyId}`);
  }
};

export default inventoryTransferService;
