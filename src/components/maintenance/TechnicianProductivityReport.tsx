import { useState, useEffect } from 'react';
import { 
  TrophyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import technicianAssignmentService, { 
  TechnicianProductivityStats
} from '../../services/technicianAssignmentService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function TechnicianProductivityReport() {
  const [productivityStats, setProductivityStats] = useState<TechnicianProductivityStats[]>([]);
  const [allTechniciansStats, setAllTechniciansStats] = useState<TechnicianProductivityStats | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianProductivityStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Obtener datos del usuario actual
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const companyId = user?.idcompany || 1;
  const headquarterId = user?.idheadquarter || 1;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allStatsData = await technicianAssignmentService.getAllTechniciansProductivityStats(companyId, headquarterId);

      console.log('=== DATOS DE PRODUCTIVIDAD DE TÉCNICOS ===');
      console.log('📊 Estadísticas generales de todos los técnicos:', allStatsData);
      console.log('🏢 Parámetros de consulta - CompanyId:', companyId, 'HeadquarterId:', headquarterId);
      
      // Análisis de datos faltantes
      if (!Array.isArray(allStatsData) || allStatsData.length === 0) {
        console.warn('⚠️ PROBLEMA: No hay estadísticas de productividad para técnicos');
        console.warn('📋 Posibles causas:');
        console.warn('   - No hay mantenimientos asignados a técnicos en esta empresa/sede');
        console.warn('   - Los mantenimientos están en estado PROGRAMADO (no se cuentan como productividad)');
        console.warn('   - El technicianId no está siendo guardado correctamente');
        console.warn('   - Los parámetros companyId/headquarterId no coinciden');
      }

      // Usar los datos directamente del backend
      if (Array.isArray(allStatsData) && allStatsData.length > 0) {
        console.log('📈 Procesando estadísticas:', allStatsData);
        setProductivityStats(allStatsData);
        setAllTechniciansStats(allStatsData[0]);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopPerformers = () => {
    console.log('🏆 Calculando top performers con datos:', productivityStats);
    const topPerformers = [...productivityStats]
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 5);
    console.log('🏆 Top performers calculados:', topPerformers);
    return topPerformers;
  };

  const getEfficiencyTrend = (efficiency: number) => {
    if (efficiency >= 80) return { color: 'text-green-600', icon: ArrowUpIcon, label: 'Excelente' };
    if (efficiency >= 60) return { color: 'text-yellow-600', icon: ArrowUpIcon, label: 'Bueno' };
    return { color: 'text-red-600', icon: ArrowDownIcon, label: 'Necesita Mejora' };
  };

  const getBarChartData = () => {
    const topPerformers = getTopPerformers();
    return {
      labels: topPerformers.map(t => t.technicianName || 'Sin nombre'),
      datasets: [
        {
          label: 'Completados',
          data: topPerformers.map(t => t.completed || 0),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          label: 'En Proceso',
          data: topPerformers.map(t => t.inProgress || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
        {
          label: 'Vencidos',
          data: topPerformers.map(t => t.overdue || 0),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getEfficiencyChartData = () => {
    const topPerformers = getTopPerformers();
    return {
      labels: topPerformers.map(t => t.technicianName || 'Sin nombre'),
      datasets: [
        {
          label: 'Eficiencia (%)',
          data: topPerformers.map(t => t.efficiency || 0),
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getDoughnutChartData = (stats: TechnicianProductivityStats) => {
    return {
      labels: ['Completados', 'En Proceso', 'Vencidos'],
      datasets: [
        {
          data: [stats.completed || 0, stats.inProgress || 0, stats.overdue || 0],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y Controles */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Reporte de Productividad por Técnico
            </h2>
            <p className="text-gray-600">
              Análisis detallado del rendimiento y eficiencia de técnicos
            </p>
          </div>
          
        </div>
      </div>

      {/* Resumen General */}
      {allTechniciansStats && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen General</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{allTechniciansStats.totalAssigned || 0}</div>
              <div className="text-sm text-gray-600">Total Asignados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{allTechniciansStats.completed || 0}</div>
              <div className="text-sm text-gray-600">Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{allTechniciansStats.inProgress || 0}</div>
              <div className="text-sm text-gray-600">En Proceso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{allTechniciansStats.overdue || 0}</div>
              <div className="text-sm text-gray-600">Vencidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{allTechniciansStats.pending || 0}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{allTechniciansStats.efficiency}%</div>
              <div className="text-sm text-gray-600">Eficiencia Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">-</div>
              <div className="text-sm text-gray-600">Tiempo Promedio</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Performers */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrophyIcon className="h-5 w-5 text-yellow-500" />
          Top 5 Técnicos del Período
        </h3>
        <div className="space-y-3">
          {productivityStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay datos de técnicos disponibles</p>
              <p className="text-sm">Verifica que haya técnicos con mantenimientos asignados</p>
            </div>
          ) : (
            getTopPerformers().map((stats, index) => {
              const trend = getEfficiencyTrend(stats.efficiency);
              const TrendIcon = trend.icon;
              
              return (
                <div key={stats.technicianId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{stats.technicianName}</div>
                      <div className="text-sm text-gray-500">
                        {stats.completed} de {stats.totalAssigned} completados
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{stats.efficiency}%</div>
                      <div className={`text-sm flex items-center gap-1 ${trend.color}`}>
                        <TrendIcon className="h-4 w-4" />
                        {trend.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Gráficas Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de Barras - Productividad */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Productividad por Técnico</h3>
          <div className="h-80">
            <Bar data={getBarChartData()} options={chartOptions} />
          </div>
        </div>

        {/* Gráfica de Eficiencia */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Eficiencia por Técnico</h3>
          <div className="h-80">
            <Bar data={getEfficiencyChartData()} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  display: true,
                  text: 'Eficiencia (%)',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                },
              },
            }} />
          </div>
        </div>
      </div>

      {/* Análisis Individual de Técnicos */}
      {productivityStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis Individual</h3>
          
          {/* Selector de Técnico */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Técnico:
            </label>
            <select
              value={selectedTechnician?.technicianId || ''}
              onChange={(e) => {
                const technicianId = parseInt(e.target.value);
                const technician = productivityStats.find(t => t.technicianId === technicianId);
                setSelectedTechnician(technician || null);
              }}
              className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione un técnico...</option>
              {productivityStats.map((technician) => (
                <option key={technician.technicianId} value={technician.technicianId}>
                  {technician.technicianName}
                </option>
              ))}
            </select>
          </div>

          {selectedTechnician ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estadísticas Detalladas */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">
                  Estadísticas de {selectedTechnician.technicianName}
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Completados</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {selectedTechnician.completed || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">En Proceso</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {selectedTechnician.inProgress || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-gray-700">Vencidos</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {selectedTechnician.overdue || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Eficiencia</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {selectedTechnician.efficiency || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Total Asignados</span>
                    </div>
                    <span className="text-lg font-bold text-gray-600">{selectedTechnician.totalAssigned || 0}</span>
                  </div>
                </div>
              </div>

              {/* Gráfica de Distribución */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Distribución de Tareas</h4>
                <div className="h-64">
                  <Doughnut 
                    data={getDoughnutChartData(selectedTechnician)} 
                    options={doughnutOptions} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Selecciona un técnico para ver su análisis detallado</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
