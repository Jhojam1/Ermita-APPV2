import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import reportService, { MaintenanceSummary, MonthlyReport, DashboardData } from '../services/reportService';
import inventoryService from '../services/inventoryService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Reports() {
  const [periodo, setPeriodo] = useState('ultimo_año');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    summary: [],
    monthlyStats: []
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [equipmentStatus, setEquipmentStatus] = useState<{active: number, inactive: number}>({
    active: 0,
    inactive: 0
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await reportService.getDashboardData(selectedYear);
        console.log('Dashboard data received:', JSON.stringify(data, null, 2));
        setDashboardData(data);
        
        // Obtener datos de estado de equipos
        const statusData = await inventoryService.getEquipmentStatusSummary();
        console.log('Equipment status data:', statusData);
        setEquipmentStatus(statusData);
      } catch (error) {
        console.error('Error al cargar los datos de reportes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  // Preparar datos para el gráfico de barras
  const barChartData = {
    labels: dashboardData.monthlyStats.map(item => item.month.substring(0, 3)), // Primeras 3 letras del mes
    datasets: [
      {
        label: 'Preventivo',
        data: dashboardData.monthlyStats.map(item => item.preventiveMaintenance),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Correctivo',
        data: dashboardData.monthlyStats.map(item => item.correctiveMaintenance),
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1,
      }
    ]
  };

  // Preparar datos para el gráfico de tipos de mantenimiento
  const maintenanceTypeData = {
    labels: dashboardData.summary.map(item => item.type),
    datasets: [{
      data: dashboardData.summary.map(item => item.quantity),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(147, 51, 234)'
      ],
      borderWidth: 1
    }]
  };

  // Datos para el estado de equipos
  const equipmentStatusData = {
    labels: ['Activo', 'Inactivo'],
    datasets: [{
      data: [equipmentStatus.active, equipmentStatus.inactive],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 1
    }]
  };

  // Datos para el tiempo promedio (simulados por ahora)
  const averageTimeData = {
    labels: dashboardData.monthlyStats.map(item => item.month.substring(0, 3)),
    datasets: [{
      label: 'Horas',
      data: dashboardData.monthlyStats.map((_, index) => index < dashboardData.summary.length ? 
        parseFloat(dashboardData.summary[index % dashboardData.summary.length].averageTime) || 0 : 0),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // Generar años para el selector
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 5; year <= currentYear + 1; year++) {
    yearOptions.push(year);
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <AnimatedContainer>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Reportes y Estadísticas</h1>
      </AnimatedContainer>

      {/* Filtros de período */}
      <AnimatedContainer delay={0.1}>
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-wrap gap-4">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 text-sm md:text-base border rounded-lg flex-grow md:flex-grow-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button className="bg-blue-600 text-white px-6 py-2 text-sm md:text-base rounded-lg hover:bg-blue-700 transition-colors flex-grow md:flex-grow-0 font-medium">
            Generar Reporte
          </button>
        </div>
      </AnimatedContainer>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedContainer delay={0.2}>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Mantenimientos por Mes</h3>
            <div className="h-72">
              <Bar 
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={0.3}>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Estado de Equipos</h3>
            <div className="h-72">
              <Doughnut 
                data={equipmentStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        font: { size: 12 }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={0.4}>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Tipos de Mantenimiento</h3>
            <div className="h-72">
              <Doughnut 
                data={maintenanceTypeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        font: { size: 12 }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={0.5}>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Tiempo Promedio de Mantenimiento</h3>
            <div className="h-72">
              <Line 
                data={averageTimeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </AnimatedContainer>
      </div>

      {/* Tabla de Resumen */}
      <AnimatedContainer delay={0.6}>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <h3 className="text-lg font-semibold p-6 border-b">Resumen de Mantenimientos</h3>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Cantidad</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Tiempo Promedio</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.summary.map((item, index) => (
                  <tr key={index} className={index === dashboardData.summary.length - 1 ? "hover:bg-gray-50" : "border-b hover:bg-gray-50"}>
                    <td className="py-3 px-4 text-sm">{item.type}</td>
                    <td className="py-3 px-4 text-sm">{item.quantity}</td>
                    <td className="py-3 px-4 text-sm">{item.averageTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedContainer>
    </div>
  );
}
