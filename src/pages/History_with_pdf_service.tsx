import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import maintenanceService from '../services/maintenanceService';
import userService from '../services/userService';
import jsPDF from 'jspdf';

export default function History() {
  const [mantenimientosData, setMantenimientosData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<any | null>(null);
  // const [technicianSignature, setTechnicianSignature] = useState<string | null>(null);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filtros adicionales
  const [filterType, setFilterType] = useState<string>('');
  const [filterDateRange, setFilterDateRange] = useState<{start: string, end: string}>({start: '', end: ''});

  useEffect(() => {
    fetchCompletedMaintenances();
  }, []);

  const fetchCompletedMaintenances = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await maintenanceService.getMaintenancesByStatus('COMPLETADO');
      console.log('Datos recibidos de mantenimientos completados:', data);
      
      // Verificar si hay firmas de técnicos en los datos
      const firmasTecnicos = data.filter(item => item.technicianSignature);
      console.log('Mantenimientos con firma de técnico:', firmasTecnicos.length);
      if (firmasTecnicos.length > 0) {
        console.log('Ejemplo de firma de técnico:', firmasTecnicos[0].technicianSignature?.substring(0, 50) + '...');
      } else {
        console.log('No se encontraron firmas de técnicos en los datos');
      }
      
      const mappedData = data.map(item => maintenanceService.mapToUI(item));
      setMantenimientosData(mappedData);
    } catch (err) {
      console.error('Error al cargar mantenimientos completados:', err);
      setError('Error al cargar el historial de mantenimientos. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener la firma del técnico desde el servicio de usuarios
  const fetchTechnicianSignature = async (technicianId: number | undefined) => {
    console.log('[DEBUG] Datos del mantenimiento seleccionado:', {
      id: selectedMantenimiento?.id,
      tecnico: selectedMantenimiento?.tecnico,
      technicianId: selectedMantenimiento?.technicianId,
      nombreTecnico: selectedMantenimiento?.nombreTecnico
    });
    
    if (!technicianId) {
      console.log('[DEBUG] No hay ID de técnico disponible en el mantenimiento');
      // setTechnicianSignature(null);
      return;
    }
    
    try {
      console.log(`[DEBUG] Obteniendo firma del técnico con ID ${technicianId}`);
      const signature = await userService.getUserSignature(technicianId);
      console.log(`[DEBUG] Firma del técnico obtenida:`, signature ? `Sí (longitud: ${signature.length})` : 'No');
      // setTechnicianSignature(signature);
    } catch (error) {
      console.error('[DEBUG] Error al obtener la firma del técnico:', error);
      // setTechnicianSignature(null);
    }
  };

  // Función para mostrar los detalles de un mantenimiento
  const handleVerDetalles = (mantenimiento: any) => {
    setSelectedMantenimiento(mantenimiento);
    setShowDetallesModal(true);
    
    // Si el mantenimiento tiene un ID de técnico, obtener su firma
    if (mantenimiento.technicianId) {
      fetchTechnicianSignature(mantenimiento.technicianId);
    } else {
      console.log('[DEBUG] El mantenimiento no tiene ID de técnico');
      // setTechnicianSignature(null);
    }
  };

  const handleDescargarReporte = async (id: string) => {
    try {
      // Buscar el mantenimiento seleccionado
      const mantenimiento = mantenimientosData.find(m => m.id === id);
      if (!mantenimiento) {
        alert('No se encontró el mantenimiento seleccionado');
        return;
      }

      console.log('[DEBUG] Generando reporte para mantenimiento:', {
        id: mantenimiento.id,
        equipo: mantenimiento.equipo,
        tecnico: mantenimiento.tecnico,
        technicianId: mantenimiento.technicianId
      });
      
      // Obtener firma del técnico
      let firmaTecnicoUrl: string | null = null;
      if (mantenimiento.technicianId) {
        try {
          console.log(`[DEBUG] Obteniendo firma del técnico con ID ${mantenimiento.technicianId}`);
          const technicianSignature = await userService.getUserSignature(mantenimiento.technicianId);
          if (technicianSignature) {
            firmaTecnicoUrl = technicianSignature.startsWith('data:') 
              ? technicianSignature 
              : `data:image/png;base64,${technicianSignature}`;
            console.log('[DEBUG] Firma del técnico obtenida');
          }
        } catch (error) {
          console.error('[DEBUG] Error al obtener la firma del técnico:', error);
        }
      } else if (mantenimiento.firmaTecnico) {
        firmaTecnicoUrl = mantenimiento.firmaTecnico.startsWith('data:') 
          ? mantenimiento.firmaTecnico 
          : `data:image/png;base64,${mantenimiento.firmaTecnico}`;
      }

      // Obtener firma del responsable
      let firmaResponsableUrl: string | null = null;
      if (mantenimiento.firma) {
        firmaResponsableUrl = mantenimiento.firma.startsWith('data:') 
          ? mantenimiento.firma 
          : `data:image/png;base64,${mantenimiento.firma}`;
      }
      
<<<<<<< HEAD
      // Generar PDF directamente
      generatePDF(mantenimiento, firmaTecnicoUrl, firmaResponsableUrl);
=======
      // Generar PDF usando el servicio
      pdfService.generateReport({
        mantenimiento,
        firmaTecnicoUrl,
        firmaResponsableUrl
      });
>>>>>>> 7fa4b5a957b2d1e0b1c4c1da6a950c4fe5671b4a
      
    } catch (error) {
      console.error('Error al generar el informe:', error);
      alert('Error al generar el informe. Por favor, intente nuevamente.');
    }
  };

  // Función para generar PDF
  const generatePDF = (mantenimiento: any, firmaTecnicoUrl: string | null, firmaResponsableUrl: string | null) => {
    // Fecha actual en formato largo para el certificado
    const fechaLarga = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    // Fecha actual formateada
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Crear el PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let yPosition = 20;
    
    // Configurar fuentes
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    
    // Encabezado
    pdf.text('INFORME DE MANTENIMIENTO', 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text(`ID: ${mantenimiento.id.padStart(4, '0')} | Fecha: ${fechaActual}`, 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Línea separadora
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 15;
    
    // Datos principales
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    
    pdf.text('Equipo:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(mantenimiento.equipo, 50, yPosition);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Técnico:', 110, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(mantenimiento.tecnico, 140, yPosition);
    yPosition += 8;
    
    // Certificación de Conformidad
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Certificación de Conformidad', 20, yPosition + 50);
    yPosition += 58;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const certificacionText = `Mediante el presente documento se certifica que el mantenimiento preventivo identificado con el código ${mantenimiento.id} fue ejecutado de manera satisfactoria el día ${fechaLarga}.
La intervención se realizó conforme a los procedimientos técnicos establecidos por el área de Sistemas, cumpliendo con los estándares de calidad, seguridad y las buenas prácticas definidas en el plan de trabajo.
Este informe constituye evidencia formal de la correcta ejecución del servicio, dentro del plazo previsto y con resultados plenamente alineados con los objetivos del mantenimiento programado.`;
    const certificacionLines = pdf.splitTextToSize(certificacionText, 170);
    pdf.text(certificacionLines, 20, yPosition);
    yPosition += certificacionLines.length * 5 + 20;
    
    // Firmas
    const firmasY = Math.max(yPosition, 240);
    
    if (firmaTecnicoUrl) {
      try {
        pdf.addImage(firmaTecnicoUrl, 'PNG', 30, firmasY - 20, 40, 15);
      } catch (e) {
        console.log('Error al agregar firma del técnico:', e);
      }
    }
    
    if (firmaResponsableUrl) {
      try {
        pdf.addImage(firmaResponsableUrl, 'PNG', 130, firmasY - 20, 40, 15);
      } catch (e) {
        console.log('Error al agregar firma del responsable:', e);
      }
    }
    
    // Líneas para firmas
    pdf.line(25, firmasY, 75, firmasY);
    pdf.line(125, firmasY, 175, firmasY);
    
    // Nombres bajo las líneas
    pdf.text(mantenimiento.tecnico, 50, firmasY + 5, { align: 'center' });
    pdf.text(mantenimiento.responsable || 'No especificado', 150, firmasY + 5, { align: 'center' });
    
    // Guardar el PDF
    pdf.save(`Informe_Mantenimiento_${mantenimiento.equipo.replace(/\s+/g, '_')}_${mantenimiento.id}.pdf`);
  };

  // Filtrar mantenimientos según los criterios de búsqueda y filtros
  const filteredMantenimientos = mantenimientosData.filter(item => {
    // Filtro por término de búsqueda
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = (
        item.equipo.toLowerCase().includes(searchTermLower) ||
        item.tecnico.toLowerCase().includes(searchTermLower) ||
        item.tipo.toLowerCase().includes(searchTermLower) ||
        (item.fechaCompletado && item.fechaCompletado.toLowerCase().includes(searchTermLower)) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(searchTermLower)) ||
        (item.observaciones && item.observaciones.toLowerCase().includes(searchTermLower)) ||
        (item.area && item.area.toLowerCase().includes(searchTermLower)) ||
        (item.responsable && item.responsable.toLowerCase().includes(searchTermLower))
      );
      if (!matchesSearch) return false;
    }
    
    // Filtro por tipo de mantenimiento
    if (filterType && item.tipo !== filterType) {
      return false;
    }
    
    // Filtro por rango de fechas
    if (filterDateRange.start || filterDateRange.end) {
      if (!item.fechaCompletado) return false;
      
      const itemDate = new Date(item.fechaCompletado.split('/').reverse().join('-'));
      
      if (filterDateRange.start) {
        const startDate = new Date(filterDateRange.start);
        if (itemDate < startDate) return false;
      }
      
      if (filterDateRange.end) {
        const endDate = new Date(filterDateRange.end);
        if (itemDate > endDate) return false;
      }
    }
    
    return true;
  });

  // Obtener tipos únicos para el filtro
  const tiposUnicos = [...new Set(mantenimientosData.map(item => item.tipo))];

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMantenimientos.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Generar números de página
  const getPageNumbers = () => {
    const totalPages = Math.ceil(filteredMantenimientos.length / itemsPerPage);
    const pageNumbers = [];
    
    // Mostrar hasta 5 páginas
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Ajustar si estamos cerca del final
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchCompletedMaintenances}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial de Mantenimientos</h1>
          <p className="text-gray-600">Registro completo de mantenimientos completados</p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar mantenimientos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por tipo */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>

            {/* Filtro por fecha inicio */}
            <div className="relative">
              <CalendarIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={filterDateRange.start}
                onChange={(e) => setFilterDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por fecha fin */}
            <div className="relative">
              <CalendarIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={filterDateRange.end}
                onChange={(e) => setFilterDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botón para limpiar filtros */}
          {(searchTerm || filterType || filterDateRange.start || filterDateRange.end) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterDateRange({start: '', end: ''});
                  setCurrentPage(1);
                }}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <XMarkIcon className="h-4 w-4" />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Completados</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredMantenimientos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">P</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Preventivos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {filteredMantenimientos.filter(item => item.tipo === 'PREVENTIVO').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">C</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Correctivos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {filteredMantenimientos.filter(item => item.tipo === 'CORRECTIVO').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de mantenimientos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Mantenimientos Completados ({filteredMantenimientos.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Técnico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Completado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.equipo}</div>
                      <div className="text-sm text-gray-500">ID: {item.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.tipo === 'PREVENTIVO' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.tecnico}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.area || 'No especificada'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.fechaCompletado}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleVerDetalles(item)}
                          className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-200 hover:border-transparent transition-all duration-200"
                        >
                          Ver detalles
                        </button>
                        <button 
                          onClick={() => handleDescargarReporte(item.id)}
                          className="px-3 py-1 text-xs font-medium text-purple-600 hover:text-white hover:bg-purple-600 rounded-lg border border-purple-200 hover:border-transparent transition-all duration-200"
                        >
                          Descargar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredMantenimientos.length > itemsPerPage && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>
                    {' '}a{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredMantenimientos.length)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{filteredMantenimientos.length}</span>
                    {' '}resultados
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="10">10 por página</option>
                    <option value="20">20 por página</option>
                    <option value="50">50 por página</option>
                  </select>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  {getPageNumbers().map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 text-sm border rounded-lg ${
                        currentPage === number
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === Math.ceil(filteredMantenimientos.length / itemsPerPage)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Detalles */}
        {showDetallesModal && selectedMantenimiento && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Detalles del Mantenimiento
                  </h2>
                  <button
                    onClick={() => setShowDetallesModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">ID:</p>
                      <p className="font-medium">{selectedMantenimiento.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estado:</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {selectedMantenimiento.estado}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Equipo:</p>
                      <p className="font-medium">{selectedMantenimiento.equipo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tipo:</p>
                      <p className="font-medium">{selectedMantenimiento.tipo}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Fecha Programada:</p>
                      <p className="font-medium">{selectedMantenimiento.fechaProgramada}</p>
                    </div>
                    {selectedMantenimiento.fechaCompletado && (
                      <div>
                        <p className="text-sm text-gray-500">Fecha Completado:</p>
                        <p className="font-medium">{selectedMantenimiento.fechaCompletado}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Técnico:</p>
                    <p className="font-medium">{selectedMantenimiento.tecnico}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Área:</p>
                    <p className="font-medium">{selectedMantenimiento.area || 'No especificada'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Responsable:</p>
                    <p className="font-medium">{selectedMantenimiento.responsable}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Descripción:</p>
                    <p className="text-sm text-gray-700">{selectedMantenimiento.descripcion}</p>
                  </div>
                  
                  {selectedMantenimiento.observaciones && (
                    <div>
                      <p className="text-sm text-gray-500">Observaciones:</p>
                      <p className="text-sm text-gray-700">{selectedMantenimiento.observaciones}</p>
                    </div>
                  )}
                  
                  {/* Sección de firmas */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Firma del Técnico:</p>
                    <div className="border border-gray-200 rounded-lg p-2 flex items-center justify-center bg-gray-50 h-24">
                      {technicianSignature ? (
                        <img 
                          src={technicianSignature} 
                          alt="Firma del técnico" 
                          className="max-h-20 max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">Sin firma disponible</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => handleDescargarReporte(selectedMantenimiento.id)}
                  className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-600 hover:text-white transition-colors duration-200"
                >
                  Descargar Reporte
                </button>
                <button
                  onClick={() => setShowDetallesModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
