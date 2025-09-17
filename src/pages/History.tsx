import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import maintenanceService from '../services/maintenanceService';
import userService from '../services/userService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function History() {
  const [mantenimientosData, setMantenimientosData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<any | null>(null);
  const [technicianSignature, setTechnicianSignature] = useState<string | null>(null);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
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
      setTechnicianSignature(null);
      return;
    }
    
    try {
      console.log(`[DEBUG] Obteniendo firma del técnico con ID ${technicianId}`);
      const signature = await userService.getUserSignature(technicianId);
      console.log(`[DEBUG] Firma del técnico obtenida:`, signature ? `Sí (longitud: ${signature.length})` : 'No');
      setTechnicianSignature(signature);
    } catch (error) {
      console.error('[DEBUG] Error al obtener la firma del técnico:', error);
      setTechnicianSignature(null);
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
      setTechnicianSignature(null);
    }
  };

  const handleDescargarReporte = async (id: string) => {
    try {
      // Buscar el mantenimiento seleccionado
      const mantenimiento = mantenimientosData.find(m => m.id === id);
      if (!mantenimiento) {
        console.error('Mantenimiento no encontrado');
        return;
      }
      
      console.log('[DEBUG] Generando reporte para mantenimiento:', {
        id: mantenimiento.id,
        tecnico: mantenimiento.tecnico,
        technicianId: mantenimiento.technicianId
      });
      
      // Verificar si hay firma del responsable y precargarla para asegurar que esté disponible para el PDF
      let firmaValida = false;
      let firmaImg: HTMLImageElement | null = null;
      let firmaUrl = mantenimiento.firma;
      
      // Verificar si hay firma del técnico y precargarla
      let firmaTecnicoUrl = null;
      
      // Obtener la firma del técnico desde el servicio de usuarios si hay un ID de técnico
      if (mantenimiento.technicianId) {
        try {
          console.log(`[DEBUG] Obteniendo firma del técnico con ID ${mantenimiento.technicianId} para el reporte`);
          const technicianSignature = await userService.getUserSignature(mantenimiento.technicianId);
          if (technicianSignature) {
            firmaTecnicoUrl = technicianSignature;
            console.log('[DEBUG] Firma del técnico obtenida para el reporte, longitud:', technicianSignature.length);
          } else {
            console.log('[DEBUG] No se pudo obtener la firma del técnico para el reporte');
          }
        } catch (error) {
          console.error('[DEBUG] Error al obtener la firma del técnico para el reporte:', error);
        }
      } else if (mantenimiento.firmaTecnico) {
        // Usar la firma del técnico del mantenimiento si existe
        firmaTecnicoUrl = mantenimiento.firmaTecnico;
        console.log('[DEBUG] Usando firma del técnico del objeto mantenimiento');
      } else {
        console.log('[DEBUG] No hay firma de técnico disponible');
      }
      
      // Si la firma del responsable existe pero no tiene el formato correcto, intentar corregirla
      if (firmaUrl && typeof firmaUrl === 'string' && firmaUrl.trim() !== '') {
        // Si la firma no comienza con 'data:', agregar el prefijo de data URL
        if (!firmaUrl.startsWith('data:')) {
          firmaUrl = `data:image/png;base64,${firmaUrl}`;
        }
        
        try {
          // Precargar la imagen para verificar que sea válida
          firmaImg = new Image();
          firmaImg.src = firmaUrl;
          
          // Esperar a que la imagen se cargue o falle
          await new Promise((resolve) => {
            firmaImg!.onload = () => {
              firmaValida = true;
              resolve(true);
            };
            firmaImg!.onerror = () => {
              firmaValida = false;
              resolve(false);
            };
            // Establecer un tiempo límite para la carga de la imagen
            setTimeout(() => {
              resolve(false);
            }, 3000);
          });
        } catch (error) {
          firmaValida = false;
        }
      }
      
      // Asegurar que la firma del técnico tenga el formato correcto
      if (firmaTecnicoUrl && typeof firmaTecnicoUrl === 'string' && firmaTecnicoUrl.trim() !== '') {
        // Si la firma no comienza con 'data:', agregar el prefijo de data URL
        if (!firmaTecnicoUrl.startsWith('data:')) {
          firmaTecnicoUrl = `data:image/png;base64,${firmaTecnicoUrl}`;
        }
        console.log('[DEBUG] Firma del técnico preparada para el PDF');
      }

      // Crear un elemento temporal para renderizar el informe
      const reporteContainer = document.createElement('div');
      reporteContainer.style.position = 'absolute';
      reporteContainer.style.left = '-9999px';
      reporteContainer.style.top = '-9999px';
      reporteContainer.style.width = '794px'; // Ancho A4 en px
      reporteContainer.style.backgroundColor = 'white';
      reporteContainer.style.fontFamily = 'Arial, sans-serif';
      
      // Fecha actual formateada
      const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Crear el contenido del informe con un diseño que ocupe toda la hoja
      reporteContainer.innerHTML = `
        <div style="padding: 15px; font-family: Arial, sans-serif; line-height: 1.3; max-width: 750px; margin: 0 auto; height: 1056px; display: flex; flex-direction: column; box-sizing: border-box;">
          <!-- Contenido principal - distribuido con mejor espaciado -->
          <div style="flex: 0 0 auto;">
            <!-- Encabezado -->
            <div style="text-align: center; margin-bottom: 25px; padding-top: 15px;">
              <h1 style="font-size: 22px; margin: 0 0 8px 0; text-transform: uppercase; color: #000;">Informe de Mantenimiento</h1>
              <p style="margin: 0; font-size: 14px; color: #000;">ID: ${mantenimiento.id.padStart(4, '0')} | Fecha: ${fechaActual}</p>
            </div>
          
            <!-- Datos principales sin tablas -->
            <div style="margin-bottom: 25px; font-size: 14px; color: #000;">
              <div style="border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 15px;">
              <div style="display: flex; margin-bottom: 15px;">
                <div style="width: 50%; padding-right: 15px;">
                  <div style="margin-bottom: 10px;">
                    <strong style="display: inline-block; width: 130px;">Equipo:</strong>
                    <span>${mantenimiento.equipo}</span>
                  </div>
                  <div style="margin-bottom: 10px;">
                    <strong style="display: inline-block; width: 130px;">Tipo:</strong>
                    <span>${mantenimiento.tipo}</span>
                  </div>
                  <div>
                    <strong style="display: inline-block; width: 130px;">Estado:</strong>
                    <span>${mantenimiento.estado}</span>
                  </div>
                </div>
                <div style="width: 50%; padding-left: 15px;">
                  <div style="margin-bottom: 10px;">
                    <strong style="display: inline-block; width: 130px;">Técnico:</strong>
                    <span>${mantenimiento.tecnico}</span>
                  </div>
                  <div style="margin-bottom: 10px;">
                    <strong style="display: inline-block; width: 130px;">Área:</strong>
                    <span>${mantenimiento.area || 'No especificada'}</span>
                  </div>
                  <div>
                    <strong style="display: inline-block; width: 130px;">Fecha programada:</strong>
                    <span>${mantenimiento.fechaProgramada}</span>
                  </div>
                  ${mantenimiento.fechaCompletado ? `
                  <div style="margin-top: 10px;">
                    <strong style="display: inline-block; width: 130px;">Fecha completado:</strong>
                    <span>${mantenimiento.fechaCompletado}</span>
                  </div>` : ''}
                </div>
              </div>
            </div>
          </div>
          
            <!-- Descripción con línea separadora superior -->
            <div style="margin-bottom: 25px; border-top: 1px solid #ddd; padding-top: 15px;">
              <h2 style="font-size: 18px; margin: 0 0 10px 0; color: #000; font-weight: bold;">Descripción</h2>
              <div style="font-size: 14px; min-height: 60px; padding: 0 10px; color: #000;">${mantenimiento.descripcion}</div>
            </div>
          
            <!-- Observaciones - con espacio considerable sin cuadro -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 18px; margin: 0 0 10px 0; color: #000; font-weight: bold;">Observaciones Técnicas</h2>
              <div style="font-size: 14px; min-height: 100px; padding: 0 10px; color: #000;">${mantenimiento.observaciones || 'Sin observaciones'}</div>
            </div>
          
            <!-- Texto de conformidad mejorado -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 18px; margin: 0 0 10px 0; color: #000; font-weight: bold;">Certificación de Conformidad</h2>
              <p style="font-size: 14px; line-height: 1.5; margin: 0; color: #000; text-align: justify; padding: 0 15px;">
                Por medio del presente documento, se certifica que el servicio de mantenimiento ${mantenimiento.tipo.toLowerCase()} identificado con el código ${mantenimiento.id.padStart(4, '0')} ha sido ejecutado satisfactoriamente en la fecha ${mantenimiento.fechaCompletado || 'no especificada'}, cumpliendo con todos los protocolos técnicos establecidos y dentro del cronograma previsto. Este documento tiene validez como constancia de la realización y aprobación del servicio.
              </p>
            </div>
          </div>
          
          <!-- Espaciador que empuja las firmas hacia abajo -->
          <div style="flex: 1 0 auto;"></div>
          
          <!-- Sección de firmas y pie de página - posición fija en la parte inferior -->
          <div style="flex: 0 0 auto; margin-top: auto;">
            <!-- Firmas -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <div style="width: 45%; text-align: center;">
                <div style="min-height: 60px; margin-bottom: 5px;">
                  ${firmaTecnicoUrl ? 
                    `<img src="${firmaTecnicoUrl}" style="max-width: 80%; max-height: 60px; display: block; margin: 0 auto;">` : 
                    `<p style="font-style: italic; color: #000; font-size: 12px; margin-top: 20px;">Sin firma</p>`
                  }
                </div>
                <div style="border-top: 1px solid #000; padding-top: 5px;">
                  <p style="margin: 0; font-size: 13px; color: #000;">${mantenimiento.tecnico}</p>
                  <p style="margin: 2px 0 0; font-size: 11px; color: #000;">Técnico</p>
                </div>
              </div>
              
              <div style="width: 45%; text-align: center;">
                <div style="min-height: 60px; margin-bottom: 5px;">
                  ${firmaValida ? 
                    `<img src="${firmaUrl}" style="max-width: 80%; max-height: 60px; display: block; margin: 0 auto;">` : 
                    `<p style="font-style: italic; color: #000; font-size: 12px; margin-top: 20px;">Sin firma</p>`
                  }
                </div>
                <div style="border-top: 1px solid #000; padding-top: 5px;">
                  <p style="margin: 0; font-size: 13px; color: #000;">${mantenimiento.nombreFirmante || mantenimiento.responsable || 'No especificado'}</p>
                  <p style="margin: 2px 0 0; font-size: 11px; color: #000;">Responsable del Área</p>
                </div>
              </div>
            </div>
            
            <!-- Pie de página -->
            <div style="text-align: center; font-size: 11px; color: #000; border-top: 1px solid #ddd; padding-top: 8px;">
              <p style="margin: 0;">ErmitaAPP - Sistema de Gestión de Mantenimiento</p>
              <p style="margin: 3px 0 0;">Documento generado el ${fechaActual}</p>
            </div>
          </div>
        </div>
      `;
      
      // Añadir el elemento al documento
      document.body.appendChild(reporteContainer);
      
      // Convertir el HTML a un canvas
      const canvas = await html2canvas(reporteContainer, {
        scale: 2, // Mayor calidad
        useCORS: true, // Permitir imágenes de otros dominios
        logging: false,
        allowTaint: true,
      });
      
      // Eliminar el elemento temporal
      document.body.removeChild(reporteContainer);
      
      // Crear el PDF - siempre una sola página
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, 297); // Limitar a altura A4
      
      // Añadir imagen centrada en la primera y única página
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Guardar el PDF
      pdf.save(`Informe_Mantenimiento_${mantenimiento.equipo.replace(/\s+/g, '_')}_${id}.pdf`);
      
    } catch (error) {
      console.error('Error al generar el informe:', error);
      alert('Error al generar el informe. Por favor, intente nuevamente.');
    }
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
  const tiposUnicos = Array.from(new Set(mantenimientosData.map(item => item.tipo)));
  
  // Calcular paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMantenimientos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMantenimientos.length / itemsPerPage);
  
  // Función para cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Generar array de páginas para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar un subconjunto de páginas con la actual en el centro
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header y Búsqueda */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-light tracking-tight text-gray-900">
          Historial de <span className="font-medium">Mantenimientos</span>
        </h1>
        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Buscar por equipo, técnico, tipo, fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-white/50 backdrop-blur-sm border-0 rounded-full 
                       text-sm text-gray-600 placeholder-gray-400
                       ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500
                       transition-shadow duration-200"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Mantenimiento</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los tipos</option>
              {tiposUnicos.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={filterDateRange.start}
              onChange={(e) => setFilterDateRange({...filterDateRange, start: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={filterDateRange.end}
              onChange={(e) => setFilterDateRange({...filterDateRange, end: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="w-full md:w-1/4 flex gap-2">
            <button
              onClick={() => {
                setFilterType('');
                setFilterDateRange({start: '', end: ''});
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              Limpiar filtros
            </button>
            
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="10">10 por página</option>
              <option value="20">20 por página</option>
              <option value="50">50 por página</option>
              <option value="100">100 por página</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Lista de Mantenimientos */}
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Cargando historial de mantenimientos...</div>
      ) : filteredMantenimientos.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl shadow-sm text-gray-500">No se encontraron mantenimientos que coincidan con los criterios de búsqueda</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tabla de mantenimientos */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Equipo</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Técnico</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      #{item.id.padStart(3, '0')}
                    </td>
                    <td className="px-4 py-3">{item.equipo}</td>
                    <td className="px-4 py-3">{item.tipo}</td>
                    <td className="px-4 py-3">{item.tecnico}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {item.fechaCompletado || 'No disponible'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        Completado
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
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
        </div>
      )}

      {/* Paginación */}
      {filteredMantenimientos.length > 0 && (
        <div className="mt-4 py-4 px-6 bg-white rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">
              {Math.min(indexOfLastItem, filteredMantenimientos.length)}
            </span> de <span className="font-medium">{filteredMantenimientos.length}</span> registros
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm rounded-md ${currentPage === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Anterior
            </button>
            
            <div className="flex items-center gap-1">
              {getPageNumbers().map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 text-sm rounded-md ${currentPage === number 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {number}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 text-sm rounded-md ${currentPage === totalPages || totalPages === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {showDetallesModal && selectedMantenimiento && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Detalles de Mantenimiento</h2>
              <button
                onClick={() => setShowDetallesModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">ID</p>
                  <p className="text-sm text-gray-900">#{selectedMantenimiento.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Estado</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {selectedMantenimiento.estado}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Equipo</p>
                  <p className="text-sm text-gray-900">{selectedMantenimiento.equipo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Fecha Completado</p>
                  <p className="text-sm text-gray-900">{selectedMantenimiento.fechaCompletado || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Tipo</p>
                  <p className="text-sm text-gray-900">{selectedMantenimiento.tipo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Técnico</p>
                  <p className="text-sm text-gray-900">{selectedMantenimiento.tecnico}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Área</p>
                  <p className="text-sm text-gray-900">{selectedMantenimiento.area || 'No especificada'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Responsable</p>
                  <p className="text-sm text-gray-900">{selectedMantenimiento.responsable || 'No asignado'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Descripción</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {selectedMantenimiento.descripcion || (selectedMantenimiento.isAutoScheduled ? "Mantenimiento preventivo programado automáticamente" : "Sin descripción")}
                  </p>
                </div>
              </div>

              {selectedMantenimiento.observaciones && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Observaciones</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedMantenimiento.observaciones}</p>
                  </div>
                </div>
              )}
              
              {/* Sección de firmas */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Firmas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Firma del técnico */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 mb-1">Técnico</h4>
                    <div className="border border-gray-200 rounded-lg p-2 flex items-center justify-center bg-gray-50 h-32">
                      {technicianSignature ? (
                        <>
                          <img 
                            src={technicianSignature} 
                            alt="Firma del técnico" 
                            className="max-h-28 max-w-full object-contain"
                            onError={(e) => {
                              console.log('[DEBUG] Error al cargar la firma del técnico');
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '';
                              e.currentTarget.alt = 'Error al cargar la firma';
                            }}
                          />
                          {/* Log oculto para depuración */}
                          <div style={{ display: 'none' }}>
                            {/* DEBUG: Renderizando firma del técnico desde servicio de usuarios */}
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-400 text-sm">Sin firma</span>
                          {/* Log oculto para depuración */}
                          <div style={{ display: 'none' }}>
                            {/* DEBUG: No hay firma del técnico disponible */}
                          </div>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Firmado por: {selectedMantenimiento.nombreTecnico || selectedMantenimiento.tecnico || 'No especificado'}
                    </p>
                  </div>
                  
                  {/* Firma del responsable */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 mb-1">Responsable</h4>
                    <div className="border border-gray-200 rounded-lg p-2 flex items-center justify-center bg-gray-50 h-32">
                      {selectedMantenimiento.firma ? (
                        <img 
                          src={selectedMantenimiento.firma.startsWith('data:') ? 
                            selectedMantenimiento.firma : 
                            `data:image/png;base64,${selectedMantenimiento.firma}`} 
                          alt="Firma del responsable" 
                          className="max-h-28 max-w-full object-contain"
                          onError={(e) => {
                            console.log('[DEBUG] Error al cargar la firma del responsable');
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '';
                            e.currentTarget.alt = 'Error al cargar la firma';
                          }}
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">Sin firma</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Firmado por: {selectedMantenimiento.nombreFirmante || 'No especificado'}
                    </p>
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
  );
}
