import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  FunnelIcon,
  EyeIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

const empresasData = [
  {
    id: 1,
    nombre: 'TechCorp',
    nit: '901.123.456-7',
    direccion: 'Calle Principal #123',
    telefono: '601 555-1234',
    email: 'contacto@techcorp.com',
    estado: 'Activo',
  },
  {
    id: 2,
    nombre: 'HealthServices',
    nit: '900.987.654-3',
    direccion: 'Avenida Salud #456',
    telefono: '601 555-5678',
    email: 'info@healthservices.com',
    estado: 'Activo',
  },
];

interface SortConfig {
  key: string;
  direction: string;
}

export default function Companies() {
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: '' });

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortableHeader = (key: string, label: string) => (
    <button
      onClick={() => handleSort(key)}
      className="inline-flex items-center gap-1 hover:text-gray-700"
    >
      {label}
      <ChevronUpDownIcon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      {/* Header y Búsqueda */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-light tracking-tight text-gray-900">
          Gestión de <span className="font-medium">Empresas</span>
        </h1>
        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Buscar empresa..."
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
            <FunnelIcon className="h-5 w-5 text-gray-500" />
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors duration-200">
            Nueva Empresa
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100
                      grid grid-cols-1 md:grid-cols-2 gap-4">
          <select className="px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                         focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  {renderSortableHeader('nombre', 'Nombre')}
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  {renderSortableHeader('nit', 'NIT')}
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  {renderSortableHeader('direccion', 'Dirección')}
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  {renderSortableHeader('telefono', 'Teléfono')}
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  {renderSortableHeader('email', 'Email')}
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  {renderSortableHeader('estado', 'Estado')}
                </th>
                <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {empresasData.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-gray-50/50">
                  <td className="p-4 text-sm text-gray-600">{empresa.nombre}</td>
                  <td className="p-4 text-sm text-gray-600">{empresa.nit}</td>
                  <td className="p-4 text-sm text-gray-600">{empresa.direccion}</td>
                  <td className="p-4 text-sm text-gray-600">{empresa.telefono}</td>
                  <td className="p-4 text-sm text-gray-600">{empresa.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                      ${empresa.estado === 'Activo'
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                        : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'}`}>
                      {empresa.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        title="Editar empresa"
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

      {/* Paginación */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <p className="text-sm text-gray-700 whitespace-nowrap">
              Mostrando <span className="font-medium">2</span> de <span className="font-medium">5</span> empresas
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
              Siguiente
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
