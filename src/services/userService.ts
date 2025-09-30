import axios from 'axios';

// Configuración base de axios
const API_URL = 'http://192.168.2.64:8080/api/v1/users';

// Crear una instancia de axios con la URL base
const userApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
userApi.interceptors.request.use(
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

// Interfaces para los datos que vienen del backend
export interface UserItem {
  id?: number;
  fullName: string;
  numberIdentification: number;
  state: string;
  mail: string;
  password?: string;
  numberPhone?: string;
  role?: string; // Mantener para compatibilidad
  roleName?: string; // Nuevo campo del backend
  roleId?: number;
  companyId?: number;
  headquarterId?: number;
  companyName?: string;
  headquarterName?: string;
  signature?: string;
}

// Interfaces para los datos que se muestran en la UI
export interface UserItemUI {
  id: string;
  nombre: string;
  identificacion: string;
  estado: string;
  email: string;
  telefono: string;
  rol: string;
  roleId?: number; // Agregar roleId para preservarlo
  empresa: string;
  sede: string;
  companyId?: number;
  headquarterId?: number;
  firma?: string;
}

const userService = {
  // Obtener todos los usuarios
  getAllUsers: async (): Promise<UserItem[]> => {
    try {
      const response = await userApi.get('');
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  // Obtener un usuario por ID
  getUserById: async (id: number): Promise<UserItem> => {
    try {
      const response = await userApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Obtener la firma de un usuario por ID
  getUserSignature: async (id: number): Promise<string | null> => {
    try {
      console.log(`[DEBUG] Obteniendo firma del usuario con ID ${id}`);
      const user = await userService.getUserById(id);
      if (user && user.signature) {
        console.log(`[DEBUG] Firma encontrada para el usuario ${user.fullName}`);
        // Verificar si la firma ya tiene el prefijo de data URL
        if (!user.signature.startsWith('data:')) {
          return `data:image/png;base64,${user.signature}`;
        }
        return user.signature;
      }
      console.log(`[DEBUG] No se encontró firma para el usuario con ID ${id}`);
      return null;
    } catch (error) {
      console.error(`Error al obtener la firma del usuario con ID ${id}:`, error);
      return null;
    }
  },

  // Crear un nuevo usuario
  createUser: async (user: UserItem): Promise<UserItem> => {
    try {
      console.log('Datos enviados al backend para crear usuario:', user);
      
      // Asegurarse de que los IDs sean números válidos
      const userData = {
        ...user,
        companyId: user.companyId ? Number(user.companyId) : undefined,
        headquarterId: user.headquarterId ? Number(user.headquarterId) : undefined,
        roleId: user.roleId ? Number(user.roleId) : undefined
      };
      
      const response = await userApi.post('/save', userData);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  // Actualizar un usuario existente
  updateUser: async (id: number, user: UserItem): Promise<UserItem> => {
    try {
      console.log('Datos enviados al backend para actualizar usuario:', user);
      
      // Asegurarse de que los IDs sean números válidos
      const userData = {
        ...user,
        companyId: user.companyId ? Number(user.companyId) : undefined,
        headquarterId: user.headquarterId ? Number(user.headquarterId) : undefined,
        roleId: user.roleId ? Number(user.roleId) : undefined
      };
      
      const response = await userApi.put(`/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un usuario
  deleteUser: async (id: number): Promise<void> => {
    try {
      await userApi.delete(`/${id}`);
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }
  },

  // Cambiar el estado de un usuario (activar/desactivar)
  toggleUserStatus: async (id: number): Promise<UserItem> => {
    try {
      const response = await userApi.patch(`/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar el estado del usuario con ID ${id}:`, error);
      throw error;
    }
  },

  // Asignar empresa y sede a un usuario
  assignCompanyAndHeadquarter: async (userId: number, companyId: number, headquarterId: number): Promise<void> => {
    try {
      await userApi.post(`/${userId}/company/${companyId}/headquarter/${headquarterId}`);
    } catch (error) {
      console.error(`Error al asignar empresa y sede al usuario con ID ${userId}:`, error);
      throw error;
    }
  },

  // Mapeo de datos del backend a la UI
  mapToUI: (user: UserItem): UserItemUI => {
    return {
      id: user.id?.toString() || '',
      nombre: user.fullName || '',
      identificacion: user.numberIdentification?.toString() || '',
      estado: user.state || 'Inactivo',
      email: user.mail || '',
      telefono: user.numberPhone || '',
      rol: user.roleName || user.role || 'Usuario', // Usar roleName primero, luego role como fallback
      roleId: user.roleId, // Preservar el roleId del backend
      empresa: user.companyName || 'No asignada',
      sede: user.headquarterName || 'No asignada',
      companyId: user.companyId,
      headquarterId: user.headquarterId,
      firma: user.signature,
    };
  },

  // Mapeo de datos de la UI al backend
  mapToBackend: (user: UserItemUI): UserItem => {
    return {
      id: user.id ? parseInt(user.id) : undefined,
      fullName: user.nombre,
      numberIdentification: parseInt(user.identificacion) || 0,
      state: user.estado,
      mail: user.email,
      numberPhone: user.telefono,
      role: user.rol,
      roleId: user.roleId, // Preservar el roleId de la UI
      companyId: user.companyId,
      headquarterId: user.headquarterId,
      signature: user.firma,
      // No incluimos password aquí para evitar sobrescribir la contraseña en actualizaciones
    };
  }
};

export default userService;
