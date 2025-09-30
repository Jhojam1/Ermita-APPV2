import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  FunnelIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import companyService, { City } from '../services/companyService';

// Interfaz para los datos que se muestran en la UI
interface CityUI {
  id: string;
  nombre: string;
  departamento: string;
  pais: string;
  estado: string;
}

interface SortConfig {
  key: string;
  direction: string;
}

// Interfaz para el formulario
interface CityFormData {
  name: string;
  department: string;
  country: string;
  active: boolean;
}

export default function Cities() {
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: '' });
  const [citiesData, setCitiesData] = useState<CityUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  
  // Estados para modal
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado para formulario
  const [cityFormData, setCityFormData] = useState<CityFormData>({
    name: '',
    department: '',
    country: 'Colombia',
    active: true
  });
  
  // Estado para indicar si se está procesando una operación
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await companyService.getAllCities();
      const mappedData = data.map(mapToUI);
      setCitiesData(mappedData);
    } catch (err) {
      console.error('Error al cargar ciudades:', err);
      setError('Error al cargar los datos de ciudades. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para mapear los datos del backend a la UI
  const mapToUI = (city: City): CityUI => {
    return {
      id: city.id.toString(),
      nombre: city.name,
      departamento: city.department,
      pais: city.country,
      estado: city.active ? 'Activo' : 'Inactivo',
    };
  };

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

  const openAddCityModal = () => {
    setIsEditing(false);
    setCityFormData({
      name: '',
      department: '',
      country: 'Colombia',
      active: true
    });
    setShowCityModal(true);
  };

  const openEditCityModal = (cityId: string) => {
    setSelectedCityId(cityId);
    setIsEditing(true);
    
    // Buscar la ciudad en los datos actuales
    const city = citiesData.find(c => c.id === cityId);
    
    if (city) {
      setCityFormData({
        name: city.nombre,
        department: city.departamento,
        country: city.pais,
        active: city.estado === 'Activo'
      });
    }
    
    setShowCityModal(true);
  };

  // Función para crear o actualizar una ciudad
  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cityFormData.name.trim()) {
      alert('El nombre de la ciudad es obligatorio');
      return;
    }
    
    if (!cityFormData.department.trim()) {
      alert('El departamento es obligatorio');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (isEditing && selectedCityId) {
        // Actualizar ciudad existente
        await companyService.updateCity(parseInt(selectedCityId), {
          name: cityFormData.name,
          department: cityFormData.department,
          country: cityFormData.country,
          active: cityFormData.active
        });
      } else {
        // Crear nueva ciudad
        await companyService.createCity({
          name: cityFormData.name,
          department: cityFormData.department,
          country: cityFormData.country,
          active: cityFormData.active
        });
      }
      
      // Recargar los datos
      await fetchCities();
      
      // Cerrar el modal
      setShowCityModal(false);
      
    } catch (error) {
      console.error('Error al guardar la ciudad:', error);
      alert('Error al guardar la ciudad. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar y ordenar ciudades
  const filteredAndSortedCities = citiesData
    .filter(city => {
      // Filtro por término de búsqueda
      const matchesSearch = searchTerm === '' || 
        city.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.departamento.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por estado
      const matchesStatus = filterStatus === '' || city.estado === filterStatus;
      
      // Filtro por departamento
      const matchesDepartment = filterDepartment === '' || city.departamento === filterDepartment;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    })
    .sort((a, b) => {
      if (sortConfig.key === '') return 0;
      
      const key = sortConfig.key as keyof CityUI;
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
      }
      return 0;
    });

  // Obtener lista única de estados y departamentos para los filtros
  const uniqueStatuses = [...new Set(citiesData.map(city => city.estado))];
  const uniqueDepartments = [...new Set(citiesData.map(city => city.departamento))].sort();

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      {/* Header y Búsqueda */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-light tracking-tight text-gray-900">
          Gestión de <span className="font-medium">Ciudades</span>
        </h1>
        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Buscar ciudad o departamento..."
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
            <FunnelIcon className="h-5 w-5 text-gray-500" />
          </button>
          <button 
            onClick={openAddCityModal}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1">
            <PlusCircleIcon className="h-4 w-4" />
            Nueva Ciudad
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filtros */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100
                      grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                         focus:ring-2 focus:ring-blue-500">
              <option value="">Todos los estados</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <select 
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                         focus:ring-2 focus:ring-blue-500">
              <option value="">Todos los departamentos</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
        {/* Tabla de Ciudades */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  {renderSortableHeader('nombre', 'Ciudad')}
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  {renderSortableHeader('departamento', 'Departamento')}
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  {renderSortableHeader('pais', 'País')}
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">Cargando ciudades...</td>
                </tr>
              ) : filteredAndSortedCities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">No se encontraron ciudades</td>
                </tr>
              ) : (
                filteredAndSortedCities.map((city) => (
                  <tr key={city.id} className="hover:bg-gray-50/50">
                    <td className="p-4 text-sm font-medium text-gray-700">{city.nombre}</td>
                    <td className="p-4 text-sm text-gray-600">{city.departamento}</td>
                    <td className="p-4 text-sm text-gray-600">{city.pais}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                        ${city.estado === 'Activo'
                          ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                          : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'}`}>
                        {city.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => openEditCityModal(city.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          title="Editar ciudad"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {filteredAndSortedCities.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 p-4 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <p className="text-sm text-gray-700 whitespace-nowrap">
                Mostrando <span className="font-medium">{filteredAndSortedCities.length}</span> de <span className="font-medium">{citiesData.length}</span> ciudades
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Agregar/Editar Ciudad */}
      {showCityModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Editar Ciudad' : 'Nueva Ciudad'}
              </h3>
              <button 
                onClick={() => setShowCityModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <form className="space-y-4" onSubmit={handleCitySubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Ciudad *</label>
                  <input 
                    type="text" 
                    value={cityFormData.name}
                    onChange={(e) => setCityFormData({ ...cityFormData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                              focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Bogotá"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
                  <input 
                    type="text" 
                    value={cityFormData.department}
                    onChange={(e) => setCityFormData({ ...cityFormData, department: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                              focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Cundinamarca"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <input 
                    type="text" 
                    value={cityFormData.country}
                    onChange={(e) => setCityFormData({ ...cityFormData, country: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                              focus:ring-2 focus:ring-blue-500"
                    placeholder="Colombia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="estado" 
                        value="activo" 
                        checked={cityFormData.active}
                        onChange={(e) => setCityFormData({ ...cityFormData, active: e.target.checked })}
                        className="h-4 w-4 text-blue-600" 
                      />
                      <span className="ml-2 text-sm text-gray-700">Activo</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="estado" 
                        value="inactivo" 
                        checked={!cityFormData.active}
                        onChange={(e) => setCityFormData({ ...cityFormData, active: !e.target.checked })}
                        className="h-4 w-4 text-blue-600" 
                      />
                      <span className="ml-2 text-sm text-gray-700">Inactivo</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCityModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Ciudad')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
