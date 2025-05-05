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

export interface DashboardData {
  summary: MaintenanceSummary[];
  monthlyStats: MonthlyReport[];
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
  getDashboardData: async (year?: number): Promise<DashboardData> => {
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
        monthlyStats: generateMockMonthlyData()
      };
    }

    try {
      const url = year ? `${REPORTS_URL}/dashboard?year=${year}` : `${REPORTS_URL}/dashboard`;
      console.log('Intentando obtener datos de:', url);
      const response = await reportApi.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los datos del dashboard:', error);
      
      // Datos de fallback para desarrollo
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
        monthlyStats: generateMockMonthlyData()
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

export default reportService;
