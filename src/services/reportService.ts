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
  averageTime: string;
}

export interface MonthlyReport {
  month: string;
  preventiveMaintenance: number;
  correctiveMaintenance: number;
  totalMaintenance: number;
}

export interface TechnicianReport {
  id: number;
  name: string;
  maintenanceCount: number;
}

export interface DateRange {
  startDate: string; // Formato YYYY-MM-DD
  endDate: string;   // Formato YYYY-MM-DD
}

export interface DashboardData {
  summary: MaintenanceSummary[];
  monthlyStats: MonthlyReport[];
  technicianStats: TechnicianReport[];
}

// Servicio para manejar las operaciones de reportes
const reportService = {
  // Obtener resumen de mantenimientos
  getMaintenanceSummary: async (): Promise<MaintenanceSummary[]> => {
    if (USE_MOCK_DATA) {
      return [
        {
          type: 'Preventivo',
          quantity: 45,
          averageTime: '2.5 horas'
        },
        {
          type: 'Correctivo',
          quantity: 23,
          averageTime: '4 horas'
        }
      ];
    }

    try {
      const response = await reportApi.get(`${REPORTS_URL}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el resumen de mantenimientos:', error);
      
      // Datos de fallback para desarrollo
      return [
        {
          type: 'Preventivo',
          quantity: 45,
          averageTime: '2.5 horas'
        },
        {
          type: 'Correctivo',
          quantity: 23,
          averageTime: '4 horas'
        }
      ];
    }
  },

  // Obtener datos mensuales
  getMonthlyReport: async (year?: number): Promise<MonthlyReport[]> => {
    if (USE_MOCK_DATA) {
      return generateMockMonthlyData();
    }

    try {
      const url = year ? `${REPORTS_URL}/monthly?year=${year}` : `${REPORTS_URL}/monthly`;
      const response = await reportApi.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el reporte mensual:', error);
      
      // Datos de fallback para desarrollo
      return generateMockMonthlyData();
    }
  },

    // Obtener todos los datos para el dashboard
  getDashboardData: async (dateRange: DateRange): Promise<DashboardData> => {
    if (USE_MOCK_DATA) {
      console.log('Usando datos simulados para el dashboard');
      return {
        summary: [
          {
            type: 'Preventivo',
            quantity: 45,
            averageTime: '2.5 horas'
          },
          {
            type: 'Correctivo',
            quantity: 23,
            averageTime: '4 horas'
          }
        ],
        monthlyStats: generateMockMonthlyData(),
        technicianStats: generateMockTechnicianData()
      };
    }

    try {
      const { startDate, endDate } = dateRange;
      const url = `${REPORTS_URL}/dashboard?startDate=${startDate}&endDate=${endDate}`;
      
      console.log('Solicitando datos del dashboard con rango:', { startDate, endDate });
      const response = await reportApi.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los datos del dashboard:', error);
      throw new Error('Ha ocurrido un error al buscar los datos. Por favor, contacte con el administrador.');
    }
  },
  
  // Obtener resumen de mantenimientos
  getMaintenanceSummary: async (dateRange: DateRange): Promise<MaintenanceSummary[]> => {
    if (USE_MOCK_DATA) {
      return [
        {
          type: 'Preventivo',
          quantity: 45,
          averageTime: '2.5 horas'
        },
        {
          type: 'Correctivo',
          quantity: 23,
          averageTime: '4 horas'
        }
      ];
    }

    try {
      const { startDate, endDate } = dateRange;
      const url = `${REPORTS_URL}/summary?startDate=${startDate}&endDate=${endDate}`;
      const response = await reportApi.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el resumen de mantenimientos:', error);
      throw new Error('Ha ocurrido un error al obtener el resumen de mantenimientos. Por favor, contacte con el administrador.');
    }
  },
  
  // Obtener reporte mensual
  getMonthlyReport: async (dateRange: DateRange): Promise<MonthlyReport[]> => {
    if (USE_MOCK_DATA) {
      return generateMockMonthlyData();
    }

    try {
      const { startDate, endDate } = dateRange;
      const url = `${REPORTS_URL}/monthly?startDate=${startDate}&endDate=${endDate}`;
      const response = await reportApi.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el reporte mensual:', error);
      throw new Error('Ha ocurrido un error al obtener el reporte mensual. Por favor, contacte con el administrador.');
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
