import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  DocumentIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Mantenimiento {
  id: number;
  equipo: string;
  fecha: string;
  tipo: string;
  estado: string;
  tecnico: string;
  descripcion: string;
}

export default function History() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<Mantenimiento | null>(null);
  const [showDetallesModal, setShowDetallesModal] = useState(false);

  const handleVerDetalles = (mantenimiento: Mantenimiento) => {
    setSelectedMantenimiento(mantenimiento);
    setShowDetallesModal(true);
  };

  const handleDescargarReporte = (id: number) => {
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
              placeholder="Buscar mantenimiento..."
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
        </div>
      </div>

      {/* Filtros Flotantes */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100
                      grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                         focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los estados</option>
            <option value="completado">Completado</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Proceso</option>
          </select>
          <select className="px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                         focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los tipos</option>
            <option value="preventivo">Preventivo</option>
            <option value="correctivo">Correctivo</option>
            <option value="predictivo">Predictivo</option>
          </select>
          <input
            type="month"
            className="px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                     focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Lista de Mantenimientos */}
      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden
                     hover:shadow-lg transition-all duration-300 ease-in-out"
          >
            <div className="relative">
              <div className="p-6">
                {/* Encabezado */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      item % 3 === 0 ? 'bg-yellow-400' :
                      item % 2 === 0 ? 'bg-green-400' :
                      'bg-blue-400'
                    }`} />
                    <h3 className="text-lg font-medium text-gray-900">
                      Mantenimiento #{item.toString().padStart(3, '0')}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item % 3 === 0 ? 'bg-yellow-50 text-yellow-700' :
                    item % 2 === 0 ? 'bg-green-50 text-green-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {item % 3 === 0 ? 'En Proceso' :
                     item % 2 === 0 ? 'Completado' :
                     'Pendiente'}
                  </span>
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Equipo</p>
                    <p className="text-sm text-gray-900">Computadora #{item}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Fecha</p>
                    <div className="flex items-center text-sm text-gray-900">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                      2024-04-{item.toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tipo</p>
                    <p className="text-sm text-gray-900">
                      {item % 2 === 0 ? 'Preventivo' : 'Correctivo'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Técnico</p>
                    <p className="text-sm text-gray-900">Juan Pérez</p>
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-sm text-gray-600 mb-4">
                  {item % 2 === 0 
                    ? 'Mantenimiento preventivo que incluye limpieza de hardware y actualización de software.'
                    : 'Mantenimiento correctivo para solucionar problemas de rendimiento y estabilidad.'}
                </p>

                {/* Acciones */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleVerDetalles({
                      id: item,
                      equipo: `Computadora #${item}`,
                      fecha: `2024-04-${item.toString().padStart(2, '0')}`,
                      tipo: item % 2 === 0 ? 'Preventivo' : 'Correctivo',
                      estado: item % 3 === 0 ? 'En Proceso' : item % 2 === 0 ? 'Completado' : 'Pendiente',
                      tecnico: 'Juan Pérez',
                      descripcion: item % 2 === 0 
                        ? 'Mantenimiento preventivo que incluye limpieza de hardware y actualización de software.'
                        : 'Mantenimiento correctivo para solucionar problemas de rendimiento y estabilidad.'
                    })}
                    className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-200 hover:border-transparent transition-all duration-200"
                  >
                    Ver detalles
                  </button>
                  <button 
                    onClick={() => handleDescargarReporte(item)}
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

      {/* Paginación Minimalista */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-gray-500">5 de 25 registros</p>
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
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedMantenimiento.estado === 'Pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedMantenimiento.estado === 'En Proceso'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedMantenimiento.estado}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Equipo</p>
                  <p className="text-sm text-gray-900">{selectedMantenimiento.equipo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Fecha</p>
                  <p className="text-sm text-gray-900">{selectedMantenimiento.fecha}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Tipo</p>
                  <p className="text-sm text-gray-900">{selectedMantenimiento.tipo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Técnico</p>
                  <p className="text-sm text-gray-900">{selectedMantenimiento.tecnico}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Descripción</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{selectedMantenimiento.descripcion}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end">
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
