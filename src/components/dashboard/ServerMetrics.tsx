import { useEffect, useState, useRef } from 'react';
import { ArrowPathIcon, ServerIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { getSystemResources, SystemResources } from '../../services/MetricsService';
import AnimatedContainer from '../ui/AnimatedContainer';
import { Chart, registerables } from 'chart.js';

// Registramos todos los componentes de Chart.js que necesitaremos
Chart.register(...registerables);

// Componente para renderizar un gráfico de gauge (medidor)
const GaugeChart: React.FC<{
  id: string;
  value: number;
  label: string;
  suffix?: string;
  maxValue?: number;
}> = ({ id, value, label, suffix = '%', maxValue = 100 }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      // Destruir el gráfico anterior si existe
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      // Crear un nuevo gráfico
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            datasets: [
              {
                data: [value, maxValue - value],
                backgroundColor: [
                  value < 60 ? '#10B981' : value < 80 ? '#FBBF24' : '#EF4444',
                  '#E5E7EB'
                ],
                borderWidth: 0,
                circumference: 180,
                rotation: 270
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: false
              }
            }
          }
        });
      }
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [value, maxValue]);
  
  return (
    <div className="mb-6">
      <div className="text-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="relative" style={{ height: '120px' }}>
        <canvas ref={chartRef} id={id}></canvas>
        <div className="absolute inset-0 flex items-center justify-center flex-col" 
             style={{ marginTop: '10px' }}>
          <span className="text-3xl font-bold">{value.toFixed(1)}{suffix}</span>
        </div>
      </div>
    </div>
  );
};

const ServerMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemResources | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      if (!loading) setRefreshing(true);
      const data = await getSystemResources();
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar métricas del servidor:', err);
      setError('No se pudieron cargar las métricas del servidor');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <AnimatedContainer>
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ServerIcon className="h-6 w-6 mr-2 text-blue-500" />
            Métricas del Servidor
          </h3>
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedContainer>
    );
  }

  if (error) {
    return (
      <AnimatedContainer>
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ServerIcon className="h-6 w-6 mr-2 text-blue-500" />
            Métricas del Servidor
          </h3>
          <div className="p-4 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => fetchMetrics()}
              className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" /> Reintentar
            </button>
          </div>
        </div>
      </AnimatedContainer>
    );
  }

  const cpuPercentage = metrics?.cpuUsage || 0;
  const memoryTotal = metrics?.totalMemory || 0;
  const memoryUsed = metrics?.usedMemory || 0;
  const memoryPercentage = memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0;
  const diskTotal = metrics?.totalDiskSpace || 0;
  const diskUsed = metrics?.usedDiskSpace || 0; 
  const diskPercentage = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0;

  return (
    <AnimatedContainer>
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <ServerIcon className="h-6 w-6 mr-2 text-blue-500" />
            Métricas del Servidor
          </h3>
          <button 
            onClick={() => fetchMetrics()} 
            className={`p-2 rounded-full hover:bg-gray-100 ${refreshing ? 'animate-spin' : ''}`}
            disabled={refreshing}
          >
            <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tiempo de actividad */}
        <div className="mb-6 p-3 bg-blue-50 rounded-md text-center">
          <div className="flex items-center justify-center mb-1">
            <CpuChipIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-semibold text-blue-800">Tiempo de actividad</span>
          </div>
          <p className="text-blue-800 font-medium">{metrics?.serverUptime || 'N/A'}</p>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CPU */}
          <div className="col-span-1">
            <GaugeChart 
              id="cpu-gauge" 
              value={cpuPercentage} 
              label="CPU" 
            />
            <div className="text-center text-xs text-gray-500">
              Utilización del procesador
            </div>
          </div>
          
          {/* Memoria */}
          <div className="col-span-1">
            <GaugeChart 
              id="memory-gauge" 
              value={memoryPercentage} 
              label="Memoria RAM" 
            />
            <div className="text-center text-xs text-gray-500">
              {memoryUsed.toFixed(0)} MB / {memoryTotal.toFixed(0)} MB
            </div>
          </div>
          
          {/* Disco */}
          <div className="col-span-1">
            <GaugeChart 
              id="disk-gauge" 
              value={diskPercentage} 
              label="Disco" 
            />
            <div className="text-center text-xs text-gray-500">
              {diskUsed.toFixed(1)} GB / {diskTotal.toFixed(1)} GB
            </div>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default ServerMetrics;
