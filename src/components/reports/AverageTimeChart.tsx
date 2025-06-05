import React from 'react';
import { Line } from 'react-chartjs-2';
import AnimatedContainer from '../ui/AnimatedContainer';

interface MonthlyReportData {
  month: string;
  total: number;
  corrective: number;
  preventive: number;
}

interface AverageTimeChartProps {
  data: MonthlyReportData[];
  averagePreventiveTime: number;
  averageCorrectiveTime: number;
  chartRef: React.RefObject<any>;
  delay?: number;
}

const AverageTimeChart: React.FC<AverageTimeChartProps> = ({ 
  data, 
  averagePreventiveTime, 
  averageCorrectiveTime, 
  chartRef, 
  delay = 0.3 
}) => {
  // Datos para el tiempo promedio
  const chartData = {
    labels: data.map(stat => {
      // Si el mes viene en formato YYYY-MM, lo convertimos a nombre de mes abreviado
      if (stat.month.includes('-')) {
        const [year, month] = stat.month.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', {
          month: 'short'
        });
      }
      return stat.month;
    }),
    datasets: [
      {
        label: 'Tiempo Promedio (horas)',
        data: data.map(stat => {
          const total = (stat.preventive || 0) + (stat.corrective || 0);
          if (total === 0) return 0;
          const avgPreventive = ((stat.preventive || 0) / total) * (averagePreventiveTime || 0);
          const avgCorrective = ((stat.corrective || 0) / total) * (averageCorrectiveTime || 0);
          return parseFloat((avgPreventive + avgCorrective).toFixed(2));
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Verificar si hay datos para mostrar
  const hasData = data.length > 0;

  return (
    <AnimatedContainer delay={delay}>
      <div className="bg-white p-6 rounded-xl shadow-lg" ref={chartRef}>
        <h3 className="text-lg font-semibold mb-4">Tiempo Promedio de Reparación</h3>
        <div className="h-72">
          {hasData ? (
            <Line 
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Horas'
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
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No hay datos de tiempos promedio para mostrar
            </div>
          )}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default AverageTimeChart;
