import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = 'http://localhost:8080';
const REPORTS_URL = `${API_BASE_URL}/api/reports`;

// Flag para cambiar entre datos reales (cuando el backend funcione) y datos simulados
const USE_MOCK_DATA = false; // Cambia a false cuando el backend funcione

// Crear una instancia de axios con la URL base
const reportApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
reportApi.interceptors.request.use(
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
export interface MaintenanceSummary {
  type: string;
  quantity: number;
  averageTime: number; // Cambiado de string a number
}

export interface MonthlyReport {
  month: string;
  total: number;
  corrective: number;
  preventive: number;
}

export interface TechnicianReport {
  technicianId: string | null;
  technicianName: string;
  total: number;
}

export interface DashboardSummary {
  total: number;
  preventive: number;
  corrective: number;
  averagePreventiveTime: number;
  averageCorrectiveTime: number;
}

export interface DateRange {
  startDate: string; // Formato YYYY-MM-DD
  endDate: string;   // Formato YYYY-MM-DD
}

export interface ScheduledVsCompletedData {
  yearMonth: string;
  scheduled: number;
  completed: number;
}

export interface MaintenanceOverviewData {
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  monthlyStats: MonthlyReport[];
  technicianStats: { [key: string]: TechnicianReport[] };
  equipmentStatus: { [key: string]: number };
  scheduledVsCompleted?: ScheduledVsCompletedData[];
  maintenanceOverview?: MaintenanceOverviewData;
}

// Servicio para manejar las operaciones de reportes
const reportService = {

  // Obtener datos del dashboard
  getDashboardData: async (dateRange: DateRange): Promise<DashboardData> => {
    if (USE_MOCK_DATA) {
      return {
        summary: {
          total: 150,
          preventive: 100,
          corrective: 50,
          averagePreventiveTime: 2.5,
          averageCorrectiveTime: 4.2
        },
        monthlyStats: [
          {
            month: '2025-05',
            preventive: 75,
            corrective: 25,
            total: 100
          },
          {
            month: '2025-04',
            preventive: 25,
            corrective: 25,
            total: 50
          }
        ],
        technicianStats: {
          '2025-05': [
            { technicianId: '1', technicianName: 'Juan Pérez', total: 30 },
            { technicianId: '2', technicianName: 'María Gómez', total: 45 }
          ]
        },
        equipmentStatus: {
          'activo': 85,
          'inactivo': 15
        }
      };
    }

    try {
      const { startDate, endDate } = dateRange;
      const response = await reportApi.get(`${REPORTS_URL}/dashboard`, {
        params: { 
          startDate,
          endDate
        }
      });
      
      // Formatear los datos para que coincidan con la interfaz
      const data = response.data;
      
      // Si el backend no envía equipmentStatus, lo inicializamos
      if (!data.equipmentStatus) {
        data.equipmentStatus = { activo: 0, inactivo: 0 };
      }
      
      return data as DashboardData;
      
    } catch (error) {
      console.error('Error al obtener los datos del dashboard:', error);
      // Devolver datos vacíos en caso de error
      return {
        summary: {
          total: 0,
          preventive: 0,
          corrective: 0,
          averagePreventiveTime: 0,
          averageCorrectiveTime: 0
        },
        monthlyStats: [],
        technicianStats: {},
        equipmentStatus: { activo: 0, inactivo: 0 }
      };
    }
  },

  // Obtener reporte mensual por rango de fechas o año
  getMonthlyReport: async (dateRange: DateRange | number): Promise<MonthlyReport[]> => {
    if (USE_MOCK_DATA) {
      return generateMockMonthlyData();
    }

    try {
      const params: any = {};
      
      if (typeof dateRange === 'number') {
        // Si es un número, asumimos que es un año
        params.year = dateRange;
      } else if (dateRange) {
        // Si es un objeto DateRange, usamos las fechas
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }
      
      const response = await reportApi.get('/api/maintenance/report/monthly', { params });
      
      // Mapear la respuesta al formato esperado
      if (Array.isArray(response.data)) {
        return response.data.map((item: any) => ({
          month: item.month,
          preventiveMaintenance: item.preventive || 0,
          correctiveMaintenance: item.corrective || 0,
          totalMaintenance: (item.preventive || 0) + (item.corrective || 0)
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error al obtener el reporte mensual:', error);
      // En caso de error, devolver datos vacíos
      return [];
    }
  },

  // Obtener estadísticas de técnicos
  getTechnicianStats: async (dateRange: DateRange): Promise<TechnicianReport[]> => {
    if (USE_MOCK_DATA) {
      return generateMockTechnicianData();
    }

    try {
      const { startDate, endDate } = dateRange || {};
      const response = await reportApi.get('/api/maintenance/report/technician-stats', {
        params: { 
          startDate: startDate || '',
          endDate: endDate || ''
        }
      });
      
      console.log('Datos de técnicos recibidos:', response.data);
      
      // Asegurarse de que la respuesta sea un array
      if (!Array.isArray(response.data)) {
        console.error('La respuesta de técnicos no es un array:', response.data);
        return [];
      }
      
      // Mapear la respuesta al formato esperado
      return response.data.map((tech: any) => ({
        id: tech.id || 0,
        name: tech.name || 'Técnico sin nombre',
        maintenanceCount: tech.maintenanceCount || 0
      }));
    } catch (error) {
      console.error('Error al obtener las estadísticas de técnicos:', error);
      // En lugar de lanzar un error, devolvemos un array vacío
      return [];
    }
  },

  // Obtener datos de mantenimientos programados vs. realizados
  async getScheduledVsCompletedReport(dateRange: DateRange): Promise<ScheduledVsCompletedData[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await axios.get(`${REPORTS_URL}/scheduled-vs-completed`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error al obtener datos de mantenimientos programados vs. realizados:', error);
      return [];
    }
  },

  // Obtener datos de visión general de mantenimientos
  async getMaintenanceOverview(dateRange: DateRange): Promise<MaintenanceOverviewData> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await axios.get(`${REPORTS_URL}/maintenance-overview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error al obtener datos de visión general de mantenimientos:', error);
      return {
        scheduled: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        total: 0
      };
    }
  },

  // Obtener todos los datos para el dashboard
  async getDashboardData(dateRange: DateRange): Promise<DashboardData> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Intentar obtener los datos del dashboard
      let dashboardResponse;
      try {
        dashboardResponse = await axios.get(`${REPORTS_URL}/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          }
        });
      } catch (dashboardError) {
        console.warn('Error al obtener datos del dashboard, intentando obtener datos individualmente', dashboardError);
        dashboardResponse = { data: {} };
      }

      // Crear un objeto de datos con valores por defecto
      const dashboardData: DashboardData = {
        summary: {
          total: 0,
          preventive: 0,
          corrective: 0,
          averagePreventiveTime: 0,
          averageCorrectiveTime: 0
        },
        monthlyStats: [],
        technicianStats: {},
        equipmentStatus: { activo: 0, inactivo: 0 },
        scheduledVsCompleted: [],
        maintenanceOverview: {
          scheduled: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          total: 0
        }
      };

      // Obtener datos de resumen
      try {
        if (dashboardResponse.data?.summary) {
          dashboardData.summary = dashboardResponse.data.summary;
        } else {
          const summary = await this.getMaintenanceSummary(dateRange);
          dashboardData.summary = summary;
        }
      } catch (error) {
        console.error('Error al obtener el resumen:', error);
      }

      // Obtener estadísticas mensuales
      try {
        if (dashboardResponse.data?.monthlyStats) {
          dashboardData.monthlyStats = dashboardResponse.data.monthlyStats;
        } else {
          const monthlyStats = await this.getMonthlyReport(dateRange);
          dashboardData.monthlyStats = monthlyStats;
        }
      } catch (error) {
        console.error('Error al obtener estadísticas mensuales:', error);
      }

      // Obtener estadísticas de técnicos
      try {
        if (dashboardResponse.data?.technicianStats) {
          dashboardData.technicianStats = dashboardResponse.data.technicianStats;
        } else {
          const technicianStats = await this.getTechnicianStats(dateRange);
          dashboardData.technicianStats = technicianStats;
        }
      } catch (error) {
        console.error('Error al obtener estadísticas de técnicos:', error);
      }
      
      // Obtener datos de mantenimientos programados vs. realizados
      try {
        const scheduledVsCompleted = await this.getScheduledVsCompletedReport(dateRange);
        dashboardData.scheduledVsCompleted = scheduledVsCompleted;
      } catch (error) {
        console.error('Error al obtener datos de mantenimientos programados vs. realizados:', error);
      }
      
      // Obtener datos de visión general de mantenimientos
      try {
        const maintenanceOverview = await this.getMaintenanceOverview(dateRange);
        dashboardData.maintenanceOverview = maintenanceOverview;
      } catch (error) {
        console.error('Error al obtener datos de visión general de mantenimientos:', error);
      }

      return dashboardData;
    } catch (error) {
      console.error('Error al obtener los datos del dashboard:', error);
      // Devolver datos vacíos en lugar de lanzar el error
      return {
        summary: {
          total: 0,
          preventive: 0,
          corrective: 0,
          averagePreventiveTime: 0,
          averageCorrectiveTime: 0
        },
        monthlyStats: [],
        technicianStats: {},
        equipmentStatus: { activo: 0, inactivo: 0 },
        scheduledVsCompleted: [],
        maintenanceOverview: {
          scheduled: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          total: 0
        }
      };
    }
  }
};

// Función para generar datos mensuales de ejemplo
function generateMockMonthlyData(): MonthlyReport[] {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return months.map(month => {
    const preventive = Math.floor(Math.random() * 10) + 2;
    const corrective = Math.floor(Math.random() * 5) + 1;
    
    return {
      month,
      preventiveMaintenance: preventive,
      correctiveMaintenance: corrective,
      totalMaintenance: preventive + corrective
    };
  });
}

// Función para generar datos de ejemplo de técnicos
function generateMockTechnicianData(): TechnicianReport[] {
  const technicianNames = [
    'Juan Pérez',
    'María García',
    'Carlos López',
    'Ana Martínez',
    'Luis Rodríguez'
  ];
  
  return technicianNames.map((name, index) => ({
    id: index + 1,
    name,
    maintenanceCount: Math.floor(Math.random() * 20) + 5 // Entre 5 y 24 mantenimientos
  }));
}

export default reportService;
