import { useState } from 'react';
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
  const [periodo, setPeriodo] = useState('ultimo_mes');

  return (
    <div className="space-y-4 md:space-y-6">
      <AnimatedContainer>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Reportes y Estadísticas</h1>
      </AnimatedContainer>

      {/* Filtros de período */}
      <AnimatedContainer delay={0.1}>
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-wrap gap-4">
          <select 
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-4 py-2 text-sm md:text-base border rounded-lg flex-grow md:flex-grow-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ultimo_mes">Último Mes</option>
            <option value="ultimos_3_meses">Últimos 3 Meses</option>
            <option value="ultimos_6_meses">Últimos 6 Meses</option>
            <option value="ultimo_año">Último Año</option>
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
                data={{
                  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                  datasets: [{
                    label: 'Mantenimientos',
                    data: [12, 19, 15, 17, 22, 25],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
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
                data={{
                  labels: ['Operativo', 'En Mantenimiento', 'Fuera de Servicio'],
                  datasets: [{
                    data: [75, 15, 10],
                    backgroundColor: [
                      'rgba(34, 197, 94, 0.8)',
                      'rgba(234, 179, 8, 0.8)',
                      'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                      'rgb(34, 197, 94)',
                      'rgb(234, 179, 8)',
                      'rgb(239, 68, 68)'
                    ],
                    borderWidth: 1
                  }]
                }}
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
                data={{
                  labels: ['Preventivo', 'Correctivo', 'Emergencia'],
                  datasets: [{
                    data: [45, 23, 7],
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(147, 51, 234, 0.8)',
                      'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                      'rgb(59, 130, 246)',
                      'rgb(147, 51, 234)',
                      'rgb(239, 68, 68)'
                    ],
                    borderWidth: 1
                  }]
                }}
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
                data={{
                  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                  datasets: [{
                    label: 'Horas',
                    data: [2.5, 2.8, 2.3, 2.7, 2.4, 2.6],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                  }]
                }}
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
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">Preventivo</td>
                  <td className="py-3 px-4 text-sm">45</td>
                  <td className="py-3 px-4 text-sm">2.5 horas</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">Correctivo</td>
                  <td className="py-3 px-4 text-sm">23</td>
                  <td className="py-3 px-4 text-sm">4 horas</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">Emergencia</td>
                  <td className="py-3 px-4 text-sm">7</td>
                  <td className="py-3 px-4 text-sm">1.5 horas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedContainer>
    </div>
  );
}
