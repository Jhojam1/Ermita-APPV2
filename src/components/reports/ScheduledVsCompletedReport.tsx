import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import AnimatedContainer from '../ui/AnimatedContainer';

interface MonthlyReportData {
  month?: string;
  yearMonth?: string;
  total?: number;
  corrective?: number;
  preventive?: number;
  scheduled?: number;
  completed?: number;
}

interface ScheduledVsCompletedReportProps {
  data: MonthlyReportData[];
  chartRef: React.RefObject<any>;
}

const ScheduledVsCompletedReport: React.FC<ScheduledVsCompletedReportProps> = ({ data, chartRef }) => {
  // Preparar datos para el gráfico
  const chartData = {
    labels: data.map(item => {
      // Verificar que item.month existe y es una cadena
      const monthValue = item.month || item.yearMonth || '';
      
      // Si el mes viene en formato YYYY-MM, lo convertimos a nombre de mes
      if (monthValue && typeof monthValue === 'string' && monthValue.includes('-')) {
        const [year, month] = monthValue.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long'
        });
      }
      return monthValue;
    }),
    datasets: [
      {
        label: 'Programados',
        data: data.map(item => item.scheduled || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'Realizados',
        data: data.map(item => item.completed || item.total || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      }
    ]
  };

  // Verificar si hay datos para mostrar
  const hasData = data.length > 0 && data.some(item => 
    (item.scheduled || 0) > 0 || 
    (item.completed || 0) > 0 || 
    (item.total || 0) > 0
  );

  return (
    <AnimatedContainer delay={0.1}>
      <div className="bg-white p-6 rounded-xl shadow-lg" ref={chartRef}>
        <h3 className="text-lg font-semibold mb-4">Mantenimientos Programados vs. Realizados</h3>
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
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value}`;
                      }
                    }
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
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Mes'
                    }
                  }
                }
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No hay datos comparativos para mostrar
            </div>
          )}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default ScheduledVsCompletedReport;
