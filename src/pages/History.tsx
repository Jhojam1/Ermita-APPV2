import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  DocumentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import maintenanceService, { MaintenanceItemUI } from '../services/maintenanceService';

export default function History() {
  const [mantenimientosData, setMantenimientosData] = useState<MaintenanceItemUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<MaintenanceItemUI | null>(null);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompletedMaintenances();
  }, []);

  const fetchCompletedMaintenances = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await maintenanceService.getMaintenancesByStatus('COMPLETADO');
      const mappedData = data.map(item => maintenanceService.mapToUI(item));
      setMantenimientosData(mappedData);
    } catch (err) {
      console.error('Error al cargar mantenimientos completados:', err);
      setError('Error al cargar el historial de mantenimientos. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerDetalles = (mantenimiento: MaintenanceItemUI) => {
    setSelectedMantenimiento(mantenimiento);
    setShowDetallesModal(true);
  };

  const handleDescargarReporte = (id: string) => {
    // Aquí se implementará la descarga del reporte
    console.log('Descargando reporte:', id);
    // Por ahora simularemos una descarga
    const link = document.createElement('a');
    link.href = '#';
    link.download = `reporte-mantenimiento-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrar mantenimientos según el término de búsqueda
  const filteredMantenimientos = mantenimientosData.filter(item => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    // Buscar en todos los campos relevantes
    return (
      item.equipo.toLowerCase().includes(searchTermLower) ||
      item.tecnico.toLowerCase().includes(searchTermLower) ||
      item.tipo.toLowerCase().includes(searchTermLower) ||
      (item.fechaCompletado && item.fechaCompletado.toLowerCase().includes(searchTermLower)) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(searchTermLower)) ||
      (item.observaciones && item.observaciones.toLowerCase().includes(searchTermLower)) ||
      (item.area && item.area.toLowerCase().includes(searchTermLower)) ||
      (item.responsable && item.responsable.toLowerCase().includes(searchTermLower))
    );
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header y Búsqueda */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
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
        <div className="p-8 text-center text-gray-500">No se encontraron mantenimientos completados</div>
      ) : (
        <div className="grid gap-4">
          {filteredMantenimientos.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden
                       hover:shadow-lg transition-all duration-300 ease-in-out"
            >
              <div className="relative">
                <div className="p-6">
                  {/* Encabezado */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <h3 className="text-lg font-medium text-gray-900">
                        Mantenimiento #{item.id.padStart(3, '0')}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      Completado
                    </span>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Equipo</p>
                      <p className="text-sm text-gray-900">{item.equipo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fecha Completado</p>
                      <div className="flex items-center text-sm text-gray-900">
                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {item.fechaCompletado || 'No disponible'}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tipo</p>
                      <p className="text-sm text-gray-900">{item.tipo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Técnico</p>
                      <p className="text-sm text-gray-900">{item.tecnico}</p>
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className="text-sm text-gray-600 mb-4">
                    {item.descripcion || (item.isAutoScheduled ? "Mantenimiento preventivo programado automáticamente" : "Sin descripción")}
                  </p>

                  {/* Acciones */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleVerDetalles(item)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-200 hover:border-transparent transition-all duration-200"
                    >
                      Ver detalles
                    </button>
                    <button 
                      onClick={() => handleDescargarReporte(item.id)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-purple-600 hover:text-white hover:bg-purple-600 rounded-lg border border-purple-200 hover:border-transparent transition-all duration-200"
                    >
                      Descargar reporte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación Minimalista */}
      {filteredMantenimientos.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-gray-500">{filteredMantenimientos.length} registros</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
              Anterior
            </button>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1 text-sm text-white bg-blue-500 rounded">1</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded">2</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded">3</button>
            </div>
            <button className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
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
