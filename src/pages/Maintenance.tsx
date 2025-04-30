import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const mantenimientosData = [
  {
    id: '0001',
    equipo: 'Computadora 1',
    estado: 'Pendiente',
    fechaProgramada: '2024-04-11',
    tecnico: 'Juan Pérez',
    tipo: 'Preventivo',
    prioridad: 'Alta',
    descripcion: 'Mantenimiento preventivo programado incluyendo limpieza de hardware y actualización de software.'
  },
  {
    id: '0002',
    equipo: 'Impresora 2',
    estado: 'En Proceso',
    fechaProgramada: '2024-04-12',
    tecnico: 'María López',
    tipo: 'Correctivo',
    prioridad: 'Media',
    descripcion: 'Reparación de sistema de alimentación de papel'
  },
  {
    id: '0003',
    equipo: 'Servidor 1',
    estado: 'Pendiente',
    fechaProgramada: '2024-04-13',
    tecnico: 'Carlos Ruiz',
    tipo: 'Preventivo',
    prioridad: 'Alta',
    descripcion: 'Actualización de sistema operativo y respaldo de datos'
  }
];

export default function Maintenance() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<any>(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showActualizarEstado, setShowActualizarEstado] = useState(false);
  const [formData, setFormData] = useState({
    tecnico: '',
    tipoMantenimiento: '',
    observaciones: '',
    estado: 'completado'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Actualizando estado:', { mantenimientoId: selectedMantenimiento?.id, ...formData });
    setShowActualizarEstado(false);
    setSelectedMantenimiento(null);
  };

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
          <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors duration-200">
            Nuevo Mantenimiento
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
        {mantenimientosData.map((mantenimiento) => (
          <div
            key={mantenimiento.id}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden
                     hover:shadow-lg transition-all duration-300 ease-in-out"
          >
            <div className="relative">
              <div className="p-6">
                {/* Estado del mantenimiento */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    mantenimiento.estado === 'Pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : mantenimiento.estado === 'En Proceso'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {mantenimiento.estado}
                  </span>
                  <p className="text-sm text-gray-500">ID: {mantenimiento.id}</p>
                </div>

                {/* Información principal */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Equipo</p>
                    <p className="text-sm text-gray-900">{mantenimiento.equipo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Fecha</p>
                    <div className="flex items-center text-sm text-gray-900">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {mantenimiento.fechaProgramada}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tipo</p>
                    <p className="text-sm text-gray-900">{mantenimiento.tipo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Técnico</p>
                    <p className="text-sm text-gray-900">{mantenimiento.tecnico}</p>
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-sm text-gray-600 mb-4">
                  {mantenimiento.descripcion}
                </p>

                {/* Acciones */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedMantenimiento(mantenimiento);
                      setShowDetalles(true);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-200 hover:border-transparent transition-all duration-200"
                  >
                    Ver detalles
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMantenimiento(mantenimiento);
                      setShowActualizarEstado(true);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-white hover:bg-green-600 rounded-lg border border-green-200 hover:border-transparent transition-all duration-200"
                  >
                    Actualizar estado
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación Minimalista */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-gray-500">3 de 10 registros</p>
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
      {showDetalles && selectedMantenimiento && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Detalles de Mantenimiento</h2>
              <button
                onClick={() => {
                  setShowDetalles(false);
                  setSelectedMantenimiento(null);
                }}
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
                  <p className="text-sm text-gray-900">{selectedMantenimiento.fechaProgramada}</p>
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
                onClick={() => {
                  setShowDetalles(false);
                  setSelectedMantenimiento(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Actualizar Estado */}
      {showActualizarEstado && selectedMantenimiento && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Actualizar Estado</h2>
              <button
                onClick={() => {
                  setShowActualizarEstado(false);
                  setSelectedMantenimiento(null);
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">ID de Mantenimiento: {selectedMantenimiento.id}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="tecnico" className="block text-sm font-medium text-gray-700 mb-1">
                    Técnico Responsable
                  </label>
                  <input
                    type="text"
                    id="tecnico"
                    value={formData.tecnico}
                    onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900
                             focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                    <option value="predictivo">Predictivo</option>
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
                >
                  Actualizar Estado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
