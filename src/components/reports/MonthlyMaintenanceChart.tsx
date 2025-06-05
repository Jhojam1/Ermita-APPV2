import React from 'react';
import { Bar } from 'react-chartjs-2';
import AnimatedContainer from '../ui/AnimatedContainer';

interface MonthlyReportData {
  month: string;
  total: number;
  corrective: number;
  preventive: number;
}

interface MonthlyMaintenanceChartProps {
  data: MonthlyReportData[];
  chartRef: React.RefObject<any>;
  delay?: number;
}

const MonthlyMaintenanceChart: React.FC<MonthlyMaintenanceChartProps> = ({ data, chartRef, delay = 0.1 }) => {
  // Preparar datos para el gráfico
  const chartData = {
    labels: data.map(stat => {
      // Si el mes viene en formato YYYY-MM, lo convertimos a nombre de mes
      if (stat.month.includes('-')) {
        const [year, month] = stat.month.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long'
        });
      }
      return stat.month;
    }),
    datasets: [
      {
        label: 'Preventivo',
        data: data.map(stat => stat.preventive || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Correctivo',
        data: data.map(stat => stat.corrective || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      }
    ]
  };

  // Verificar si hay datos para mostrar
  const hasData = data.length > 0;

  return (
    <AnimatedContainer delay={delay}>
      <div className="bg-white p-6 rounded-xl shadow-lg" ref={chartRef}>
        <h3 className="text-lg font-semibold mb-4">Mantenimientos por Mes</h3>
        <div className="h-72">
          {hasData ? (
            <Bar 
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
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
                      text: 'Cantidad'
                    },
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No hay datos de mantenimientos para mostrar
            </div>
          )}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default MonthlyMaintenanceChart;
