import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import AnimatedContainer from '../ui/AnimatedContainer';

interface MaintenanceTypeChartProps {
  preventive: number;
  corrective: number;
  chartRef: React.RefObject<any>;
  delay?: number;
}

const MaintenanceTypeChart: React.FC<MaintenanceTypeChartProps> = ({ 
  preventive, 
  corrective, 
  chartRef, 
  delay = 0.2 
}) => {
  // Datos para el gráfico de tipos de mantenimiento
  const chartData = {
    labels: ['Preventivo', 'Correctivo'],
    datasets: [{
      data: [preventive || 0, corrective || 0],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 1
    }]
  };

  // Verificar si hay datos para mostrar
  const hasData = (preventive || 0) + (corrective || 0) > 0;

  return (
    <AnimatedContainer delay={delay}>
      <div className="bg-white p-6 rounded-xl shadow-lg" ref={chartRef}>
        <h3 className="text-lg font-semibold mb-4">Tipos de Mantenimiento</h3>
        <div className="h-72 flex items-center justify-center">
          {hasData ? (
            <Doughnut 
              data={chartData}
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
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value as number / total) * 100) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                      }
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

export default MaintenanceTypeChart;
