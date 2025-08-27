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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import reportService, { DashboardData } from '../services/reportService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar los componentes modulares
import DateRangeFilter from '../components/reports/DateRangeFilter';
import MonthlyMaintenanceChart from '../components/reports/MonthlyMaintenanceChart';
import MaintenanceTypeChart from '../components/reports/MaintenanceTypeChart';
import AverageTimeChart from '../components/reports/AverageTimeChart';
import TechnicianChart from '../components/reports/TechnicianChart';
import MaintenanceSummaryTable from '../components/reports/MaintenanceSummaryTable';
import ScheduledVsCompletedReport from '../components/reports/ScheduledVsCompletedReport';
import MaintenanceOverviewChart from '../components/reports/MaintenanceOverviewChart';
import TechnicianProductivityReport from '../components/maintenance/TechnicianProductivityReport';
import { ErrorMessage, NoDataMessage } from '../components/reports/ReportMessages';

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

export default function ReportsNew() {
  // Referencias para los gráficos (para exportar a PDF)
  const maintenanceChartRef = useRef(null);
  const maintenanceTypeChartRef = useRef(null);
  const avgTimeChartRef = useRef(null);
  const technicianChartRef = useRef(null);
  const reportContainerRef = useRef(null);
  const scheduledVsCompletedRef = useRef(null);
  const maintenanceOverviewRef = useRef(null);
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    summary: {
      total: 0,
      preventive: 0,
      corrective: 0,
      averagePreventiveTime: 0,
      averageCorrectiveTime: 0
    },
    monthlyStats: [],
    technicianStats: {},
    equipmentStatus: { activo: 0, inactivo: 0 },
    scheduledVsCompleted: [],
    maintenanceOverview: {}
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
      // Obtener todos los datos del dashboard en una sola llamada
      const dashboardData = await reportService.getDashboardData({ startDate, endDate });
      
      console.log('=== DATOS RECIBIDOS DEL BACKEND ===');
      console.log('📊 Datos completos del dashboard:', dashboardData);
      console.log('📈 Datos de mantenimientos por mes:', dashboardData.monthlyStats);
      console.log('👥 Datos de técnicos:', dashboardData.technicianStats);
      console.log('📋 Resumen general:', dashboardData.summary);
      console.log('⚙️ Estado de equipos:', dashboardData.equipmentStatus);
      
      // Análisis de datos faltantes
      if (!dashboardData.monthlyStats || dashboardData.monthlyStats.length === 0) {
        console.warn('⚠️ PROBLEMA: monthlyStats está vacío - No hay datos mensuales para el período seleccionado');
      }
      
      if (!dashboardData.technicianStats || Object.keys(dashboardData.technicianStats).length === 0) {
        console.warn('⚠️ PROBLEMA: technicianStats está vacío - No hay estadísticas de técnicos por mes');
      }
      
      if (dashboardData.summary.total === 0) {
        console.warn('⚠️ PROBLEMA: summary.total es 0 - No hay mantenimientos en el período o no están completados');
      }
      
      if (dashboardData.equipmentStatus.activo === 0 && dashboardData.equipmentStatus.inactivo === 0) {
        console.warn('⚠️ PROBLEMA: equipmentStatus en 0 - No se están consultando datos de inventario');
      }
      
      // Si no hay datos de mantenimientos programados vs. realizados, obtenerlos
      if (!dashboardData.scheduledVsCompleted || dashboardData.scheduledVsCompleted.length === 0) {
        try {
          const scheduledVsCompleted = await reportService.getScheduledVsCompletedReport({ startDate, endDate });
          console.log('📅 Datos de mantenimientos programados vs realizados:', scheduledVsCompleted);
          dashboardData.scheduledVsCompleted = scheduledVsCompleted;
        } catch (error) {
          console.error('❌ Error al obtener datos de mantenimientos programados vs. realizados:', error);
        }
      } else {
        console.log('📅 Datos de mantenimientos programados vs realizados (ya incluidos):', dashboardData.scheduledVsCompleted);
      }
      
      // Si no hay datos de visión general, obtenerlos
      if (!dashboardData.maintenanceOverview || Object.keys(dashboardData.maintenanceOverview).length === 0) {
        try {
          const maintenanceOverview = await reportService.getMaintenanceOverview({ startDate, endDate });
          console.log('🔍 Datos de visión general de mantenimientos:', maintenanceOverview);
          dashboardData.maintenanceOverview = maintenanceOverview;
        } catch (error) {
          console.error('❌ Error al obtener datos de visión general:', error);
        }
      } else {
        console.log('🔍 Datos de visión general (ya incluidos):', dashboardData.maintenanceOverview);
      }
      
      // Actualizar el estado con los datos obtenidos
      setDashboardData(dashboardData);
      
      // Marcar que el reporte ha sido generado
      setReportGenerated(true);
      return true;
    } catch (error) {
      console.error('Error al cargar los datos de reportes:', error);
      
      // Establecer mensaje de error
      setError('Ha ocurrido un error al buscar los datos. Por favor, contacte con el administrador.');
      
      // Limpiar datos en caso de error
      setDashboardData({
        summary: {
          total: 0,
          preventive: 0,
          corrective: 0,
          averagePreventiveTime: 0,
          averageCorrectiveTime: 0
        },
        monthlyStats: [],
        technicianStats: {},
        equipmentStatus: { activo: 0, inactivo: 0 },
        scheduledVsCompleted: [],
        maintenanceOverview: {}
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
    } else {
      setFechaFin(value);
    }
    
    // Si ambas fechas están seleccionadas, limpiar el reporte generado
    if (fechaInicio && fechaFin) {
      setReportGenerated(false);
    }
  };
  
  // Función para generar y descargar el reporte en PDF
  const generateReport = async () => {
    if (!reportGenerated) return;
    
    setGeneratingReport(true);
    
    try {
      // Crear un nuevo documento PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Añadir título y fecha
      pdf.setFontSize(18);
      pdf.text('Informe de Mantenimientos', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Período: ${formatDate(fechaInicio)} - ${formatDate(fechaFin)}`, pageWidth / 2, 30, { align: 'center' });
      
      // Añadir gráficos al PDF
      let yPosition = 40;
      const margin = 10;
      const graphWidth = pageWidth - 2 * margin;
      const graphHeight = 60;
      
      // Función para añadir un gráfico al PDF
      const addChartToPdf = async (ref: React.RefObject<HTMLDivElement>, title: string) => {
        if (ref.current) {
          const canvas = await html2canvas(ref.current);
          const imgData = canvas.toDataURL('image/png');
          
          // Verificar si necesitamos una nueva página
          if (yPosition + graphHeight + 10 > pageHeight) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Añadir título del gráfico
          pdf.setFontSize(14);
          pdf.text(title, margin, yPosition);
          yPosition += 10;
          
          // Añadir imagen del gráfico
          pdf.addImage(imgData, 'PNG', margin, yPosition, graphWidth, graphHeight);
          yPosition += graphHeight + 20;
        }
      };
      
      // Añadir gráficos al PDF
      await addChartToPdf(maintenanceChartRef, 'Mantenimientos por Mes');
      await addChartToPdf(maintenanceTypeChartRef, 'Tipos de Mantenimiento');
      await addChartToPdf(avgTimeChartRef, 'Tiempo Promedio de Reparación');
      await addChartToPdf(technicianChartRef, 'Mantenimientos por Técnico');
      
      // Añadir los nuevos gráficos
      await addChartToPdf(scheduledVsCompletedRef, 'Mantenimientos Programados vs. Realizados');
      await addChartToPdf(maintenanceOverviewRef, 'Visión General de Mantenimientos');
      
      // Añadir tabla de resumen
      if (reportContainerRef.current) {
        const canvas = await html2canvas(reportContainerRef.current);
        const imgData = canvas.toDataURL('image/png');
        
        // Verificar si necesitamos una nueva página
        if (yPosition + 60 > pageHeight) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Añadir título de la tabla
        pdf.setFontSize(14);
        pdf.text('Resumen de Mantenimientos', margin, yPosition);
        yPosition += 10;
        
        // Añadir imagen de la tabla
        pdf.addImage(imgData, 'PNG', margin, yPosition, graphWidth, 40);
      }
      
      // Añadir pie de página
      pdf.setFontSize(8);
      pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES')} - ErmitaAPP Sistema de Gestión de Mantenimientos`, 
        pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Guardar el PDF
      pdf.save(`Informe_Mantenimientos_${fechaInicio}_${fechaFin}.pdf`);
      
    } catch (error) {
      console.error('Error al generar el informe:', error);
      alert('Ocurrió un error al generar el informe. Por favor, intente nuevamente.');
    } finally {
      setGeneratingReport(false);
    }
  };
  
  // Datos para el resumen en tabla
  const summary = dashboardData.summary || {
    preventive: 0,
    corrective: 0,
    total: 0,
    averagePreventiveTime: 0,
    averageCorrectiveTime: 0
  };
  
  const summaryData = [
    {
      type: 'Preventivo',
      quantity: summary.preventive || 0,
      averageTime: `${(summary.averagePreventiveTime || 0).toFixed(2)} horas`
    },
    {
      type: 'Correctivo',
      quantity: summary.corrective || 0,
      averageTime: `${(summary.averageCorrectiveTime || 0).toFixed(2)} horas`
    },
    {
      type: 'Total',
      quantity: summary.total || 0,
      averageTime: '-'
    }
  ];

  // Consolidar datos de técnicos de todos los meses para evitar duplicados
  const availableMonths = dashboardData.monthlyStats.map(stat => stat.month);
  let consolidatedTechnicianStats = [];
  
  if (availableMonths.length > 0) {
    // Crear un mapa para consolidar los datos por ID de técnico
    const technicianMap = new Map();
    
    // Procesar cada mes
    availableMonths.forEach(month => {
      const monthStats = dashboardData.technicianStats[month] || [];
      
      // Agregar o actualizar datos de técnicos
      monthStats.forEach(tech => {
        const techId = tech.technicianId;
        if (technicianMap.has(techId)) {
          // Sumar al total existente
          const existingTech = technicianMap.get(techId);
          existingTech.total += tech.total;
        } else {
          // Agregar nuevo técnico
          technicianMap.set(techId, { ...tech });
        }
      });
    });
    
    // Convertir el mapa a array
    consolidatedTechnicianStats = Array.from(technicianMap.values());
  }
  
  return (
    <div className="space-y-6">
      <AnimatedContainer>
        <DateRangeFilter
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onDateChange={handleDateChange}
          onGenerateReport={handleGenerateReport}
          loading={loading}
          reportGenerated={reportGenerated}
          onDownloadPdf={generateReport}
          generatingReport={generatingReport}
        />

        {reportGenerated && (
          <div className="mt-8">
            {!error ? (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de mantenimientos por mes */}
                  <MonthlyMaintenanceChart
                    data={dashboardData.monthlyStats}
                    chartRef={maintenanceChartRef}
                  />

                  {/* Gráfico de tipos de mantenimiento */}
                  <MaintenanceTypeChart
                    preventive={summary.preventive}
                    corrective={summary.corrective}
                    chartRef={maintenanceTypeChartRef}
                  />

                  {/* Gráfico de tiempo promedio */}
                  <AverageTimeChart
                    data={dashboardData.monthlyStats}
                    averagePreventiveTime={summary.averagePreventiveTime}
                    averageCorrectiveTime={summary.averageCorrectiveTime}
                    chartRef={avgTimeChartRef}
                  />

                  {/* Gráfico de mantenimientos por técnico */}
                  <TechnicianChart
                    data={consolidatedTechnicianStats}
                    chartRef={technicianChartRef}
                  />

                  {/* Nuevo gráfico: Mantenimientos programados vs. realizados */}
                  <ScheduledVsCompletedReport
                    data={dashboardData.scheduledVsCompleted || []}
                    chartRef={scheduledVsCompletedRef}
                  />

                  {/* Nuevo gráfico: Visión general de mantenimientos */}
                  <MaintenanceOverviewChart
                    data={dashboardData.maintenanceOverview || {}}
                    chartRef={maintenanceOverviewRef}
                  />
                </div>
                
                {/* Gráfico de productividad de técnicos */}
                <div className="mt-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Productividad de Técnicos
                    </h3>
                    <TechnicianProductivityReport />
                  </div>
                </div>
                
                {/* Tabla de resumen */}
                <div className="mt-6">
                  <MaintenanceSummaryTable
                    data={summaryData}
                    containerRef={reportContainerRef}
                  />
                </div>
              </div>
            ) : (
              <ErrorMessage message={error} />
            )}
          </div>
        )}

        {!reportGenerated && !error && (
          <NoDataMessage />
        )}
      </AnimatedContainer>
    </div>
  );
}
