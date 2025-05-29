"use client";

import { useState, useMemo } from 'react';
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
  Filler,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Datos completos simulados
const fullData = {
  genero: {
    M: {
      count: 67,
      grupoEtario: {
        '0-45 años': 50,
        'En Proceso': 10,
        '40-60 años': 7,
        '0-4 años': 0,
        '10-14 años': 0
      },
      empresas: [
        { name: 'SALUD TOTAL EPSS S.A.', value: 30, color: '#059669' },
        { name: 'SALUD TOTAL EPS-S S.A.', value: 15, color: '#0d9488' },
        { name: 'METROPOLITANA', value: 10, color: '#0891b2' },
        { name: 'EPS SURA', value: 7, color: '#fbbf24' },
        { name: 'URGENCIAS', value: 5, color: '#f97316' }
      ],
      medicos: {
        'MONTEALEGRE CARDENAS FLOR': 10,
        'GARCIA LOPEZ CARLOS': 8,
        'RODRIGUEZ MARTINEZ MARIA': 7,
        'SANCHEZ RAMIREZ JOSE': 6,
        'TORRES SILVA LAURA': 5,
        'RAMIREZ ANGELO DANIEL': 4,
        'EDUARDO GOMEZ GONZALEZ': 3,
        'GARCIA LOPEZ PATRICIA YONE': 2,
        'VERONA AHUMADA LUIS': 2,
        'MARIA DE LOS ANGELES PRADO ARREOLA': 2,
        'MARIA ELENA LEON RIVERA ARELLANO': 1,
        'ESTEBAN JOHANA SUAREZ SERRATA': 1
      },
      oportunidades: {
        'PRIORIDAD I': [30, 20, 15],
        'PRIORIDAD II': [25, 30, 20],
        'PRIORIDAD III': [20, 35, 30],
        'PRIORIDAD IV': [15, 25, 35],
        'PRIORIDAD V': [30, 15, 25]
      }
    },
    F: {
      count: 176,
      grupoEtario: {
        '0-45 años': 123,
        'En Proceso': 37,
        '40-60 años': 16,
        '0-4 años': 0,
        '10-14 años': 0
      },
      empresas: [
        { name: 'SALUD TOTAL EPSS S.A.', value: 43, color: '#059669' },
        { name: 'SALUD TOTAL EPS-S S.A.', value: 16, color: '#0d9488' },
        { name: 'METROPOLITANA', value: 15, color: '#0891b2' },
        { name: 'EPS SURA', value: 8, color: '#fbbf24' },
        { name: 'URGENCIAS', value: 20, color: '#f97316' }
      ],
      medicos: {
        'MONTEALEGRE CARDENAS FLOR': 15,
        'GARCIA LOPEZ CARLOS': 10,
        'RODRIGUEZ MARTINEZ MARIA': 8,
        'SANCHEZ RAMIREZ JOSE': 6,
        'TORRES SILVA LAURA': 5,
        'RAMIREZ ANGELO DANIEL': 5,
        'EDUARDO GOMEZ GONZALEZ': 5,
        'GARCIA LOPEZ PATRICIA YONE': 5,
        'VERONA AHUMADA LUIS': 4,
        'MARIA DE LOS ANGELES PRADO ARREOLA': 3,
        'MARIA ELENA LEON RIVERA ARELLANO': 3,
        'ESTEBAN JOHANA SUAREZ SERRATA': 2
      },
      oportunidades: {
        'PRIORIDAD I': [45, 30, 20],
        'PRIORIDAD II': [35, 40, 30],
        'PRIORIDAD III': [30, 50, 40],
        'PRIORIDAD IV': [25, 35, 45],
        'PRIORIDAD V': [40, 25, 35]
      }
    }
  }
};

export default function ReportesHosvital() {
  const [selectedReport, setSelectedReport] = useState('oportunidad-triage');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('Febrero');
  const [selectedFilters, setSelectedFilters] = useState({
    genero: null,
    grupoEtario: null,
    empresa: null,
    medico: null,
    prioridad: null
  });
  
  // Lista de reportes disponibles
  const availableReports = [
    { id: 'oportunidad-triage', name: 'Oportunidad Triage' },
    { id: 'ocupacion-camas', name: 'Ocupación de Camas' },
    { id: 'giro-cama', name: 'Giro Cama' },
    { id: 'estancia-promedio', name: 'Estancia Promedio' },
    { id: 'reingresos', name: 'Reingresos' },
  ];

  // Manejadores de eventos para los filtros
  const handleGeneroClick = (elements) => {
    if (elements.length > 0) {
      const genero = ['F', 'M'][elements[0].index];
      setSelectedFilters(prev => ({
        ...prev,
        genero: prev.genero === genero ? null : genero
      }));
    }
  };

  const handleGrupoEtarioClick = (elements) => {
    if (elements.length > 0) {
      const grupoEtario = chartData.grupoEtarioData.labels[elements[0].index];
      setSelectedFilters(prev => ({
        ...prev,
        grupoEtario: prev.grupoEtario === grupoEtario ? null : grupoEtario
      }));
    }
  };

  const handleEmpresaClick = (empresa) => {
    setSelectedFilters(prev => ({
      ...prev,
      empresa: prev.empresa === empresa.name ? null : empresa.name
    }));
  };

  const handleMedicoClick = (elements) => {
    if (elements.length > 0) {
      const medico = chartData.medicosData.labels[elements[0].index];
      setSelectedFilters(prev => ({
        ...prev,
        medico: prev.medico === medico ? null : medico
      }));
    }
  };

  // Función para filtrar datos basados en las selecciones
  const filteredData = useMemo(() => {
    let result = { 
      genero: {}, 
      empresas: new Map(), 
      medicos: new Map(),
      totalAdmisiones: 0,
      totalContratos: 0,
      totalMedicos: 0
    };

    // Filtrar los datos según los filtros activos
    Object.entries(fullData.genero).forEach(([genero, genData]) => {
      let includeData = true;

      // Aplicar filtro de género
      if (selectedFilters.genero && selectedFilters.genero !== genero) {
        includeData = false;
      }

      // Filtrar por grupo etario
      if (includeData && selectedFilters.grupoEtario && genData.grupoEtario) {
        if (genData.grupoEtario[selectedFilters.grupoEtario] === 0) {
          includeData = false;
        }
      }

      // Filtrar por empresa
      if (includeData && selectedFilters.empresa && genData.empresas) {
        if (!genData.empresas.some(e => e.name === selectedFilters.empresa)) {
          includeData = false;
        }
      }

      // Filtrar por médico
      if (includeData && selectedFilters.medico && genData.medicos) {
        if (!genData.medicos[selectedFilters.medico]) {
          includeData = false;
        }
      }

      // Procesar los datos si pasa todos los filtros
      if (includeData) {
        result.genero[genero] = genData;
        result.totalAdmisiones += genData.count || 0;

        // Procesar empresas
        if (genData.empresas) {
          genData.empresas.forEach(empresa => {
            if (!selectedFilters.empresa || selectedFilters.empresa === empresa.name) {
              const currentValue = result.empresas.get(empresa.name) || 0;
              result.empresas.set(empresa.name, currentValue + empresa.value);
              result.totalContratos += empresa.value;
            }
          });
        }

        // Procesar médicos
        if (genData.medicos) {
          Object.entries(genData.medicos).forEach(([medico, count]) => {
            if (!selectedFilters.medico || selectedFilters.medico === medico) {
              const currentCount = result.medicos.get(medico) || 0;
              result.medicos.set(medico, currentCount + count);
              result.totalMedicos += count;
            }
          });
        }
      }
    });

    // Verificar totales finales
    console.log('Totales finales:', {
      admisiones: result.totalAdmisiones,
      contratos: result.totalContratos,
      medicos: result.totalMedicos,
      filtros: selectedFilters
    });

    return result;
  }, [selectedFilters]);

  // Preparar datos para los gráficos basados en los filtros
  const chartData = useMemo(() => {
    // Datos para el gráfico de género
    const generoData = {
      labels: ['F', 'M'],
      datasets: [{
        data: [
          filteredData.genero.F?.count || 0,
          filteredData.genero.M?.count || 0
        ],
        backgroundColor: ['#4ade80', '#60a5fa'],
        borderWidth: 0,
      }],
    };

    // Datos para el gráfico de grupo etario
    const grupoEtarioLabels = ['0-45 años', 'En Proceso', '40-60 años', '0-4 años', '10-14 años'];
    const grupoEtarioData = {
      labels: grupoEtarioLabels,
      datasets: [{
        data: grupoEtarioLabels.map(label => {
          let total = 0;
          Object.values(filteredData.genero).forEach(genData => {
            if (genData?.grupoEtario) {
              total += genData.grupoEtario[label] || 0;
            }
          });
          return total;
        }),
        backgroundColor: '#f97316',
        borderWidth: 0,
      }],
    };

    // Datos para el gráfico de oportunidades
    const oportunidadesLabels = ['PRIORIDAD I', 'PRIORIDAD II', 'PRIORIDAD III', 'PRIORIDAD IV', 'PRIORIDAD V'];
    const oportunidadesData = {
      labels: oportunidadesLabels,
      datasets: [
        {
          label: 'Oportunidad Admisión hasta consulta',
          data: oportunidadesLabels.map(label => {
            let sum = 0;
            let count = 0;
            Object.values(filteredData.genero).forEach(genData => {
              if (genData?.oportunidades?.[label]) {
                sum += genData.oportunidades[label][0];
                count++;
              }
            });
            return count > 0 ? sum / count : 0;
          }),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Oportunidad Triage hasta consulta',
          data: oportunidadesLabels.map(label => {
            let sum = 0;
            let count = 0;
            Object.values(filteredData.genero).forEach(genData => {
              if (genData?.oportunidades?.[label]) {
                sum += genData.oportunidades[label][1];
                count++;
              }
            });
            return count > 0 ? sum / count : 0;
          }),
          borderColor: '#eab308',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Oportunidad Admisión hasta Triage',
          data: oportunidadesLabels.map(label => {
            let sum = 0;
            let count = 0;
            Object.values(filteredData.genero).forEach(genData => {
              if (genData?.oportunidades?.[label]) {
                sum += genData.oportunidades[label][2];
                count++;
              }
            });
            return count > 0 ? sum / count : 0;
          }),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };

    // Preparar datos de empresas
    const empresasData = Array.from(filteredData.empresas.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: '#3b82f6'
      }))
      .sort((a, b) => b.value - a.value);

    // Preparar datos de médicos
    const medicosLabels = [
      'MONTEALEGRE CARDENAS FLOR',
      'GARCIA LOPEZ CARLOS',
      'RODRIGUEZ MARTINEZ MARIA',
      'SANCHEZ RAMIREZ JOSE',
      'TORRES SILVA LAURA',
      'RAMIREZ ANGELO DANIEL',
      'EDUARDO GOMEZ GONZALEZ',
      'GARCIA LOPEZ PATRICIA YONE',
      'VERONA AHUMADA LUIS',
      'MARIA DE LOS ANGELES PRADO ARREOLA',
      'MARIA ELENA LEON RIVERA ARELLANO',
      'ESTEBAN JOHANA SUAREZ SERRATA'
    ];

    const medicosData = {
      labels: medicosLabels,
      datasets: [{
        data: medicosLabels.map(medico => filteredData.medicos.get(medico) || 0),
        backgroundColor: '#f97316',
        borderWidth: 0,
      }],
    };

    return {
      generoData,
      grupoEtarioData,
      oportunidadesData,
      empresasData,
      medicosData
    };
  }, [filteredData]);

  // Actualizar las estadísticas basadas en los filtros
  const stats = useMemo(() => {
    return {
      totalAdmisiones: filteredData.totalAdmisiones,
      sinPriorizar: 0,
      tiempoPromedio: 30,
      tiempoTriageConsulta: 13,
      tiempoAdmisionConsulta: 55,
    };
  }, [filteredData]);

  return (
    <div className="space-y-6 p-6">
      {/* Selector de reportes */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Seleccionar Reporte</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {availableReports.map(report => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-lg border-2 transition-all ${selectedReport === report.id 
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
            >
              <div className="text-center">
                <span className="block font-medium">{report.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Contenido condicional basado en el reporte seleccionado */}
      {selectedReport !== 'oportunidad-triage' ? (
        <div className="text-center py-12 bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Reporte de {availableReports.find(r => r.id === selectedReport)?.name}</h1>
          <p className="text-gray-500">Este reporte está en desarrollo y estará disponible próximamente.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Oportunidad Triage por Género, Prioridad, Grupo Etario y Empresa</h1>
              {Object.values(selectedFilters).some(filter => filter !== null) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(selectedFilters).map(([key, value]) => (
                    value && (
                      <span
                        key={key}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {key}: {value}
                        <button
                          type="button"
                          className="ml-2 inline-flex text-blue-400 hover:text-blue-600"
                          onClick={() => setSelectedFilters(prev => ({ ...prev, [key]: null }))}
                        >
                          ×
                        </button>
                      </span>
                    )
                  ))}
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => setSelectedFilters({
                      genero: null,
                      grupoEtario: null,
                      empresa: null,
                      medico: null,
                      prioridad: null
                    })}
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
              
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Febrero">Febrero</option>
                <option value="Enero">Enero</option>
              </select>
            </div>
          </div>
          
          {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl font-bold text-gray-900">{stats.totalAdmisiones}</div>
                <p className="mt-1 text-sm text-gray-500">Total Admisiones</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl font-bold text-gray-900">{stats.sinPriorizar}</div>
                <p className="mt-1 text-sm text-gray-500">Sin Priorizar</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl font-bold text-gray-900">{stats.tiempoPromedio}</div>
                <p className="mt-1 text-sm text-gray-500">Minutos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl font-bold text-gray-900">{stats.tiempoTriageConsulta}</div>
                <p className="mt-1 text-sm text-gray-500">Minutos Triage - Consulta</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl font-bold text-gray-900">{stats.tiempoAdmisionConsulta}</div>
                <p className="mt-1 text-sm text-gray-500">Minutos Admisión - Consulta</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primera fila de gráficos */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Por Género</h3>
          <div className="h-64">
            <Pie 
              data={chartData.generoData}
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                },
                onClick: (event, elements) => {
                  handleGeneroClick(elements);
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Por Grupo Etario</h3>
          <div className="h-64">
            <Bar 
              data={chartData.grupoEtarioData}
              options={{
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                  x: {
                    beginAtZero: true
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  }
                },
                onClick: (event, elements) => {
                  handleGrupoEtarioClick(elements);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Gráfico de líneas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Oportunidades por Clasificación Triage</h3>
        <div className="h-80">
          <Line 
            data={chartData.oportunidadesData}
            options={{
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>

      {/* Gráfico de empresas y médicos */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Por Empresa</h3>
          <div className="h-96">
            <div className="grid grid-cols-1 gap-2">
              {chartData.empresasData.map((item, index) => (
                <div 
                  key={`${item.name}-${index}`}
                  className="relative h-12 cursor-pointer transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: item.color,
                    width: `${(item.value / Math.max(...chartData.empresasData.map(e => e.value))) * 100}%`
                  }}
                  onClick={() => handleEmpresaClick(item)}
                >
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white text-sm font-medium">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Por Médico Triage</h3>
          <div className="h-96">
            <Bar 
              data={chartData.medicosData}
              options={{
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                  x: {
                    beginAtZero: true
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  }
                },
                onClick: (event, elements) => {
                  handleMedicoClick(elements);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
      )}
    </div>
  );
}