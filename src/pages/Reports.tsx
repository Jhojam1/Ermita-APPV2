import { useState, useEffect, useRef, useCallback } from 'react';
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import reportService, { MaintenanceSummary, MonthlyReport, DashboardData, TechnicianReport } from '../services/reportService';
import inventoryService from '../services/inventoryService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

// Formatear fecha para mostrarla de manera amigable
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es });
};

export default function Reports() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    summary: [],
    monthlyStats: [],
    technicianStats: []
  });
  const [equipmentStatus, setEquipmentStatus] = useState<{active: number, inactive: number}>({
    active: 0,
    inactive: 0
  });
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Estado para el mensaje de error
  const [error, setError] = useState<string | null>(null);

  // Cargar datos para el dashboard
  const fetchData = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    setReportGenerated(false);
    setError(null); // Limpiar errores previos
    
    try {
      // Obtener los datos del dashboard para el rango de fechas
      const data = await reportService.getDashboardData({ startDate, endDate });
      
      console.log('Dashboard data received:', JSON.stringify(data, null, 2));
      setDashboardData(data);
      
      // Obtener los datos de estado de equipos
      try {
        const statusData = await inventoryService.getEquipmentStatusSummary();
        console.log('Equipment status data:', statusData);
        setEquipmentStatus(statusData);
      } catch (statusError) {
        console.error('Error al obtener el estado de los equipos:', statusError);
        // No detenemos el flujo si falla esta petición
        setEquipmentStatus({ active: 0, inactive: 0 });
      }
      
      // Marcar que el reporte ha sido generado
      setReportGenerated(true);
      return true;
    } catch (error) {
      console.error('Error al cargar los datos de reportes:', error);
      
      // Establecer mensaje de error
      setError('Ha ocurrido un error al buscar los datos. Por favor, contacte con el administrador.');
      
      // Limpiar datos en caso de error
      setDashboardData({
        summary: [],
        monthlyStats: [],
        technicianStats: []
      });
      
      setReportGenerated(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Generar reporte con las fechas seleccionadas
  const handleGenerateReport = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Por favor seleccione un rango de fechas');
      return;
    }
    
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      alert('La fecha de inicio no puede ser mayor a la fecha de fin');
      return;
    }
    
    try {
      await fetchData(fechaInicio, fechaFin);
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      alert('Error al generar el reporte. Por favor intente nuevamente.');
    }
  };
  
  // Manejar cambio de fechas
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
    const value = e.target.value;
    if (type === 'start') {
      setFechaInicio(value);
      if (value && fechaFin && new Date(value) > new Date(fechaFin)) {
        // Si la fecha de inicio es mayor que la de fin, actualizar la de fin
        setFechaFin(value);
      }
    } else {
      setFechaFin(value);
      if (fechaInicio && value && new Date(fechaInicio) > new Date(value)) {
        // Si la fecha de fin es menor que la de inicio, actualizar la de inicio
        setFechaInicio(value);
      }
    }
    
    // Si ya se había generado un reporte, lo marcamos como no generado
    if (reportGenerated) {
      setReportGenerated(false);
    }
  };
  
  // Referencias para los contenedores de gráficos
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const maintenanceChartRef = useRef<HTMLDivElement>(null);
  const equipmentChartRef = useRef<HTMLDivElement>(null);
  const maintenanceTypeChartRef = useRef<HTMLDivElement>(null);
  const avgTimeChartRef = useRef<HTMLDivElement>(null);
  const technicianChartRef = useRef<HTMLDivElement>(null); // Nueva referencia para el gráfico de técnicos



  // Efecto que se ejecuta cuando cambian las fechas
  useEffect(() => {
    // No cargar datos automáticamente, solo cuando el usuario haga clic en Generar Reporte
  }, [fechaInicio, fechaFin]);

  // Función para generar y descargar el reporte en PDF
  const generateReport = async () => {
    if (!maintenanceChartRef.current || !equipmentChartRef.current || 
        !maintenanceTypeChartRef.current || !avgTimeChartRef.current ||
        !technicianChartRef.current) {
      console.error('No se pudieron encontrar las referencias a los gráficos');
      return;
    }
    
    try {
      setGeneratingReport(true);
      
      // Configurar opciones de captura para máxima calidad
      const captureOptions = {
        scale: 3, // Una escala mayor para mejor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 0,
        windowWidth: 1600, // Más ancho para mejor calidad
        windowHeight: 900  // Más alto para mejor calidad
      };
      
      // Crear un nuevo documento PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Configurar márgenes
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      // Encabezado
      pdf.setFillColor(52, 152, 219);
      pdf.rect(0, 0, pageWidth, 20, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`INFORME DE MANTENIMIENTOS - AÑO ${selectedYear}`, pageWidth / 2, 13, { align: 'center' });
      
      // Resumen numérico de datos
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMEN DE MANTENIMIENTOS', margin, 30);
      
      // Calcular totales
      const preventiveMaintenance = dashboardData.summary.find(s => s.type === 'Preventivo')?.quantity || 0;
      const correctiveMaintenance = dashboardData.summary.find(s => s.type === 'Correctivo')?.quantity || 0;
      const totalMaintenance = preventiveMaintenance + correctiveMaintenance;
      const preventivePercentage = totalMaintenance > 0 ? Math.round((preventiveMaintenance / totalMaintenance) * 100) : 0;
      const correctivePercentage = totalMaintenance > 0 ? Math.round((correctiveMaintenance / totalMaintenance) * 100) : 0;
      
      // Crear tabla de resumen
      const summaryTable = [
        ['Tipo', 'Cantidad', '%', 'Tiempo Promedio'],
        ['Preventivo', preventiveMaintenance.toString(), `${preventivePercentage}%`, dashboardData.summary.find(s => s.type === 'Preventivo')?.averageTime || '0 horas'],
        ['Correctivo', correctiveMaintenance.toString(), `${correctivePercentage}%`, dashboardData.summary.find(s => s.type === 'Correctivo')?.averageTime || '0 horas'],
        ['TOTAL', totalMaintenance.toString(), '100%', '']
      ];
      
      // Crear tabla de resumen
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      
      const summaryTableX = margin;
      let summaryTableY = 35;
      const rowHeight = 8;
      const colWidth = contentWidth / 4;
      
      // Encabezados
      pdf.setFillColor(220, 220, 220);
      pdf.rect(summaryTableX, summaryTableY, contentWidth, rowHeight, 'F');
      
      pdf.setFont('helvetica', 'bold');
      summaryTable[0].forEach((header, i) => {
        pdf.text(header, summaryTableX + (colWidth * i) + 5, summaryTableY + 5.5);
      });
      
      // Datos
      pdf.setFont('helvetica', 'normal');
      for (let i = 1; i < summaryTable.length; i++) {
        summaryTableY += rowHeight;
        
        // Alternar color para filas
        if (i % 2 === 0) {
          pdf.setFillColor(240, 240, 240);
          pdf.rect(summaryTableX, summaryTableY, contentWidth, rowHeight, 'F');
        }
        
        // Última fila con formato especial (total)
        if (i === summaryTable.length - 1) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFillColor(200, 200, 200);
          pdf.rect(summaryTableX, summaryTableY, contentWidth, rowHeight, 'F');
        }
        
        // Texto de la fila
        summaryTable[i].forEach((cell, j) => {
          pdf.text(cell, summaryTableX + (colWidth * j) + 5, summaryTableY + 5.5);
        });
      }
      
      // Datos adicionales
      summaryTableY += rowHeight + 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`• Equipos activos: ${equipmentStatus.active}`, margin, summaryTableY + 5);
      pdf.text(`• Equipos inactivos: ${equipmentStatus.inactive}`, margin + 80, summaryTableY + 5);
      pdf.text(`• Total de equipos: ${equipmentStatus.active + equipmentStatus.inactive}`, margin + 160, summaryTableY + 5);
      
      // Título para gráficos
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GRÁFICOS DE MANTENIMIENTO', margin, summaryTableY + 15);
      
      // Ajustar posición inicial para los gráficos
      const chartsStartY = summaryTableY + 20;
      const chartHeight = 55; // Reducir altura para acomodar más gráficos
      const halfWidth = contentWidth / 2;
      
      // 1. Mantenimientos por Mes (superior izquierda)
      pdf.setFontSize(9);
      pdf.text('Mantenimientos por Mes', margin, chartsStartY);
      
      // Capturar cada gráfico en mayor calidad
      console.log('Capturando gráfico de mantenimientos por mes...');
      const maintenanceCanvas = await html2canvas(maintenanceChartRef.current, captureOptions);
      const maintenanceImgData = maintenanceCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(maintenanceImgData, 'PNG', margin, chartsStartY + 5, halfWidth, chartHeight);
      
      // 2. Estado de Equipos (superior derecha)
      pdf.text('Estado de Equipos', margin + halfWidth + 5, chartsStartY);
      
      console.log('Capturando gráfico de estado de equipos...');
      const equipmentCanvas = await html2canvas(equipmentChartRef.current, captureOptions);
      const equipmentImgData = equipmentCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(equipmentImgData, 'PNG', margin + halfWidth + 5, chartsStartY + 5, halfWidth - 10, chartHeight);
      
      // 3. Tipos de Mantenimiento (medio izquierda)
      pdf.text('Tipos de Mantenimiento', margin, chartsStartY + chartHeight + 10);
      
      console.log('Capturando gráfico de tipos de mantenimiento...');
      const typeCanvas = await html2canvas(maintenanceTypeChartRef.current, captureOptions);
      const typeImgData = typeCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(typeImgData, 'PNG', margin, chartsStartY + chartHeight + 15, halfWidth, chartHeight);
      
      // 4. Tiempo Promedio (medio derecha)
      pdf.text('Tiempo Promedio de Mantenimiento', margin + halfWidth + 5, chartsStartY + chartHeight + 10);
      
      console.log('Capturando gráfico de tiempo promedio...');
      const timeCanvas = await html2canvas(avgTimeChartRef.current, captureOptions);
      const timeImgData = timeCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(timeImgData, 'PNG', margin + halfWidth + 5, chartsStartY + chartHeight + 15, halfWidth - 10, chartHeight);
      
      // 5. Mantenimientos por Técnico (tercera fila)
      pdf.text('Mantenimientos por Técnico', margin, chartsStartY + (chartHeight * 2) + 20);
      
      console.log('Capturando gráfico de mantenimientos por técnico...');
      const technicianCanvas = await html2canvas(technicianChartRef.current, captureOptions);
      const technicianImgData = technicianCanvas.toDataURL('image/png', 1.0);
      
      // Usar todo el ancho para este gráfico
      pdf.addImage(technicianImgData, 'PNG', margin, chartsStartY + (chartHeight * 2) + 25, contentWidth, chartHeight);
      
      // Pie de página
      pdf.setFontSize(8);
      pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES')} - ErmitaAPP Sistema de Gestión de Mantenimientos`, 
        pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Guardar el PDF
      pdf.save(`Informe_Mantenimientos_${selectedYear}.pdf`);
      
    } catch (error) {
      console.error('Error al generar el informe:', error);
      alert('Ocurrió un error al generar el informe. Por favor, intente nuevamente.');
    } finally {
      setGeneratingReport(false);
    }
  };
  
  // Preparar datos para el gráfico de barras
  const barChartData = {
    labels: dashboardData.monthlyStats.map(item => item.month.substring(0, 3)), // Primeras 3 letras del mes
    datasets: [
      {
        label: 'Preventivo',
        data: dashboardData.monthlyStats.map(item => item.preventiveMaintenance),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Correctivo',
        data: dashboardData.monthlyStats.map(item => item.correctiveMaintenance),
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1,
      }
    ]
  };

  // Preparar datos para el gráfico de tipos de mantenimiento
  const maintenanceTypeData = {
    labels: dashboardData.summary.map(item => item.type),
    datasets: [{
      data: dashboardData.summary.map(item => item.quantity),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(147, 51, 234)'
      ],
      borderWidth: 1
    }]
  };

  // Datos para el estado de equipos
  const equipmentStatusData = {
    labels: ['Activo', 'Inactivo'],
    datasets: [{
      data: [equipmentStatus.active, equipmentStatus.inactive],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 1
    }]
  };

  // Datos para el tiempo promedio (simulados por ahora)
  const averageTimeData = {
    labels: dashboardData.monthlyStats.map(item => item.month.substring(0, 3)),
    datasets: [{
      label: 'Horas',
      data: dashboardData.monthlyStats.map((_, index) => index < dashboardData.summary.length ? 
        parseFloat(dashboardData.summary[index % dashboardData.summary.length].averageTime) || 0 : 0),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // Datos para mantenimientos por técnico
  const technicianData = {
    labels: dashboardData.technicianStats?.map(item => item.name) || [
      'Juan Pérez',
      'María García',
      'Carlos López',
      'Ana Martínez',
      'Luis Rodríguez'
    ],
    datasets: [{
      label: 'Mantenimientos',
      data: dashboardData.technicianStats?.map(item => item.maintenanceCount) || [
        Math.floor(Math.random() * 20) + 5, // Entre 5 y 24
        Math.floor(Math.random() * 20) + 5,
        Math.floor(Math.random() * 20) + 5,
        Math.floor(Math.random() * 20) + 5,
        Math.floor(Math.random() * 20) + 5
      ],
      backgroundColor: [
        'rgba(37, 99, 235, 0.8)',  // blue-600
        'rgba(29, 78, 216, 0.8)',  // blue-700
        'rgba(30, 64, 175, 0.8)',  // blue-800
        'rgba(30, 58, 138, 0.8)',  // blue-900
        'rgba(59, 130, 246, 0.8)'  // blue-500
      ],
      borderColor: [
        'rgba(37, 99, 235, 1)',
        'rgba(29, 78, 216, 1)',
        'rgba(30, 64, 175, 1)',
        'rgba(30, 58, 138, 1)',
        'rgba(59, 130, 246, 1)'
      ],
      borderWidth: 1,
      borderRadius: 8,
      barThickness: 40,
      maxBarThickness: 50
    }]
  };

  // Opciones del gráfico de técnicos
  const technicianOptions = {
    indexAxis: 'x', // Barras verticales (valor por defecto)
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Ocultar la leyenda ya que solo hay un dataset
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Mantenimientos: ${context.raw}`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#000',
        anchor: 'end',
        align: 'top',
        formatter: (value) => value
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Técnicos',
          font: {
            weight: 'bold'
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        title: {
          display: true,
          text: 'Cantidad de Mantenimientos',
          font: {
            weight: 'bold'
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
    <div className="space-y-6">
      <AnimatedContainer>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Reportes de Mantenimiento</h1>
          {reportGenerated && (
            <button 
              onClick={generateReport}
              disabled={generatingReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              {generatingReport ? 'Generando...' : 'Descargar PDF'}
            </button>
          )}
        </div>

        {/* Selectores de fecha */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Seleccionar rango de fechas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                max={fechaFin || new Date().toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(e, 'start')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de fin
              </label>
              <input
                type="date"
                value={fechaFin}
                min={fechaInicio}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(e, 'end')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleGenerateReport}
                disabled={!fechaInicio || !fechaFin || loading}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Cargando...' : 'Generar Reporte'}
              </button>
            </div>
          </div>
          
          {error ? (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          ) : reportGenerated ? (
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
              Mostrando datos desde el <span className="font-medium">{formatDate(fechaInicio)}</span> hasta el <span className="font-medium">{formatDate(fechaFin)}</span>
            </div>
          ) : null}
        </div>
      </AnimatedContainer>

      {/* Gráficos - Solo se muestran después de generar el reporte */}
      <AnimatedContainer className="mt-6">
        {reportGenerated && !error ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatedContainer delay={0.2}>
                <div className="bg-white p-6 rounded-xl shadow-lg" ref={maintenanceChartRef}>
                  <h3 className="text-lg font-semibold mb-4">Mantenimientos por Mes</h3>
                  <div className="h-72">
                    <Bar 
                      data={barChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
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
                <div className="bg-white p-6 rounded-xl shadow-lg" ref={equipmentChartRef}>
                  <h3 className="text-lg font-semibold mb-4">Estado de Equipos</h3>
                  <div className="h-72">
                    <Doughnut 
                      data={equipmentStatusData}
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
                <div className="bg-white p-6 rounded-xl shadow-lg" ref={maintenanceTypeChartRef}>
                  <h3 className="text-lg font-semibold mb-4">Tipos de Mantenimiento</h3>
                  <div className="h-72">
                    <Doughnut 
                      data={maintenanceTypeData}
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
                <div className="bg-white p-6 rounded-xl shadow-lg" ref={avgTimeChartRef}>
                  <h3 className="text-lg font-semibold mb-4">Tiempo Promedio de Reparación (días)</h3>
                  <div className="h-72">
                    <Line 
                      data={averageTimeData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
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

            <AnimatedContainer delay={0.6}>
              <div className="bg-white p-6 rounded-xl shadow-lg" ref={technicianChartRef}>
                <h3 className="text-lg font-semibold mb-4">Mantenimientos por Técnico</h3>
                <div className="h-72">
                  <Bar 
                    data={technicianData}
                    options={technicianOptions}
                  />
                </div>
              </div>
            </AnimatedContainer>

            <AnimatedContainer delay={0.7}>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden" ref={reportContainerRef}>
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
                      {dashboardData.summary.map((item, index) => (
                        <tr key={index} className={index < dashboardData.summary.length - 1 ? "border-b hover:bg-gray-50" : "hover:bg-gray-50"}>
                          <td className="py-3 px-4 text-sm">{item.type}</td>
                          <td className="py-3 px-4 text-sm">{item.count}</td>
                          <td className="py-3 px-4 text-sm">
                            {item.averageTime ? `${Math.round(item.averageTime / 60)} horas` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        ) : !error ? (
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos para mostrar</h3>
            <p className="text-gray-500 mb-4">Selecciona un rango de fechas y haz clic en "Generar Reporte" para ver las estadísticas.</p>
          </div>
        ) : null}
      </AnimatedContainer>
    </div>
  );
}