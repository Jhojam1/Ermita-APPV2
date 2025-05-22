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
  // Referencias para los gráficos (para exportar a PDF)
  const maintenanceChartRef = useRef(null);
  const maintenanceTypeChartRef = useRef(null);
  const avgTimeChartRef = useRef(null);
  const technicianChartRef = useRef(null);
  const reportContainerRef = useRef(null);
  
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
    equipmentStatus: { activo: 0, inactivo: 0 }
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
      
      console.log('Datos del dashboard:', dashboardData);
      
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
        equipmentStatus: { activo: 0, inactivo: 0 }
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
    }
  };
  
  // Obtener el año seleccionado para el título del informe
  const selectedYear = fechaInicio ? new Date(fechaInicio).getFullYear().toString() : new Date().getFullYear().toString();
  
  // Función para generar y descargar el reporte en PDF
  const generateReport = async () => {
    if (!reportGenerated) {
      alert('Por favor, primero genere un reporte.');
      return;
    }
    
    setGeneratingReport(true);
    
    try {
      // Opciones para la captura de los gráficos
      const captureOptions = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      };
      
      // Crear nuevo documento PDF
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      
      // Título del informe
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`INFORME DE MANTENIMIENTOS - AÑO ${selectedYear}`, pageWidth / 2, 13, { align: 'center' });
      
      // Resumen numérico de datos
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMEN DE MANTENIMIENTOS', margin, 30);
      
      // Calcular totales
      const preventiveMaintenance = dashboardData.summary.preventive || 0;
      const correctiveMaintenance = dashboardData.summary.corrective || 0;
      const totalMaintenance = dashboardData.summary.total || 0;
      const preventivePercentage = totalMaintenance > 0 ? Math.round((preventiveMaintenance / totalMaintenance) * 100) : 0;
      const correctivePercentage = totalMaintenance > 0 ? Math.round((correctiveMaintenance / totalMaintenance) * 100) : 0;
      
      // Crear tabla de resumen
      const summaryTable = [
        ['Tipo', 'Cantidad', '%', 'Tiempo Promedio'],
        ['Preventivo', 
         preventiveMaintenance.toString(), 
         `${preventivePercentage}%`, 
         `${dashboardData.summary.averagePreventiveTime.toFixed(2)} horas`],
        ['Correctivo', 
         correctiveMaintenance.toString(), 
         `${correctivePercentage}%`, 
         `${dashboardData.summary.averageCorrectiveTime.toFixed(2)} horas`],
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
      
      // 2. Tipos de Mantenimiento (superior derecha)
      pdf.text('Tipos de Mantenimiento', margin + halfWidth + 5, chartsStartY);
      
      console.log('Capturando gráfico de tipos de mantenimiento...');
      const typeCanvas = await html2canvas(maintenanceTypeChartRef.current, captureOptions);
      const typeImgData = typeCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(typeImgData, 'PNG', margin + halfWidth + 5, chartsStartY + 5, halfWidth - 10, chartHeight);
      
      // 3. Tiempo Promedio (medio izquierda)
      pdf.text('Tiempo Promedio de Mantenimiento', margin, chartsStartY + chartHeight + 10);
      
      console.log('Capturando gráfico de tiempo promedio...');
      const timeCanvas = await html2canvas(avgTimeChartRef.current, captureOptions);
      const timeImgData = timeCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(timeImgData, 'PNG', margin, chartsStartY + chartHeight + 15, halfWidth, chartHeight);
      
      // 4. Mantenimientos por Técnico (medio derecha)
      pdf.text('Mantenimientos por Técnico', margin + halfWidth + 5, chartsStartY + chartHeight + 10);
      
      console.log('Capturando gráfico de mantenimientos por técnico...');
      const technicianCanvas = await html2canvas(technicianChartRef.current, captureOptions);
      const technicianImgData = technicianCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(technicianImgData, 'PNG', margin + halfWidth + 5, chartsStartY + chartHeight + 15, halfWidth - 10, chartHeight);
      
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
  
  // Preparar datos para los gráficos
  const monthlyChartData = {
    labels: dashboardData.monthlyStats.map(stat => {
      const [year, month] = stat.month.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long'
      });
    }),
    datasets: [
      {
        label: 'Preventivo',
        data: dashboardData.monthlyStats.map(stat => stat.preventive || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Correctivo',
        data: dashboardData.monthlyStats.map(stat => stat.corrective || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      }
    ]
  };

  // Datos para el gráfico de tipos de mantenimiento
  const maintenanceTypeData = {
    labels: ['Preventivo', 'Correctivo'],
    datasets: [{
      data: [
        dashboardData.summary.preventive || 0, 
        dashboardData.summary.corrective || 0
      ],
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
  const hasMaintenanceData = dashboardData.summary.total > 0;

  // Datos para el tiempo promedio
  const averageTimeData = {
    labels: dashboardData.monthlyStats.map(stat => {
      const [year, month] = stat.month.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', {
        month: 'short'
      });
    }),
    datasets: [
      {
        label: 'Tiempo Promedio (horas)',
        data: dashboardData.monthlyStats.map(stat => {
          const total = (stat.preventive || 0) + (stat.corrective || 0);
          if (total === 0) return 0;
          const summary = dashboardData.summary || { averagePreventiveTime: 0, averageCorrectiveTime: 0 };
          const avgPreventive = ((stat.preventive || 0) / total) * (summary.averagePreventiveTime || 0);
          const avgCorrective = ((stat.corrective || 0) / total) * (summary.averageCorrectiveTime || 0);
          return parseFloat((avgPreventive + avgCorrective).toFixed(2));
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Datos para mantenimientos por técnico
  const firstMonth = dashboardData.monthlyStats.length > 0 ? dashboardData.monthlyStats[0].month : '';
  const technicianStats = firstMonth ? dashboardData.technicianStats[firstMonth] || [] : [];
  const hasTechnicianData = technicianStats.length > 0 && technicianStats.some(tech => tech.total > 0);
    
  console.log('Datos de técnicos para mostrar:', {
    hasTechnicianData,
    technicianStats,
    firstMonth
  });

  const technicianData = {
    labels: hasTechnicianData 
      ? technicianStats.map(tech => tech.technicianName)
      : [],
    datasets: [{
      label: 'Mantenimientos',
      data: hasTechnicianData ? technicianStats.map(tech => tech.total) : [],
      backgroundColor: [
        'rgba(59, 130, 246, 1)'
      ],
      borderWidth: 1,
      borderRadius: 8,
      barThickness: hasTechnicianData ? 40 : 0,
      maxBarThickness: hasTechnicianData ? 50 : 0
    }]
  };

  // Opciones del gráfico de técnicos
  const technicianOptions = {
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: hasTechnicianData ? 1000 : 0
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: hasTechnicianData,
        callbacks: {
          label: function(context) {
            return `Mantenimientos: ${context.raw}`;
          }
        }
      },
      datalabels: {
        display: hasTechnicianData,
        color: '#000',
        anchor: 'end',
        align: 'top',
        formatter: function(value) {
          return value;
        }
      },
      // Mostrar mensaje cuando no hay datos
      beforeDraw: (chart: any) => {
        if (!hasTechnicianData) {
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
        display: hasTechnicianData,
        title: {
          display: hasTechnicianData,
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
        display: hasTechnicianData,
        title: {
          display: hasTechnicianData,
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
  
  return (
    <div className="space-y-6">
      <AnimatedContainer>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Reportes de Mantenimiento</h1>
          {reportGenerated && (
            <button 
              onClick={generateReport}
              disabled={generatingReport}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {generatingReport ? 'Generando PDF...' : 'Descargar PDF'}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => handleDateChange(e, 'start')}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => handleDateChange(e, 'end')}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Generar Reporte'}
            </button>
          </div>
        </div>

        {reportGenerated && (
          <div className="mt-8">
            {!error ? (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnimatedContainer delay={0.1}>
                    <div className="bg-white p-6 rounded-xl shadow-lg" ref={maintenanceChartRef}>
                      <h3 className="text-lg font-semibold mb-4">Mantenimientos por Mes</h3>
                      <div className="h-72">
                        <Bar 
                          data={monthlyChartData}
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
                      </div>
                    </div>
                  </AnimatedContainer>

                  <AnimatedContainer delay={0.2}>
                    <div className="bg-white p-6 rounded-xl shadow-lg" ref={maintenanceTypeChartRef}>
                      <h3 className="text-lg font-semibold mb-4">Tipos de Mantenimiento</h3>
                      <div className="h-72 flex items-center justify-center">
                        {hasMaintenanceData ? (
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
                                },
                                tooltip: {
                                  callbacks: {
                                    label: function(context) {
                                      const label = context.label || '';
                                      const value = context.raw || 0;
                                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
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

                  <AnimatedContainer delay={0.3}>
                    <div className="bg-white p-6 rounded-xl shadow-lg" ref={avgTimeChartRef}>
                      <h3 className="text-lg font-semibold mb-4">Tiempo Promedio de Reparación</h3>
                      <div className="h-72">
                        <Line 
                          data={averageTimeData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false
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
                                  text: 'Horas'
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

                  <AnimatedContainer delay={0.4}>
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
                </div>
                
                <div className="mt-6">
                  <AnimatedContainer delay={0.5}>
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
                            {summaryData.length > 0 ? (
                              summaryData.map((item, index) => (
                                <tr 
                                  key={item.type}
                                  className={`${index < summaryData.length - 1 ? 'border-b' : ''} ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                                >
                                  <td className="py-3 px-4 text-sm">
                                    {item.type}
                                  </td>
                                  <td className="py-3 px-4 text-sm font-medium text-center">
                                    {item.quantity}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-center">
                                    {item.averageTime}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="py-4 text-center text-gray-500">
                                  No hay datos de mantenimientos para mostrar
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </AnimatedContainer>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
                <p className="text-gray-500 mb-4">{error}</p>
              </div>
            )}
          </div>
        )}

        {!reportGenerated && !error && (
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos para mostrar</h3>
            <p className="text-gray-500 mb-4">Selecciona un rango de fechas y haz clic en "Generar Reporte" para ver las estadísticas.</p>
          </div>
        )}
      </AnimatedContainer>
    </div>
  );
}
