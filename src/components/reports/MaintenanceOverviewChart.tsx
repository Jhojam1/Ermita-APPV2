import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import AnimatedContainer from '../ui/AnimatedContainer';

interface MaintenanceOverviewData {
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  total: number;
}

interface MaintenanceOverviewChartProps {
  data: MaintenanceOverviewData;
  chartRef: React.RefObject<any>;
}

const MaintenanceOverviewChart: React.FC<MaintenanceOverviewChartProps> = ({ data, chartRef }) => {
  // Mapeo de etiquetas en inglés a español
  const labelMap: { [key: string]: string } = {
    'scheduled': 'Programados',
    'inProgress': 'En Progreso',
    'completed': 'Completados',
    'cancelled': 'Cancelados',
    'total': 'Total'
  };

  // Colores específicos para cada estado
  const colorMap: { [key: string]: { bg: string, border: string } } = {
    'scheduled': { bg: 'rgba(54, 162, 235, 0.8)', border: 'rgb(54, 162, 235)' },   // Azul
    'inProgress': { bg: 'rgba(255, 206, 86, 0.8)', border: 'rgb(255, 206, 86)' },  // Amarillo
    'completed': { bg: 'rgba(75, 192, 192, 0.8)', border: 'rgb(75, 192, 192)' },   // Verde
    'cancelled': { bg: 'rgba(255, 99, 132, 0.8)', border: 'rgb(255, 99, 132)' },   // Rojo
    'total': { bg: 'rgba(153, 102, 255, 0.8)', border: 'rgb(153, 102, 255)' }      // Morado
  };

  // Preparar datos para el gráfico (excluir el campo 'total')
  const chartableData: { [key: string]: number } = {};
  Object.entries(data).forEach(([key, value]) => {
    // Incluir todos los estados excepto 'total' con valores mayores a 0
    if (key !== 'total' && value > 0) {
      chartableData[key] = value;
    }
  });

  // Preparar etiquetas en español
  const labels = Object.keys(chartableData).map(key => labelMap[key] || key);
  
  // Preparar colores
  const backgroundColors = Object.keys(chartableData).map(key => colorMap[key]?.bg || 'rgba(200, 200, 200, 0.8)');
  const borderColors = Object.keys(chartableData).map(key => colorMap[key]?.border || 'rgb(200, 200, 200)');

  // Preparar datos para el gráfico
  const chartData = {
    labels: labels,
    datasets: [{
      data: Object.values(chartableData),
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 1
    }]
  };

  // Verificar si hay datos para mostrar
  const hasData = Object.keys(chartableData).length > 0 && Object.values(chartableData).some(value => value > 0);

  // Calcular el total para los porcentajes (pero no mostrarlo)
  const totalMantenimientos = Object.values(chartableData).reduce((sum, value) => sum + value, 0);

  // Obtener el total directamente de los datos
  const totalValue = data.total || Object.values(chartableData).reduce((sum, value) => sum + value, 0);

  return (
    <AnimatedContainer delay={0.2}>
      <div className="bg-white p-6 rounded-xl shadow-lg" ref={chartRef}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Visión General de Mantenimientos</h3>
          {hasData && (
            <div className="text-sm font-medium text-gray-700">
              Total: {totalValue}
            </div>
          )}
        </div>
        
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
                      font: { size: 12 },
                      generateLabels: (chart) => {
                        const datasets = chart.data.datasets;
                        return chart.data.labels?.map((label, i) => {
                          const meta = chart.getDatasetMeta(0);
                          const style = meta.controller.getStyle(i, false);
                          const value = datasets[0].data[i] as number;
                          const percentage = totalMantenimientos > 0 ? Math.round((value / totalMantenimientos) * 100) : 0;
                          
                          return {
                            text: `${label}: ${value} (${percentage}%)`,
                            fillStyle: style.backgroundColor,
                            strokeStyle: style.borderColor,
                            lineWidth: style.borderWidth,
                            hidden: false,
                            index: i
                          };
                        }) || [];
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      title: function(context) {
                        return context[0].label || '';
                      },
                      label: function(context) {
                        const value = context.raw || 0;
                        const percentage = totalMantenimientos > 0 ? Math.round((value as number / totalMantenimientos) * 100) : 0;
                        return [
                          `Cantidad: ${value}`,
                          `Porcentaje: ${percentage}%`
                        ];
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No hay datos de visión general para mostrar
            </div>
          )}
        </div>
        

      </div>
    </AnimatedContainer>
  );
};

export default MaintenanceOverviewChart;
