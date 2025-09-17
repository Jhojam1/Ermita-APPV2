import React from 'react';
import { Bar } from 'react-chartjs-2';
import AnimatedContainer from '../ui/AnimatedContainer';

interface TechnicianReportData {
  technicianId: string | null;
  technicianName: string;
  total: number;
}

interface TechnicianChartProps {
  data: TechnicianReportData[];
  chartRef: React.RefObject<any>;
  delay?: number;
}

const TechnicianChart: React.FC<TechnicianChartProps> = ({ data, chartRef, delay = 0.4 }) => {
  // Verificar si hay datos para mostrar
  const hasData = data.length > 0 && data.some(tech => tech.total > 0);
  
  // Preparar datos para el gráfico de técnicos
  const chartData = {
    labels: hasData 
      ? data.map(tech => tech.technicianName)
      : [],
    datasets: [{
      label: 'Mantenimientos',
      data: hasData ? data.map(tech => tech.total) : [],
      backgroundColor: [
        'rgba(59, 130, 246, 1)'
      ],
      borderWidth: 1,
      borderRadius: 8,
      barThickness: hasData ? 40 : 0,
      maxBarThickness: hasData ? 50 : 0
    }]
  };

  // Opciones del gráfico de técnicos
  const chartOptions = {
    indexAxis: 'x' as const,
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: hasData ? 1000 : 0
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: hasData,
        callbacks: {
          label: function(context: any) {
            return `Mantenimientos: ${context.raw}`;
          }
        }
      },
      datalabels: {
        display: hasData,
        color: '#000',
        anchor: 'end',
        align: 'top',
        formatter: function(value: any) {
          return value;
        }
      },
      // Mostrar mensaje cuando no hay datos
      beforeDraw: (chart: any) => {
        if (!hasData) {
          const ctx = chart.ctx;
          const width = chart.width;
          const height = chart.height;
          
          chart.clear();
          
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '16px Arial';
          ctx.fillStyle = '#666';
          ctx.fillText('No hay datos disponibles', width / 2, height / 2);
          ctx.restore();
        }
      }
    },
    scales: {
      x: {
        display: hasData,
        title: {
          display: hasData,
          text: 'Técnicos',
          font: {
            weight: 'bold' as const
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        display: hasData,
        title: {
          display: hasData,
          text: 'Cantidad de Mantenimientos',
          font: {
            weight: 'bold' as const
          }
        },
        beginAtZero: true,
        ticks: {
          stepSize: 5
        }
      }
    }
  };

  return (
    <AnimatedContainer delay={delay}>
      <div className="bg-white p-6 rounded-xl shadow-lg" ref={chartRef}>
        <h3 className="text-lg font-semibold mb-4">Mantenimientos por Técnico</h3>
        <div className="h-72">
          <Bar 
            data={chartData}
            options={chartOptions}
          />
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default TechnicianChart;
