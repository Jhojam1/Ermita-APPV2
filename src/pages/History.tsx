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
  const [technicianSignature, setTechnicianSignature] = useState<string | null>(null);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtros adicionales
  const [filterType, setFilterType] = useState<string>('');
  const [filterDateRange, setFilterDateRange] = useState<{start: string, end: string}>({start: '', end: ''});

  const normalizeSignatureDataUrl = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;

    let s = value.trim();
    if (!s) return null;

    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      s = s.slice(1, -1).trim();
    }

    s = s.replace(
      /^data:image\/(png|jpeg|jpg);base64,\s*["']?data:image\/(png|jpeg|jpg);base64,/i,
      ''
    );

    const lastDataIdx = s.toLowerCase().lastIndexOf('data:image/');
    if (lastDataIdx > 0) {
      s = s.slice(lastDataIdx);
    }

    if (s.toLowerCase().startsWith('data:image/')) {
      s = s.replace(/\s+/g, '');
      s = s.replace(/"/g, '');
      return s;
    }

    s = s.replace(/\s+/g, '');
    s = s.replace(/"/g, '');
    return `data:image/png;base64,${s}`;
  };

  const getImageFormatForJsPdf = (dataUrl: string): 'PNG' | 'JPEG' => {
    const lower = dataUrl.toLowerCase();
    if (lower.startsWith('data:image/jpeg') || lower.startsWith('data:image/jpg')) return 'JPEG';
    const commaIdx = dataUrl.indexOf(',');
    const b64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
    if (b64.startsWith('/9j/')) return 'JPEG';
    return 'PNG';
  };

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
    if (!technicianId) {
      console.log('[DEBUG] No hay ID de técnico disponible en el mantenimiento');
      setTechnicianSignature(null);
      return;
    }

    try {
      console.log(`[DEBUG] Obteniendo firma del técnico con ID ${technicianId}`);
      const signature = await userService.getUserSignature(technicianId);
      console.log(`[DEBUG] Firma del técnico obtenida:`, signature ? `Sí (longitud: ${signature.length})` : 'No');
      setTechnicianSignature(normalizeSignatureDataUrl(signature));
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

      // Preparar firma del responsable
      let firmaUrl = normalizeSignatureDataUrl(mantenimiento.firma);

      // Verificar si hay firma del técnico
      let firmaTecnicoUrl: string | null = null;

      // Obtener la firma del técnico desde el servicio de usuarios si hay un ID de técnico
      if (mantenimiento.technicianId) {
        try {
          console.log(`[DEBUG] Obteniendo firma del técnico con ID ${mantenimiento.technicianId} para el reporte`);
          const technicianSignature = await userService.getUserSignature(mantenimiento.technicianId);
          if (technicianSignature) {
            firmaTecnicoUrl = normalizeSignatureDataUrl(technicianSignature);
            console.log('[DEBUG] Firma del técnico obtenida para el reporte, longitud:', technicianSignature.length);
          } else {
            console.log('[DEBUG] No se pudo obtener la firma del técnico para el reporte');
          }
        } catch (error) {
          console.error('[DEBUG] Error al obtener la firma del técnico para el reporte:', error);
        }
      } else if (mantenimiento.firmaTecnico) {
        // Usar la firma del técnico del mantenimiento si existe
        firmaTecnicoUrl = normalizeSignatureDataUrl(mantenimiento.firmaTecnico);
        console.log('[DEBUG] Usando firma del técnico del objeto mantenimiento');
      } else {
        console.log('[DEBUG] No hay firma de técnico disponible');
      }

      console.log('[DEBUG] Firma del responsable:', firmaUrl ? 'Disponible' : 'No disponible');
      console.log('[DEBUG] Firma del técnico:', firmaTecnicoUrl ? 'Disponible' : 'No disponible');

      // Variables de fecha removidas (no se usan actualmente)

      
      // Cargar el logo antes de crear el PDF
      let logoImg: HTMLImageElement | null = null;
      let logoLoaded = false;
      
      try {
        logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        
        logoLoaded = await new Promise<boolean>((resolve) => {
          const timeoutId = setTimeout(() => {
            console.warn('Timeout al cargar logo');
            resolve(false);
          }, 5000);

          logoImg!.onload = () => {
            clearTimeout(timeoutId);
            console.log('Logo cargado exitosamente');
            resolve(true);
          };
          logoImg!.onerror = (error) => {
            clearTimeout(timeoutId);
            console.error('Error al cargar logo:', error);
            resolve(false);
          };
          // Intentar diferentes rutas
          logoImg!.src = `${window.location.origin}/Simax/Logo_Ermita.png`;
        });
      } catch (error) {
        console.error('Excepción al cargar logo:', error);
        logoLoaded = false;
      }
      
      // Crear el PDF con texto seleccionable
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 15;

      // ===== CUADRO EXTERIOR QUE ENVUELVE TODO EL DOCUMENTO =====
      // Variables para el cuadro exterior
      const marginTop = 8;
      // marginBottom removido (no se usa)
      const marginLeft = 15;
      const marginRight = 15;
      const pageWidth = 210; // Ancho de A4 en mm
      // pageHeight removido (no se usa)
      const boxWidth = pageWidth - marginLeft - marginRight;

      // Dibujar el cuadro exterior (se ajustará dinámicamente al final)
      // Lo dibujaremos al final después de conocer la altura total del contenido

      // ===== HEADER CON TABLA =====
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);

      // Líneas divisorias del header (sin el rectángulo exterior del header)
      pdf.line(70, 10, 70, 35); // Línea vertical izquierda
      pdf.line(140, 10, 140, 35); // Línea vertical derecha
      pdf.line(15, 35, 195, 35); // Línea horizontal inferior del header
      
      // Logo
      if (logoLoaded && logoImg) {
        try {
          pdf.addImage(logoImg, 'PNG', 18, 13, 48, 18);
          console.log('Logo agregado al PDF exitosamente');
        } catch (error) {
          console.error('Error al agregar logo al PDF:', error);
        }
      } else {
        console.warn('Logo no disponible, se omitirá en el PDF');
      }
      
      // Título central
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('INFORME DE MANTENIMIENTO', 105, 18, { align: 'center' });
      pdf.line(70, 22, 140, 22); // Línea horizontal debajo del título (solo en la columna central)
      pdf.setFontSize(10);
      pdf.text('SISTEMAS', 105, 30, { align: 'center' });
      
      // Código y versión (columna derecha)
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`CODIGO: R-INF-${mantenimiento.id}`, 167, 14, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.text('Versión: 01', 167, 18, { align: 'center' });
      const fechaVigencia = new Date();
      pdf.text(`Vigente desde: ${fechaVigencia.getFullYear()}.xx.xx`, 167, 22, { align: 'center' });
      pdf.text(`Vigente hasta: ${fechaVigencia.getFullYear() + 3}.xx.xx`, 167, 26, { align: 'center' });
      
      yPosition = 45;

      // ===== TABLA PRINCIPAL DE DATOS (TODO EN UNA SOLA TABLA) =====
      const tableStartY = yPosition;
      const rowHeight = 7;

      // Dibujar el rectángulo exterior de toda la tabla (3 filas en izquierda x 7mm)
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(15, tableStartY, 180, rowHeight * 3);

      // Línea vertical central que divide en dos columnas principales
      pdf.line(105, tableStartY, 105, tableStartY + (rowHeight * 3));

      // ===== COLUMNA IZQUIERDA (3 filas) =====
      let leftY = tableStartY;

      // Fila 1: EQUIPO (celda azul) | valor
      pdf.line(15, leftY + rowHeight, 105, leftY + rowHeight);
      pdf.line(60, leftY, 60, leftY + rowHeight);
      pdf.setFillColor(0, 51, 102);
      pdf.rect(15, leftY, 45, rowHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('EQUIPO', 37.5, leftY + 4.5, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(mantenimiento.equipo || 'N/A', 65, leftY + 4.5);
      leftY += rowHeight;

      // Fila 2: TIPO (celda azul) | valor
      pdf.line(15, leftY + rowHeight, 105, leftY + rowHeight);
      pdf.line(60, leftY, 60, leftY + rowHeight);
      pdf.setFillColor(0, 51, 102);
      pdf.rect(15, leftY, 45, rowHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TIPO', 37.5, leftY + 4.5, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.text(mantenimiento.tipo || 'N/A', 65, leftY + 4.5);
      leftY += rowHeight;

      // Fila 3: ESTADO (celda azul) | valor
      pdf.line(60, leftY, 60, leftY + rowHeight);
      pdf.setFillColor(0, 51, 102);
      pdf.rect(15, leftY, 45, rowHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ESTADO', 37.5, leftY + 4.5, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.text(mantenimiento.estado || 'N/A', 65, leftY + 4.5);

      // ===== COLUMNA DERECHA (4 filas - más pequeñas proporcionalmente) =====
      let rightY = tableStartY;
      const rightRowHeight = (rowHeight * 3) / 4; // Dividir la altura total en 4 partes iguales

      // Fila 1: TECNICO (celda azul) | valor
      pdf.line(105, rightY + rightRowHeight, 195, rightY + rightRowHeight);
      pdf.line(160, rightY, 160, rightY + rightRowHeight);
      pdf.setFillColor(0, 51, 102);
      pdf.rect(105, rightY, 55, rightRowHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('TECNICO', 132.5, rightY + (rightRowHeight / 2) + 1, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(mantenimiento.tecnico || 'Sin asignar', 165, rightY + (rightRowHeight / 2) + 1);
      rightY += rightRowHeight;

      // Fila 2: ÁREA (celda azul) | valor
      pdf.line(105, rightY + rightRowHeight, 195, rightY + rightRowHeight);
      pdf.line(160, rightY, 160, rightY + rightRowHeight);
      pdf.setFillColor(0, 51, 102);
      pdf.rect(105, rightY, 55, rightRowHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AREA', 132.5, rightY + (rightRowHeight / 2) + 1, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.text(mantenimiento.area || 'No especificada', 165, rightY + (rightRowHeight / 2) + 1);
      rightY += rightRowHeight;

      // Fila 3: FECHA PROGRAMADA (celda azul) | valor
      pdf.line(105, rightY + rightRowHeight, 195, rightY + rightRowHeight);
      pdf.line(160, rightY, 160, rightY + rightRowHeight);
      pdf.setFillColor(0, 51, 102);
      pdf.rect(105, rightY, 55, rightRowHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text('FECHA PROGRAMADA', 132.5, rightY + (rightRowHeight / 2) + 1, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(mantenimiento.fechaProgramada || 'N/A', 165, rightY + (rightRowHeight / 2) + 1);
      rightY += rightRowHeight;

      // Fila 4: FECHA COMPLETADO (celda azul) | valor
      pdf.line(160, rightY, 160, rightY + rightRowHeight);
      pdf.setFillColor(0, 51, 102);
      pdf.rect(105, rightY, 55, rightRowHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text('FECHA COMPLETADO', 132.5, rightY + (rightRowHeight / 2) + 1, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(mantenimiento.fechaCompletado || 'N/A', 165, rightY + (rightRowHeight / 2) + 1);

      yPosition = tableStartY + (rowHeight * 3) + 5;

      // ===== SECCIÓN DESCRIPCIÓN =====
      pdf.setFillColor(0, 51, 102);
      pdf.rect(15, yPosition, 180, 7, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('DESCRIPCION', 105, yPosition + 4.5, { align: 'center' });
      yPosition += 7;

      // Contenido de la descripción con título "Descripción"
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);

      // Preparar texto de descripción con justificación
      const descripcionTexto = mantenimiento.descripcion || 'Mantenimiento preventivo programado automáticamente. Se efectuó limpieza física interna del equipo, retirando el polvo acumulado en componentes como ventiladores, disipadores y módulos de memoria RAM. Se aplicó nueva pasta térmica al procesador para mejorar la disipación de calor. Además, se eliminaron archivos temporales del sistema, se revisaron procesos en segundo plano y se realizó una optimización general del sistema para asegurar un funcionamiento eficiente y estable.';

      // Calcular altura necesaria
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const descripcionSoloTexto = pdf.splitTextToSize(descripcionTexto, 170);
      const descripcionHeight = Math.max(descripcionSoloTexto.length * 5 + 15, 35);

      pdf.rect(15, yPosition, 180, descripcionHeight);

      // Escribir "Descripción" en negrita
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Descripción', 20, yPosition + 6);

      // Escribir el texto de la descripción en normal con justificación
      pdf.setFont('helvetica', 'normal');
      // Renderizar texto justificado manualmente
      let currentY = yPosition + 11;
      for (let i = 0; i < descripcionSoloTexto.length; i++) {
        pdf.text(descripcionSoloTexto[i], 20, currentY, { align: 'justify', maxWidth: 170 });
        currentY += 5;
      }

      yPosition += descripcionHeight + 5;
      
      // ===== SECCIÓN OBSERVACIONES TÉCNICAS =====
      pdf.setFillColor(0, 51, 102);
      pdf.rect(15, yPosition, 180, 7, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('OBSERVACIONES TECNICAS', 105, yPosition + 4.5, { align: 'center' });
      yPosition += 7;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const observaciones = mantenimiento.observaciones || '';
      const observacionesLines = observaciones ? pdf.splitTextToSize(observaciones, 170) : [];
      const observacionesHeight = Math.max(observacionesLines.length * 5 + 10, 25);
      pdf.rect(15, yPosition, 180, observacionesHeight);
      if (observacionesLines.length > 0) {
        pdf.text(observacionesLines, 20, yPosition + 6);
      }
      yPosition += observacionesHeight + 5;
      
      // ===== CERTIFICADO DE CONFORMIDAD =====
      pdf.setFillColor(0, 51, 102);
      pdf.rect(15, yPosition, 180, 7, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('CERTIFICADO DE CONFORMIDAD', 105, yPosition + 4.5, { align: 'center' });
      yPosition += 7;

      // Obtener partes de la fecha para el certificado
      const fechaCompletado = mantenimiento.fechaCompletado ? new Date(mantenimiento.fechaCompletado.split('/').reverse().join('-')) : new Date();
      const dia = fechaCompletado.getDate();
      const mes = fechaCompletado.toLocaleDateString('es-ES', { month: 'long' });
      const anio = fechaCompletado.getFullYear();

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const certificacionText = `Mediante el presente documento se certifica que el mantenimiento preventivo identificado con el código ${mantenimiento.id} fue ejecutado de manera satisfactoria el día ${dia} del mes ${mes} del año ${anio}. La intervención se realizó conforme a los procedimientos técnicos establecidos por el área de Sistemas, cumpliendo con los estándares de calidad, seguridad y las buenas prácticas definidas en el plan de trabajo. Este informe constituye evidencia formal de la correcta ejecución del servicio, dentro del plazo previsto y con resultados plenamente alineados con los objetivos del mantenimiento programado.`;
      const certificacionLines = pdf.splitTextToSize(certificacionText, 170);
      const certificacionHeight = Math.max(certificacionLines.length * 5 + 10, 35);
      pdf.rect(15, yPosition, 180, certificacionHeight);
      pdf.text(certificacionLines, 20, yPosition + 6);
      yPosition += certificacionHeight + 5;

      // Calcular posición de las firmas - deben estar dentro de la misma página
      const espacioRestante = 297 - yPosition - 15; // 297mm es la altura de A4, dejando 15mm para margen inferior
      const espacioParaFirmas = 35; // Espacio necesario para las firmas

      if (espacioRestante < espacioParaFirmas) {
        // Si no hay suficiente espacio, agregar una nueva página
        pdf.addPage();
        yPosition = 20;
      }

      // Espacio adicional antes de las firmas
      yPosition += 10;

      // Agregar firmas como imágenes si existen (centradas arriba de las líneas)
      const firmasY = yPosition + 20;

      if (firmaTecnicoUrl) {
        try {
          const fmt = getImageFormatForJsPdf(firmaTecnicoUrl);
          pdf.addImage(firmaTecnicoUrl, fmt, 30, yPosition, 40, 15);
        } catch (e) {
          console.log('Error al agregar firma del técnico:', e);
        }
      }

      if (firmaUrl) {
        try {
          const fmt = getImageFormatForJsPdf(firmaUrl);
          pdf.addImage(firmaUrl, fmt, 130, yPosition, 40, 15);
        } catch (e) {
          console.log('Error al agregar firma del responsable:', e);
        }
      }

      // Líneas para firmas
      pdf.setLineWidth(0.3);
      pdf.line(25, firmasY, 75, firmasY);
      pdf.line(125, firmasY, 175, firmasY);

      // Etiquetas bajo las líneas
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('Firma Tecnico', 50, firmasY + 4, { align: 'center' });
      pdf.text('Responsable del área', 150, firmasY + 4, { align: 'center' });
      
      // Nombres bajo las etiquetas
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text(mantenimiento.tecnico || 'Sin asignar', 50, firmasY + 8, { align: 'center' });
      pdf.text(mantenimiento.responsable || 'No asignado', 150, firmasY + 8, { align: 'center' });

      // ===== DIBUJAR EL CUADRO EXTERIOR QUE ENVUELVE TODO =====
      // Calcular la altura final del contenido (ajustado para incluir los nombres)
      const finalContentHeight = firmasY + 12;

      // Dibujar el cuadro exterior
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(marginLeft, marginTop, boxWidth, finalContentHeight - marginTop + 5);

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
                      {normalizeSignatureDataUrl(technicianSignature) ? (
                        <>
                          <img 
                            src={normalizeSignatureDataUrl(technicianSignature) as string} 
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
                      {normalizeSignatureDataUrl(selectedMantenimiento.firma) ? (
                        <img 
                          src={normalizeSignatureDataUrl(selectedMantenimiento.firma) as string} 
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