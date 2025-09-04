import { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import maintenanceService, { MaintenanceItem, MaintenanceItemUI } from '../services/maintenanceService';

const mantenimientosData = [
  {
    id: '0001',
    equipo: 'Computadora 1',
    estado: 'Pendiente',
    fechaProgramada: '2024-04-11',
    tecnico: 'Juan Pérez',
    tipo: 'Preventivo',
    prioridad: 'Alta',
    descripcion: 'Mantenimiento preventivo programado incluyendo limpieza de hardware y actualización de software.',
    area: 'Informática',
    responsable: 'Carlos Gómez'
  },
  {
    id: '0002',
    equipo: 'Impresora 2',
    estado: 'En Proceso',
    fechaProgramada: '2024-04-12',
    tecnico: 'María López',
    tipo: 'Correctivo',
    prioridad: 'Media',
    descripcion: 'Reparación de sistema de alimentación de papel',
    area: 'Impresión',
    responsable: 'Ana Rodríguez'
  },
  {
    id: '0003',
    equipo: 'Servidor 1',
    estado: 'Pendiente',
    fechaProgramada: '2024-04-13',
    tecnico: 'Carlos Ruiz',
    tipo: 'Preventivo',
    prioridad: 'Alta',
    descripcion: 'Actualización de sistema operativo y respaldo de datos',
    area: 'Servidores',
    responsable: 'Pedro García'
  }
];

export default function Maintenance() {
  const [mantenimientosData, setMantenimientosData] = useState<MaintenanceItemUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<MaintenanceItemUI | null>(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showActualizarEstado, setShowActualizarEstado] = useState(false);
  const [formData, setFormData] = useState({
    tecnico: '',
    tipoMantenimiento: '',
    observaciones: '',
    estado: 'completado',
    nombreFirmante: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  
  // Referencias para los canvas de firma
  const sigCanvas = useRef<SignatureCanvas>(null);
  const fullScreenSigCanvas = useRef<SignatureCanvas>(null);
  
  // Estado para controlar el modal de firma a pantalla completa
  const [showFullScreenSignature, setShowFullScreenSignature] = useState(false);
  
  // Función para limpiar la firma
  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    if (fullScreenSigCanvas.current) {
      fullScreenSigCanvas.current.clear();
    }
  };
  
  // Función para obtener la firma como imagen base64
  const getSignatureImage = () => {
    // Si estamos usando la firma en pantalla completa, usamos esa
    if (showFullScreenSignature && fullScreenSigCanvas.current) {
      return fullScreenSigCanvas.current.isEmpty() ? null : fullScreenSigCanvas.current.toDataURL('image/png');
    }
    // De lo contrario, usamos la firma normal
    else if (sigCanvas.current) {
      return sigCanvas.current.isEmpty() ? null : sigCanvas.current.toDataURL('image/png');
    }
    return null;
  };
  
  // Función para sincronizar las firmas entre los dos canvas
  const syncSignatureFromFullScreen = () => {
    if (fullScreenSigCanvas.current && sigCanvas.current) {
      const fullScreenSignature = fullScreenSigCanvas.current.toDataURL('image/png');
      
      // Limpiar el canvas normal
      sigCanvas.current.clear();
      
      // Si hay una firma, cargarla en el canvas normal
      if (!fullScreenSigCanvas.current.isEmpty()) {
        // Crear una imagen temporal para cargar la firma
        const img = new Image();
        img.onload = () => {
          const ctx = sigCanvas.current?.getCanvas().getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, sigCanvas.current.getCanvas().width, sigCanvas.current.getCanvas().height);
          }
        };
        img.src = fullScreenSignature;
      }
    }
    setShowFullScreenSignature(false);
  };
  
  // Función para abrir el modal de firma a pantalla completa
  const openFullScreenSignature = () => {
    setShowFullScreenSignature(true);
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const fetchMaintenances = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Obtener datos del usuario actual
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = currentUser.role?.name || currentUser.roleName || currentUser.role || '';
      const userId = currentUser.id;
      
      let data;
      
      // Si es técnico, usar el endpoint específico para técnicos con su ID
      if (userRole === 'Técnico' || userRole === 'Tecnico') {
        data = await maintenanceService.getMaintenancesByTechnicianId(userId);
      } else {
        // Para otros roles (Administrador, Supervisor), mostrar todos
        data = await maintenanceService.getAllMaintenances();
      }
      
      // Filtrar solo los mantenimientos pendientes y en proceso
      const filteredData = data.filter(item => 
        item.status === 'PROGRAMADO' || item.status === 'EN_PROCESO'
      );
      
      const mappedData = filteredData.map(item => maintenanceService.mapToUI(item));
      setMantenimientosData(mappedData);
      
    } catch (err) {
      console.error('Error al cargar mantenimientos:', err);
      setError('Error al cargar los datos de mantenimientos. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMantenimiento) return;

    try {
      setIsLoading(true);
      
      // Obtener usuario actual para obtener datos del técnico
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Mapear el estado seleccionado al formato del backend
      const estadoBackend = formData.estado === 'completado' ? 'COMPLETADO' : 
                           formData.estado === 'en_proceso' ? 'EN_PROCESO' : 
                           formData.estado === 'cancelado' ? 'CANCELADO'
                             : 'PROGRAMADO';
      
      // Validar si el estado es completado
      if (formData.estado === 'completado') {
        const signatureImage = getSignatureImage();
        console.log('[DEBUG] Firma capturada:', signatureImage ? 'Sí (longitud: ' + signatureImage.length + ')' : 'No');
        
        if (!signatureImage) {
          alert('Por favor, firme el documento para confirmar la finalización del mantenimiento.');
          setIsLoading(false);
          return;
        }
        
        // Validar el nombre del firmante
        console.log('[DEBUG] Nombre del firmante:', formData.nombreFirmante);
        if (!formData.nombreFirmante.trim()) {
          alert('Por favor, ingrese el nombre del firmante.');
          setIsLoading(false);
          return;
        }
      }
      
      // Preparar datos para actualización - incluir todos los datos necesarios
      const updateData: MaintenanceItem = {
        // Mantener los datos originales del mantenimiento
        id: parseInt(selectedMantenimiento.id),
        inventoryItemId: selectedMantenimiento.inventoryItemId,
        inventoryItemName: selectedMantenimiento.equipo,
        // Usar valores fijos para companyId y headquarterId (estos deben coincidir con los valores en la base de datos)
        companyId: 1,  // Valor fijo que sabemos que existe en la base de datos
        headquarterId: 1, // Valor fijo que sabemos que existe en la base de datos
        serviceArea: selectedMantenimiento.area,
        responsible: selectedMantenimiento.responsable,
        description: selectedMantenimiento.descripcion,
        scheduledDate: maintenanceService.parseDate(selectedMantenimiento.fechaProgramada),
        type: maintenanceService.mapTypeToBackend(selectedMantenimiento.tipo), // ¡CAMPO FALTANTE!
        status: estadoBackend,
        observations: formData.observaciones,
        technicianName: formData.tecnico,
      };
      
      // Si el estado es completado, agregar la fecha de finalización y la firma
      if (formData.estado === 'completado') {
        updateData.completionDate = new Date().toISOString();
        console.log('[DEBUG] Fecha de finalización:', updateData.completionDate);
        
        // Guardar la firma del responsable
        const firmaResponsable = getSignatureImage();
        updateData.signature = firmaResponsable;
        updateData.signerName = formData.nombreFirmante;
        console.log('[DEBUG] Firma del responsable asignada:', firmaResponsable ? 'Sí (longitud: ' + firmaResponsable.length + ')' : 'No');
        
        // Guardar la firma del técnico también (la misma firma se usa para ambos)
        // En un caso real, se podrían capturar firmas separadas para técnico y responsable
        const firmaTecnico = getSignatureImage();
        updateData.technicianSignature = firmaTecnico;
        console.log('[DEBUG] Firma del técnico asignada:', firmaTecnico ? 'Sí (longitud: ' + firmaTecnico.length + ')' : 'No');
      }
      
      // Enviar la actualización al backend
      console.log('[DEBUG] Enviando datos al backend:', JSON.stringify({
        id: parseInt(selectedMantenimiento.id),
        estado: updateData.status,
        tieneFirmaResponsable: !!updateData.signature,
        tieneFirmaTecnico: !!updateData.technicianSignature,
        nombreFirmante: updateData.signerName,
        nombreTecnico: updateData.technicianName
      }));
      
      try {
        const respuesta = await maintenanceService.updateMaintenance(
          parseInt(selectedMantenimiento.id), 
          updateData
        );
        console.log('[DEBUG] Respuesta del backend:', respuesta);
      } catch (error) {
        console.error('[DEBUG] Error al actualizar mantenimiento:', error);
        throw error;
      }
      
      // Actualizar la lista de mantenimientos
      await fetchMaintenances();
      
      // Cerrar el modal y limpiar la selección
      setShowActualizarEstado(false);
      setSelectedMantenimiento(null);
      
      // Reiniciar el formulario
      setFormData({
        tecnico: '',
        tipoMantenimiento: '',
        observaciones: '',
        estado: 'completado',
        nombreFirmante: ''
      });
      
      // Limpiar la firma
      clearSignature();
      
    } catch (error) {
      console.error('Error al actualizar el mantenimiento:', error);
      alert('Ocurrió un error al actualizar el mantenimiento. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar mantenimientos según búsqueda y filtros
  const filteredMantenimientos = mantenimientosData.filter(item => {
    // Filtro por término de búsqueda
    const matchesSearch = searchTerm === '' || 
      item.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tecnico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por estado - Mapear los valores del filtro a los valores que se muestran en la UI
    const matchesStatus = filterStatus === '' || 
      (filterStatus === 'programado' && item.estado === 'Pendiente') ||
      (filterStatus === 'en proceso' && item.estado === 'En Proceso');
    
    // Filtro por tipo
    const matchesType = filterType === '' || 
      item.tipo.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header y Búsqueda */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-light tracking-tight text-gray-900">
          Gestión de <span className="font-medium">Mantenimientos</span>
        </h1>
        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Buscar mantenimiento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-white/50 backdrop-blur-sm border-0 rounded-full 
                        text-sm text-gray-600 placeholder-gray-400
                        ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500
                        transition-shadow duration-200"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
          </button>
          {/* Se ha eliminado el botón de "Nuevo Mantenimiento" */}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filtros Flotantes */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100
                      grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                         focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los estados</option>
            <option value="programado">Programado</option>
            <option value="en proceso">En Proceso</option>
          </select>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                         focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los tipos</option>
            <option value="preventivo">Preventivo</option>
            <option value="correctivo">Correctivo</option>
          </select>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              className="flex-1 px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                       focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Tabla de Mantenimientos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando mantenimientos...</div>
        ) : filteredMantenimientos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron mantenimientos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Programada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Técnico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMantenimientos.map((mantenimiento) => (
                  <tr key={mantenimiento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mantenimiento.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {mantenimiento.equipo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                      ${mantenimiento.estado === 'Completado' ? 'bg-green-100 text-green-800' : 
                                        mantenimiento.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
                                        mantenimiento.estado === 'Cancelado' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'}`}>
                        {mantenimiento.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mantenimiento.fechaProgramada}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mantenimiento.area}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mantenimiento.responsable}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mantenimiento.tecnico}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mantenimiento.tipo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMantenimiento(mantenimiento);
                          setShowDetalles(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => {
                          // Obtener usuario actual para auto-asignar el técnico
                          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                          
                          setSelectedMantenimiento(mantenimiento);
                          setFormData({
                            tecnico: currentUser.fullName || '', // Auto-asignar nombre del técnico logueado
                            tipoMantenimiento: mantenimiento.tipo.toLowerCase(),
                            observaciones: mantenimiento.observaciones || '',
                            estado: mantenimiento.estado.toLowerCase().replace(' ', '_')
                          });
                          setShowActualizarEstado(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Actualizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {showDetalles && selectedMantenimiento && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">Detalles del Mantenimiento</h3>
                <button onClick={() => setShowDetalles(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Información General</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">ID:</p>
                      <p className="font-medium">{selectedMantenimiento.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estado:</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                      ${selectedMantenimiento.estado === 'Completado' ? 'bg-green-100 text-green-800' : 
                                        selectedMantenimiento.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
                                        selectedMantenimiento.estado === 'Cancelado' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'}`}>
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
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Fechas</h4>
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
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Responsable</h4>
                  <p className="font-medium">{selectedMantenimiento.responsable}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Descripción</h4>
                  <p className="text-sm text-gray-700">{selectedMantenimiento.descripcion}</p>
                </div>
                
                {selectedMantenimiento.observaciones && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Observaciones</h4>
                    <p className="text-sm text-gray-700">{selectedMantenimiento.observaciones}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowDetalles(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Actualizar Estado */}
      {showActualizarEstado && selectedMantenimiento && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">Actualizar Estado</h3>
                <button 
                  onClick={() => {
                    setShowActualizarEstado(false);
                    setSelectedMantenimiento(null);
                  }} 
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="tecnico" className="block text-sm font-medium text-gray-700 mb-1">
                      Técnico
                    </label>
                    <input
                      type="text"
                      id="tecnico"
                      value={formData.tecnico}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 cursor-not-allowed"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">El técnico se asigna automáticamente al usuario actual</p>
                  </div>
                  
                  <div>
                    <label htmlFor="tipoMantenimiento" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Mantenimiento
                    </label>
                    <select
                      id="tipoMantenimiento"
                      value={formData.tipoMantenimiento}
                      onChange={(e) => setFormData({ ...formData, tipoMantenimiento: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900
                             focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="preventivo">Preventivo</option>
                      <option value="correctivo">Correctivo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900
                             focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="completado">Completado</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones
                    </label>
                    <textarea
                      id="observaciones"
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      placeholder="Ingrese observaciones sobre el cambio de estado..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900
                             focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                      required
                    />
                  </div>
                  
                  {/* Componente de firma digital - solo visible cuando el estado es "completado" */}
                  {formData.estado === 'completado' && (
                    <>
                      <div>
                        <label htmlFor="nombreFirmante" className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre de quien firma
                        </label>
                        <input
                          type="text"
                          id="nombreFirmante"
                          value={formData.nombreFirmante}
                          onChange={(e) => setFormData({ ...formData, nombreFirmante: e.target.value })}
                          placeholder="Ingrese el nombre completo de la persona que firma"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900
                                 focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">Nombre de la persona responsable que firma la finalización del mantenimiento</p>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Firma digital
                        </label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                          <SignatureCanvas
                            ref={sigCanvas}
                            penColor="black"
                            canvasProps={{
                              width: 500,
                              height: 200,
                              className: 'signature-canvas w-full'
                            }}
                          />
                        </div>
                        <div className="mt-2 flex justify-between">
                          <button
                            type="button"
                            onClick={openFullScreenSignature}
                            className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                          >
                            Firmar en pantalla completa
                          </button>
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Limpiar firma
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Por favor, firme en el recuadro para confirmar la finalización del mantenimiento.
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowActualizarEstado(false);
                      setSelectedMantenimiento(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Actualizando...' : 'Actualizar Estado'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de firma a pantalla completa */}
      {showFullScreenSignature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white w-full h-full max-w-full max-h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Firma Digital</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={syncSignatureFromFullScreen}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-4">
              <div className="w-full h-full border border-gray-300 bg-white rounded-lg overflow-hidden">
                <SignatureCanvas
                  ref={fullScreenSigCanvas}
                  penColor="black"
                  canvasProps={{
                    width: window.innerWidth - 40,
                    height: window.innerHeight - 150,
                    className: 'signature-canvas w-full h-full'
                  }}
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 text-center text-gray-500 text-sm">
              Firme utilizando el dedo o un lápiz digital en dispositivos táctiles, o el mouse en computadoras.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
