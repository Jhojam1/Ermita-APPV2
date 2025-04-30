import { useState, useEffect } from 'react';
import AnimatedContainer from "../components/ui/AnimatedContainer";
import { 
  ComputerDesktopIcon, 
  WrenchScrewdriverIcon, 
  CalendarIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Datos de ejemplo para los gráficos por período
const data = {
  semana: {
    tendencias: [
      { name: 'Lun', mantenimientos: 5, equipos: 118 },
      { name: 'Mar', mantenimientos: 7, equipos: 119 },
      { name: 'Mie', mantenimientos: 4, equipos: 119 },
      { name: 'Jue', mantenimientos: 6, equipos: 120 },
      { name: 'Vie', mantenimientos: 3, equipos: 120 },
    ],
    stats: {
      totalEquipos: 120,
      mantenimientosPendientes: 8,
      mantenimientosRealizados: 25,
      equiposEnMantenimiento: 3
    }
  },
  mes: {
    tendencias: [
      { name: 'Sem 1', mantenimientos: 20, equipos: 110 },
      { name: 'Sem 2', mantenimientos: 15, equipos: 112 },
      { name: 'Sem 3', mantenimientos: 25, equipos: 115 },
      { name: 'Sem 4', mantenimientos: 22, equipos: 120 },
    ],
    stats: {
      totalEquipos: 120,
      mantenimientosPendientes: 12,
      mantenimientosRealizados: 82,
      equiposEnMantenimiento: 5
    }
  },
  año: {
    tendencias: [
      { name: 'Ene', mantenimientos: 75, equipos: 100 },
      { name: 'Feb', mantenimientos: 68, equipos: 105 },
      { name: 'Mar', mantenimientos: 90, equipos: 110 },
      { name: 'Abr', mantenimientos: 82, equipos: 120 },
    ],
    stats: {
      totalEquipos: 120,
      mantenimientosPendientes: 15,
      mantenimientosRealizados: 315,
      equiposEnMantenimiento: 8
    }
  }
};

const estadoEquipos = [
  { name: 'Operativos', value: 85 },
  { name: 'En Mantenimiento', value: 3 },
  { name: 'Fuera de Servicio', value: 12 },
];

const tiposMantenimiento = [
  { name: 'Preventivo', cantidad: 15 },
  { name: 'Correctivo', cantidad: 8 },
  { name: 'Predictivo', cantidad: 2 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Home = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [currentData, setCurrentData] = useState(data.mes);
  const [showFilters, setShowFilters] = useState(false);

  // Actualizar datos cuando cambie el período
  useEffect(() => {
    setCurrentData(data[selectedPeriod as keyof typeof data]);
  }, [selectedPeriod]);

  const periodLabels: Record<string, string> = {
    semana: 'Esta Semana',
    mes: 'Este Mes',
    año: 'Este Año'
  };

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <AnimatedContainer>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Panel de Control
              </h1>
              <p className="text-gray-500 mt-1">Resumen de {periodLabels[selectedPeriod].toLowerCase()}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <AdjustmentsHorizontalIcon className="w-5 h-5" />
                  <span className="font-medium">{periodLabels[selectedPeriod]}</span>
                </button>
                
                {/* Menú desplegable de filtros */}
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <button
                      onClick={() => {
                        setSelectedPeriod('semana');
                        setShowFilters(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        selectedPeriod === 'semana' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                      }`}
                    >
                      Esta Semana
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPeriod('mes');
                        setShowFilters(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        selectedPeriod === 'mes' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                      }`}
                    >
                      Este Mes
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPeriod('año');
                        setShowFilters(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        selectedPeriod === 'año' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                      }`}
                    >
                      Este Año
                    </button>
                  </div>
                )}
              </div>
              
              {/* Indicadores de rendimiento */}
              <div className="hidden lg:flex items-center space-x-3">
                <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg font-medium flex items-center text-sm">
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1.5" />
                  +12% equipos
                </span>
                <span className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg font-medium flex items-center text-sm">
                  <ArrowTrendingDownIcon className="w-4 h-4 mr-1.5" />
                  -3% pendientes
                </span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedContainer>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Estadísticas principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AnimatedContainer delay={0.1}>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-100 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="bg-blue-50 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <ComputerDesktopIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-green-500 flex items-center">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    +5% vs anterior
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mt-4">Total Equipos</h3>
                <div className="flex items-baseline mt-2">
                  <p className="text-3xl font-bold text-gray-900">{currentData.stats.totalEquipos}</p>
                  <span className="ml-2 text-sm text-gray-500">unidades</span>
                </div>
              </div>
            </AnimatedContainer>

            <AnimatedContainer delay={0.2}>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-amber-100 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="bg-amber-50 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <WrenchScrewdriverIcon className="w-6 h-6 text-amber-500" />
                  </div>
                  <span className="text-sm font-medium text-amber-500 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {Math.round(currentData.stats.mantenimientosPendientes * 0.4)} urgentes
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mt-4">Mantenimientos Pendientes</h3>
                <div className="flex items-baseline mt-2">
                  <p className="text-3xl font-bold text-gray-900">{currentData.stats.mantenimientosPendientes}</p>
                  <span className="ml-2 text-sm text-gray-500">pendientes</span>
                </div>
              </div>
            </AnimatedContainer>
          </div>

          {/* Gráfico de tendencias */}
          <AnimatedContainer delay={0.3}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Tendencias</h2>
                  <p className="text-sm text-gray-500">Mantenimientos y equipos por {selectedPeriod === 'semana' ? 'día' : selectedPeriod === 'mes' ? 'semana' : 'mes'}</p>
                </div>
                <button className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors flex items-center">
                  Ver detalles
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentData.tendencias}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mantenimientos"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                      strokeWidth={2}
                      name="Mantenimientos"
                    />
                    <Area
                      type="monotone"
                      dataKey="equipos"
                      stroke="#0284c7"
                      fill="#bae6fd"
                      strokeWidth={2}
                      name="Equipos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </AnimatedContainer>

          {/* Gráfico de tipos de mantenimiento */}
          <AnimatedContainer delay={0.4}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Tipos de Mantenimiento</h2>
                  <p className="text-sm text-gray-500">Distribución por categoría</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Total: {currentData.stats.mantenimientosRealizados}</span>
                </div>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tiposMantenimiento}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                      }}
                    />
                    <Bar 
                      dataKey="cantidad" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </AnimatedContainer>
        </div>

        {/* Columna derecha - Estado y actividad */}
        <div className="space-y-6">
          {/* Estado de equipos */}
          <AnimatedContainer delay={0.5}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Estado de Equipos</h2>
                  <p className="text-sm text-gray-500">Distribución actual</p>
                </div>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estadoEquipos}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {estadoEquipos.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => (
                        <span className="text-sm text-gray-600">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </AnimatedContainer>

          {/* Actividad Reciente */}
          <AnimatedContainer delay={0.6}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Actividad Reciente</h2>
                  <p className="text-sm text-gray-500">Últimas actualizaciones</p>
                </div>
                <button className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors flex items-center">
                  Ver todo
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  {
                    title: 'Mantenimiento Preventivo',
                    equipment: 'Computador HP EliteDesk 800 G6',
                    time: '2 horas atrás',
                    status: 'completed'
                  },
                  {
                    title: 'Actualización de Software',
                    equipment: 'Servidor Dell PowerEdge R740',
                    time: '5 horas atrás',
                    status: 'in-progress'
                  },
                  {
                    title: 'Reparación de Hardware',
                    equipment: 'Impresora Epson L3150',
                    time: '1 día atrás',
                    status: 'completed'
                  }
                ].map((item, index) => (
                  <AnimatedContainer key={index} delay={0.6 + ((index + 1) * 0.1)}>
                    <div className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'completed' ? 'bg-green-400' : 'bg-amber-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.title}</h3>
                        <p className="text-sm text-gray-500 truncate">{item.equipment}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
                    </div>
                  </AnimatedContainer>
                ))}
              </div>
            </div>
          </AnimatedContainer>
        </div>
      </div>
    </div>
  );
};

export default Home;
