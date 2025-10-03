import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = 'http://192.168.2.64:8080';
const TECHNICIAN_ASSIGNMENT_URL = `${API_BASE_URL}/api/v1/maintenance/assignments`;

// Crear una instancia de axios con la URL base
const technicianAssignmentApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
technicianAssignmentApi.interceptors.request.use(
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

// Interfaces
export interface MaintenanceAssignment {
  id: number;
  inventoryItemId: number;
  inventoryItemSerial?: string;
  inventoryItemName?: string;
  companyId: number;
  headquarterId: number;
  serviceArea?: string;
  responsible?: string;
  description?: string;
  scheduledDate: string;
  completionDate?: string;
  type: 'PREVENTIVO' | 'CORRECTIVO';
  status: 'PROGRAMADO' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO' | 'VENCIDO';
  technicianId?: number;
  technicianName?: string;
  observations?: string;
  signature?: string;
  signerName?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt?: string;
  isAutoScheduled: boolean;
}

export interface TechnicianProductivityStats {
  technicianId: number;
  technicianName?: string;
  totalAssigned: number;
  completed: number;
  inProgress: number;
  overdue: number;
  pending: number;
  programmed?: number;
  activeWork?: number;
  efficiency: number;
}

export interface AssignmentSummary {
  totalTechnicians: number;
  totalAssigned: number;
  totalCompleted: number;
  totalUnassigned: number;
  averageEfficiency: number;
  topTechnician: string;
  technicianStats: TechnicianProductivityStats[];
}

export interface TechnicianUser {
  id: number;
  fullName: string;
  mail: string;
  role: string;
  numberIdentification?: number;
}

// Servicio para manejar las operaciones de asignación de técnicos
const technicianAssignmentService = {

  /**
   * Asignar técnico a un mantenimiento específico
   */
  async assignTechnician(maintenanceId: number, technicianId: number, technicianName: string): Promise<MaintenanceAssignment> {
    console.log(`[DEBUG] Asignando técnico...`, { maintenanceId, technicianId, technicianName });
    try {
      const response = await technicianAssignmentApi.post(
        `${TECHNICIAN_ASSIGNMENT_URL}/${maintenanceId}/assign`,
        null,
        {
          params: {
            technicianId,
            technicianName
          }
        }
      );
      console.log('[DEBUG] Respuesta de asignación:', response.data);
      return response.data;
    } catch (error) {
      console.error('[ERROR] Error asignando técnico:', error);
      throw error;
    }
  },

  /**
   * Desasignar técnico de un mantenimiento
   */
  async unassignTechnician(maintenanceId: number): Promise<MaintenanceAssignment> {
    try {
      const response = await technicianAssignmentApi.delete(
        `${TECHNICIAN_ASSIGNMENT_URL}/${maintenanceId}/unassign`
      );
      return response.data;
    } catch (error) {
      console.error('Error desasignando técnico:', error);
      throw error;
    }
  },

  /**
   * Asignación masiva de técnico a múltiples mantenimientos
   */
  async bulkAssignTechnician(maintenanceIds: number[], technicianId: number, technicianName: string): Promise<MaintenanceAssignment[]> {
    try {
      const response = await technicianAssignmentApi.post(
        `${TECHNICIAN_ASSIGNMENT_URL}/bulk-assign`,
        {
          maintenanceIds: maintenanceIds,
          technicianId: technicianId,
          technicianName: technicianName
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error en asignación masiva:', error);
      throw error;
    }
  },

  /**
   * Obtener mantenimientos asignados a un técnico específico
   */
  getMaintenancesByTechnician(technicianId: number): Promise<MaintenanceAssignment[]> {
    return technicianAssignmentApi.get(`${TECHNICIAN_ASSIGNMENT_URL}/assigned`, {
      params: {
        technicianId
      }
    }).then(response => {
      console.log('Mantenimientos del técnico obtenidos:', response.data);
      return response.data;
    }).catch(error => {
      console.error('Error obteniendo mantenimientos del técnico:', error);
      throw error;
    });
  },

  /**
   * Alias para getMaintenancesByTechnician (usado por algunos componentes)
   */
  async assignTechnicianToMaintenance(maintenanceId: number, technicianId: number): Promise<void> {
    try {
      await this.assignTechnician(maintenanceId, technicianId, '');
    } catch (error) {
      console.error('Error asignando técnico:', error);
      throw error;
    }
  },

  /**
   * Obtener mantenimientos asignados a un técnico específico
   */
  async getAssignedMaintenances(technicianId: number): Promise<MaintenanceAssignment[]> {
    try {
      const response = await technicianAssignmentApi.get(
        `${TECHNICIAN_ASSIGNMENT_URL}/assigned`,
        {
          params: {
            technicianId
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo mantenimientos asignados:', error);
      throw error;
    }
  },

  /**
   * Obtener mantenimientos sin asignar
   */
  async getUnassignedMaintenances(companyId: number, headquarterId: number): Promise<MaintenanceAssignment[]> {
    try {
      const response = await technicianAssignmentApi.get(
        `${TECHNICIAN_ASSIGNMENT_URL}/unassigned`,
        {
          params: {
            companyId,
            headquarterId
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo mantenimientos sin asignar:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de productividad de un técnico específico
   */
  async getTechnicianProductivityStats(technicianId: number): Promise<TechnicianProductivityStats> {
    try {
      const response = await technicianAssignmentApi.get(
        `${TECHNICIAN_ASSIGNMENT_URL}/productivity/stats`,
        {
          params: {
            technicianId: technicianId
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas del técnico:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de productividad de todos los técnicos
   */
  async getAllTechniciansProductivityStats(companyId: number, headquarterId: number): Promise<TechnicianProductivityStats[]> {
    try {
      const response = await technicianAssignmentApi.get(
        `${TECHNICIAN_ASSIGNMENT_URL}/productivity/all-stats`,
        {
          params: {
            companyId,
            headquarterId
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de todos los técnicos:', error);
      throw error;
    }
  },

  /**
   * Obtener resumen de asignaciones (dashboard)
   */
  async getAssignmentSummary(companyId: number, headquarterId: number): Promise<AssignmentSummary> {
    try {
      const response = await technicianAssignmentApi.get(
        `${TECHNICIAN_ASSIGNMENT_URL}/summary`,
        {
          params: {
            companyId,
            headquarterId
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo resumen de asignaciones:', error);
      throw error;
    }
  },

  /**
   * Obtener lista de técnicos disponibles desde microservice-users
   */
  async getTechnicians(): Promise<TechnicianUser[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/users/technicians`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.map((user: any) => ({
        id: user.id,
        fullName: user.fullName,
        mail: user.mail,
        role: user.role
      }));
    } catch (error) {
      console.error('Error obteniendo lista de técnicos:', error);
      throw error;
    }
  }
};

export default technicianAssignmentService;
