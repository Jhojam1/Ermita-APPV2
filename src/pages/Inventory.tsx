import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  FunnelIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Datos de ejemplo
const inventarioData = [
  {
    id: 1,
    empresa: 'TechCorp',
    sede: 'Sede Principal',
    serial: 'SN2024001',
    codigoInterno: 'PC-001',
    marca: 'Dell',
    modelo: 'Latitude 5520',
    procesador: 'Intel i7',
    ram: '16GB',
    disco: '512GB',
    tipo: 'Laptop',
    estado: 'Activo',
    fechaCreacion: '2024-01-15',
    responsable: 'Juan Pérez',
    servicio: 'Desarrollo'
  },
  {
    id: 2,
    empresa: 'TechCorp',
    sede: 'Sede Norte',
    serial: 'SN2024002',
    codigoInterno: 'PC-002',
    marca: 'HP',
    modelo: 'ProDesk 600',
    procesador: 'Intel i5',
    ram: '8GB',
    disco: '1TB',
    tipo: 'Desktop',
    estado: 'Inactivo',
    fechaCreacion: '2024-01-20',
    responsable: 'María López',
    servicio: 'Diseño'
  },
];

// Componente Modal
const ModalDetalles = ({ equipo, onClose }: { equipo: any; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-gray-900">Detalles del Equipo</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Información Básica</h4>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-medium">Serial:</span> {equipo.serial}</p>
                <p className="text-sm"><span className="font-medium">Código:</span> {equipo.codigoInterno}</p>
                <p className="text-sm"><span className="font-medium">Empresa:</span> {equipo.empresa}</p>
                <p className="text-sm"><span className="font-medium">Sede:</span> {equipo.sede}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Especificaciones</h4>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-medium">Marca:</span> {equipo.marca}</p>
                <p className="text-sm"><span className="font-medium">Modelo:</span> {equipo.modelo}</p>
                <p className="text-sm"><span className="font-medium">Procesador:</span> {equipo.procesador}</p>
                <p className="text-sm"><span className="font-medium">RAM:</span> {equipo.ram}</p>
                <p className="text-sm"><span className="font-medium">Disco:</span> {equipo.disco}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Asignación y Estado</h4>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-medium">Responsable:</span> {equipo.responsable}</p>
                <p className="text-sm"><span className="font-medium">Servicio:</span> {equipo.servicio}</p>
                <p className="text-sm"><span className="font-medium">Fecha Creación:</span> {' '}
                  {new Date(equipo.fechaCreacion).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Estado:</span>{' '}
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                    ${equipo.estado === 'Activo'
                      ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                      : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'}`}>
                    {equipo.estado}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Tipo:</span>{' '}
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                    ${equipo.tipo === 'Laptop'
                      ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-700/10'
                      : 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10'}`}>
                    {equipo.tipo}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function Inventory() {
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipo, setSelectedEquipo] = useState<any>(null);

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortableHeader = (key: string, label: string) => (
    <th
      className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer 
                group hover:bg-gray-50/50 transition-all duration-200"
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ChevronUpDownIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
      </div>
    </th>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <h1 className="text-2xl font-medium text-gray-900">Inventario de Equipos</h1>

        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5">
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por serial, código o marca..."
                className="block w-full pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400
                         bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
                        ${showFilters
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            >
              {showFilters ? <XMarkIcon className="h-5 w-5" /> : <FunnelIcon className="h-5 w-5" />}
              {showFilters ? 'Ocultar filtros' : 'Filtros'}
            </button>
          </div>

          {showFilters && (
            <div className="border-t border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <select className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg
                              focus:ring-2 focus:ring-blue-500">
                <option value="">Todas las empresas</option>
                <option value="techcorp">TechCorp</option>
              </select>
              <select className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg
                              focus:ring-2 focus:ring-blue-500">
                <option value="">Todas las sedes</option>
                <option value="principal">Sede Principal</option>
                <option value="norte">Sede Norte</option>
              </select>
              <select className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg
                              focus:ring-2 focus:ring-blue-500">
                <option value="">Todos los tipos</option>
                <option value="laptop">Laptop</option>
                <option value="desktop">Desktop</option>
              </select>
              <select className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg
                              focus:ring-2 focus:ring-blue-500">
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50/50">
                    {renderSortableHeader('empresa', 'Empresa')}
                    {renderSortableHeader('sede', 'Sede')}
                    {renderSortableHeader('serial', 'Serial')}
                    {renderSortableHeader('codigoInterno', 'Código')}
                    {renderSortableHeader('marca', 'Marca')}
                    {renderSortableHeader('procesador', 'Procesador')}
                    {renderSortableHeader('ram', 'RAM')}
                    {renderSortableHeader('disco', 'Disco')}
                    {renderSortableHeader('tipo', 'Tipo')}
                    {renderSortableHeader('estado', 'Estado')}
                    <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {inventarioData.map((equipo) => (
                    <tr key={equipo.id} className="hover:bg-gray-50/50">
                      <td className="p-3 text-sm text-gray-600 whitespace-nowrap">{equipo.empresa}</td>
                      <td className="p-3 text-sm text-gray-600 whitespace-nowrap">{equipo.sede}</td>
                      <td className="p-3 text-sm font-medium text-gray-900 whitespace-nowrap">{equipo.serial}</td>
                      <td className="p-3 text-sm text-gray-600 whitespace-nowrap">{equipo.codigoInterno}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{equipo.marca}</span>
                          <span className="text-xs text-gray-500">{equipo.modelo}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600 whitespace-nowrap">{equipo.procesador}</td>
                      <td className="p-3 text-sm text-gray-600 whitespace-nowrap">{equipo.ram}</td>
                      <td className="p-3 text-sm text-gray-600 whitespace-nowrap">{equipo.disco}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                          ${equipo.tipo === 'Laptop'
                            ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-700/10'
                            : 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10'}`}>
                          {equipo.tipo}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                          ${equipo.estado === 'Activo'
                            ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                            : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'}`}>
                          {equipo.estado}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => setSelectedEquipo(equipo)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            title="Ver detalles"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            title="Editar equipo"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Paginación */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <p className="text-sm text-gray-700 whitespace-nowrap">
                Mostrando <span className="font-medium">2</span> de <span className="font-medium">50</span> equipos
              </p>
              <select className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg
                              focus:ring-2 focus:ring-blue-500">
                <option value="10">10 por página</option>
                <option value="20">20 por página</option>
                <option value="50">50 por página</option>
              </select>
            </div>
            <nav className="flex gap-1 w-full sm:w-auto justify-center">
              <button className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100">
                Anterior
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                1
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100">
                2
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100">
                3
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100">
                Siguiente
              </button>
            </nav>
          </div>
        </div>

        {/* Modal de Detalles */}
        {selectedEquipo && (
          <ModalDetalles
            equipo={selectedEquipo}
            onClose={() => setSelectedEquipo(null)}
          />
        )}
      </div>
    </div>
  );
}
