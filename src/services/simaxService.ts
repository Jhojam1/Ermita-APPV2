import axios from 'axios';

const SIMAX_API_BASE_URL = 'http://192.168.2.20:8080/api/v1/backup';

// Interfaces para SIMAX
export interface BackupConfiguration {
  id?: number;
  clientId: string;
  sourceDirectory: string;
  frequencyHours: number;
  sshHost: string;
  sshPort: number;
  sshUsername: string;
  sshPassword: string;
  sshRemotePath: string;
  clientHostname?: string;
  clientIpAddress?: string;
  alias?: string; // Nombre del responsable del computador
  useManualPath?: boolean;
  useScheduledTime?: boolean; // Usar hora específica diaria
  scheduledTime?: string; // Hora específica en formato HH:mm
  isPaused?: boolean; // Pausar backups automáticos
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastBackupAt?: string;
  includedFiles?: string[];
  excludedFiles?: string[];
}

export interface BackupJob {
  id: number;
  configurationId: number;
  clientId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  jobType: 'MANUAL' | 'SCHEDULED';
  startedAt: string;
  finishedAt?: string;
  filesProcessed?: number;
  filesTotal?: number;
  bytesTransferred?: number;
  errorMessage?: string;
  logDetails?: string;
  progressPercentage?: number;
  durationSeconds?: number;
  statusDescription?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class SimaxService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: SIMAX_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token de autenticación si existe
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Configuraciones de backup
  async saveConfiguration(config: BackupConfiguration): Promise<ApiResponse<BackupConfiguration>> {
    try {
      const response = await this.axiosInstance.post('/configuration', config);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error guardando configuración' 
      };
    }
  }

  async getConfiguration(clientId: string): Promise<ApiResponse<BackupConfiguration>> {
    try {
      const response = await this.axiosInstance.get(`/configuration/${clientId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: true, data: undefined };
      }
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error obteniendo configuración' 
      };
    }
  }

  async getAllActiveConfigurations(): Promise<ApiResponse<BackupConfiguration[]>> {
    try {
      const response = await this.axiosInstance.get('/configurations');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error obteniendo configuraciones activas' 
      };
    }
  }

  async getAllConfigurations(): Promise<ApiResponse<BackupConfiguration[]>> {
    try {
      const response = await this.axiosInstance.get('/configurations/all');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error obteniendo todas las configuraciones' 
      };
    }
  }

  // Jobs de backup
  async startBackup(clientId: string): Promise<ApiResponse<{ jobId: number; message: string }>> {
    try {
      const response = await this.axiosInstance.post(`/start/${clientId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error iniciando backup' 
      };
    }
  }

  async getJobsByClient(clientId: string, limit: number = 10): Promise<ApiResponse<BackupJob[]>> {
    try {
      const response = await this.axiosInstance.get(`/jobs/${clientId}?limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error obteniendo jobs' 
      };
    }
  }

  async getActiveJobs(): Promise<ApiResponse<BackupJob[]>> {
    try {
      const response = await this.axiosInstance.get('/jobs/active');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error obteniendo jobs activos' 
      };
    }
  }

  // Prueba de conexión SSH
  async testSshConnection(clientId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.post(`/test-ssh/${clientId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Error probando conexión SSH' 
      };
    }
  }

  async pauseBackups(clientId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.post(`/pause/${clientId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Error pausando backups' 
      };
    }
  }

  async resumeBackups(clientId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.post(`/resume/${clientId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Error reanudando backups' 
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; service: string; timestamp: number }>> {
    try {
      const response = await this.axiosInstance.get('/health');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: 'Servicio SIMAX no disponible' 
      };
    }
  }
}

export const simaxService = new SimaxService();
export default simaxService;
