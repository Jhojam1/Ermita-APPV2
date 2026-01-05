import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  FunnelIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import companyService, { Company, HeadquarterCompany, City } from '../services/companyService';

// Interfaz para los datos que se muestran en la UI
interface CompanyUI {
  id: string;
  nombre: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado: string;
  cityId: number;
  cityName?: string;
  cityDepartment?: string;
  sedes: HeadquarterUI[];
}

interface HeadquarterUI {
  id: string;
  nombre: string;
  estado: string;
  companyId: string;
}

interface SortConfig {
  key: string;
  direction: string;
}

// Interfaces para los formularios
interface CompanyFormData {
  name: string;
  nit?: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
  cityId: number;
}

interface HeadquarterFormData {
  name: string;
  active: boolean;
  companyId: number;
}

export default function Companies() {
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: '' });
  const [empresasData, setEmpresasData] = useState<CompanyUI[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);
  
  // Estados para modales
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showHeadquarterModal, setShowHeadquarterModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedHeadquarterId, setSelectedHeadquarterId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para formularios
  const [companyFormData, setCompanyFormData] = useState<CompanyFormData>({
    name: '',
    nit: '',
    address: '',
    phone: '',
    email: '',
    active: true,
    cityId: 1 // Default city ID
  });
  
  const [headquarterFormData, setHeadquarterFormData] = useState<HeadquarterFormData>({
    name: '',
    active: true,
    companyId: 0
  });
  
  // Estado para indicar si se está procesando una operación
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const data = await companyService.getAllCities();
      setCities(data);
    } catch (err) {
      console.error('Error al cargar ciudades:', err);
    }
  };

  // Función para mapear las sedes del backend a la UI
  const mapHeadquarterToUI = (headquarter: HeadquarterCompany): HeadquarterUI => {
    return {
      id: headquarter.headquarterId.toString(),
      nombre: headquarter.headquarterName,
      estado: headquarter.active ? 'Activo' : 'Inactivo',
      companyId: headquarter.companyId.toString(),
    };
  };

  // Función para mapear los datos del backend a la UI
  const mapToUI = (company: Company): CompanyUI => {
    return {
      id: company.id.toString(),
      nombre: company.name,
      nit: company.nit,
      direccion: company.address,
      telefono: company.phone,
      email: company.email,
      estado: company.active ? 'Activo' : 'Inactivo',
      cityId: company.cityId || 0,
      cityName: company.cityName,
      cityDepartment: company.cityDepartment,
      sedes: company.headquarters ? company.headquarters.map(mapHeadquarterToUI) : [],
    };
  };

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await companyService.getAllCompanies();
      const mappedData = data.map(mapToUI);
      setEmpresasData(mappedData);
    } catch (err) {
      console.error('Error al cargar empresas:', err);
      setError('Error al cargar las empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompanies = fetchCompanies;

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

  const toggleExpandCompany = (companyId: string) => {
    if (expandedCompanyId === companyId) {
      setExpandedCompanyId(null);
    } else {
      setExpandedCompanyId(companyId);
    }
  };

  const openAddHeadquarterModal = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsEditing(false);
    setHeadquarterFormData({
      name: '',
      active: true,
      companyId: parseInt(companyId)
    });
    setShowHeadquarterModal(true);
  };

  const openEditHeadquarterModal = (headquarterId: string, companyId: string) => {
    setSelectedHeadquarterId(headquarterId);
    setSelectedCompanyId(companyId);
    setIsEditing(true);
    
    // Buscar la sede en los datos actuales
    const company = empresasData.find(c => c.id === companyId);
    const headquarter = company?.sedes.find(s => s.id === headquarterId);
    
    if (headquarter) {
      setHeadquarterFormData({
        name: headquarter.nombre,
        active: headquarter.estado === 'Activo',
        companyId: parseInt(companyId)
      });
    }
    
    setShowHeadquarterModal(true);
  };

  const openAddCompanyModal = () => {
    setIsEditing(false);
    setCompanyFormData({
      name: '',
      nit: '',
      address: '',
      phone: '',
      email: '',
      active: true,
      cityId: cities.length > 0 ? cities[0].id : 1
    });
    setShowCompanyModal(true);
  };

  const openEditCompanyModal = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsEditing(true);
    
    // Buscar la empresa en los datos actuales
    const company = empresasData.find(c => c.id === companyId);
    
    if (company) {
      setCompanyFormData({
        name: company.nombre,
        nit: company.nit || '',
        address: company.direccion || '',
        phone: company.telefono || '',
        email: company.email || '',
        active: company.estado === 'Activo',
        cityId: company.cityId || (cities.length > 0 ? cities[0].id : 1)
      });
    }
    
    setShowCompanyModal(true);
  };

  // Función para crear o actualizar una empresa
  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyFormData.name.trim()) {
      alert('El nombre de la empresa es obligatorio');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (isEditing && selectedCompanyId) {
        // Actualizar empresa existente
        await companyService.updateCompany(Number(selectedCompanyId), companyFormData);
      } else {
        // Crear nueva empresa
        await companyService.createCompany(companyFormData);
      }
      
      // Recargar los datos
      await loadCompanies();
      
      // Cerrar el modal
      setShowCompanyModal(false);
      
    } catch (error) {
      console.error('Error al guardar la empresa:', error);
      alert('Error al guardar la empresa. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para crear o actualizar una sede
  const handleHeadquarterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!headquarterFormData.name.trim()) {
      alert('El nombre de la sede es obligatorio');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (isEditing && selectedHeadquarterId) {
        // Actualizar sede existente
        await companyService.updateHeadquarter(Number(selectedHeadquarterId), headquarterFormData);
      } else {
        // Crear nueva sede
        await companyService.createHeadquarter(headquarterFormData);
      }
      
      // Recargar los datos
      await loadCompanies();
      
      // Cerrar el modal
      setShowHeadquarterModal(false);
      
    } catch (error) {
      console.error('Error al guardar la sede:', error);
      alert('Error al guardar la sede. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar y ordenar empresas
  const filteredAndSortedEmpresas = empresasData
    .filter(empresa => {
      // Filtro por término de búsqueda
      const matchesSearch = searchTerm === '' || 
        empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por estado
      const matchesStatus = filterStatus === '' || empresa.estado === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortConfig.key === '') return 0;
      
      const key = sortConfig.key as keyof CompanyUI;
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      
      if (key === 'sedes') {
        return sortConfig.direction === 'asc' 
          ? a.sedes.length - b.sedes.length 
          : b.sedes.length - a.sedes.length;
      }
      
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

  // Obtener lista única de estados para el filtro
  const uniqueStatuses = [...new Set(empresasData.map(empresa => empresa.estado))];

  // Obtener todas las sedes de todas las empresas

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      {/* Header y Búsqueda */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-light tracking-tight text-gray-900">
          Gestión de <span className="font-medium">Empresas y Sedes</span>
        </h1>
        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Buscar..."
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
            onClick={openAddCompanyModal}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1">
            <PlusCircleIcon className="h-4 w-4" />
            Nueva Empresa
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
                      grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      )}

      {/* Contenido principal */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
        {/* Tabla de Empresas y Sedes */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 w-6"></th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  {renderSortableHeader('nombre', 'Nombre')}
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  NIT
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Ciudad
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  {renderSortableHeader('estado', 'Estado')}
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  {renderSortableHeader('sedes', 'Sedes')}
                </th>
                <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">Cargando empresas...</td>
                </tr>
              ) : filteredAndSortedEmpresas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">No se encontraron empresas</td>
                </tr>
              ) : (
                filteredAndSortedEmpresas.map((empresa) => (
                  <React.Fragment key={empresa.id}>
                    <tr className="hover:bg-gray-50/50">
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => toggleExpandCompany(empresa.id)}
                          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                          {expandedCompanyId === empresa.id ? 
                            <ChevronDownIcon className="h-5 w-5" /> : 
                            <ChevronRightIcon className="h-5 w-5" />
                          }
                        </button>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-700">{empresa.nombre}</td>
                      <td className="p-4 text-sm text-gray-600">{empresa.nit || '-'}</td>
                      <td className="p-4 text-sm text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-medium">{empresa.cityName || '-'}</span>
                          {empresa.cityDepartment && (
                            <span className="text-xs text-gray-500">{empresa.cityDepartment}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                          ${empresa.estado === 'Activo'
                            ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                            : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'}`}>
                          {empresa.estado}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {empresa.sedes.length}
                          </span>
                          <button
                            onClick={() => openAddHeadquarterModal(empresa.id)}
                            className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                          >
                            <PlusCircleIcon className="h-4 w-4" />
                            Agregar sede
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => openEditCompanyModal(empresa.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            title="Editar empresa"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedCompanyId === empresa.id && (
                      <tr>
                        <td colSpan={7} className="p-0 bg-gray-50/50">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-700">Sedes de {empresa.nombre}</h4>
                              <button
                                onClick={() => openAddHeadquarterModal(empresa.id)}
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1"
                              >
                                <PlusCircleIcon className="h-3 w-3" />
                                Nueva Sede
                              </button>
                            </div>
                            
                            {empresa.sedes.length === 0 ? (
                              <div className="text-center py-6 text-sm text-gray-500">
                                Esta empresa no tiene sedes registradas
                              </div>
                            ) : (
                              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Nombre</th>
                                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Estado</th>
                                      <th className="py-2 px-4 text-right text-xs font-medium text-gray-500">Acciones</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {empresa.sedes.map(sede => (
                                      <tr key={sede.id} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 text-sm text-gray-600">{sede.nombre}</td>
                                        <td className="py-2 px-4">
                                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                                            ${sede.estado === 'Activo'
                                              ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                                              : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'}`}>
                                            {sede.estado}
                                          </span>
                                        </td>
                                        <td className="py-2 px-4 text-right">
                                          <div className="flex justify-end items-center gap-1">
                                            <button
                                              onClick={() => openEditHeadquarterModal(sede.id, sede.companyId)}
                                              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                              title="Editar sede"
                                            >
                                              <PencilSquareIcon className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {filteredAndSortedEmpresas.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 p-4 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <p className="text-sm text-gray-700 whitespace-nowrap">
                Mostrando <span className="font-medium">{filteredAndSortedEmpresas.length}</span> de <span className="font-medium">{empresasData.length}</span> empresas
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
      )}

      {/* Modal para Agregar/Editar Empresa */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Editar Empresa' : 'Nueva Empresa'}
              </h3>
              <button 
                onClick={() => setShowCompanyModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <form className="space-y-4" onSubmit={handleCompanySubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input 
                    type="text" 
                    value={companyFormData.name}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                              focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre de la empresa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
                  <input 
                    type="text" 
                    value={companyFormData.nit}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, nit: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                              focus:ring-2 focus:ring-blue-500"
                    placeholder="NIT de la empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                  <select 
                    value={companyFormData.cityId}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, cityId: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                              focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name} - {city.department}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input 
                    type="text" 
                    value={companyFormData.address}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, address: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                              focus:ring-2 focus:ring-blue-500"
                    placeholder="Dirección principal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input 
                    type="tel" 
                    value={companyFormData.phone}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                              focus:ring-2 focus:ring-blue-500"
                    placeholder="Teléfono de contacto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={companyFormData.email}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                              focus:ring-2 focus:ring-blue-500"
                    placeholder="Email de contacto"
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
                        checked={companyFormData.active}
                        onChange={(e) => setCompanyFormData({ ...companyFormData, active: e.target.checked })}
                        className="h-4 w-4 text-blue-600" 
                      />
                      <span className="ml-2 text-sm text-gray-700">Activo</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="estado" 
                        value="inactivo" 
                        checked={!companyFormData.active}
                        onChange={(e) => setCompanyFormData({ ...companyFormData, active: !e.target.checked })}
                        className="h-4 w-4 text-blue-600" 
                      />
                      <span className="ml-2 text-sm text-gray-700">Inactivo</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCompanyModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                  >
                    {isEditing ? 'Guardar Cambios' : 'Crear Empresa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Agregar/Editar Sede */}
      {showHeadquarterModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Editar Sede' : 'Nueva Sede'}
              </h3>
              <button 
                onClick={() => setShowHeadquarterModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <form className="space-y-4" onSubmit={handleHeadquarterSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <select 
                    disabled={selectedCompanyId !== null}
                    value={headquarterFormData.companyId}
                    onChange={(e) => setHeadquarterFormData({ ...headquarterFormData, companyId: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                              focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                  >
                    {empresasData.map(empresa => (
                      <option 
                        key={empresa.id} 
                        value={empresa.id}
                      >
                        {empresa.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input 
                    type="text" 
                    value={headquarterFormData.name}
                    onChange={(e) => setHeadquarterFormData({ ...headquarterFormData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                              focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre de la sede"
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
                        checked={headquarterFormData.active}
                        onChange={(e) => setHeadquarterFormData({ ...headquarterFormData, active: e.target.checked })}
                        className="h-4 w-4 text-blue-600" 
                      />
                      <span className="ml-2 text-sm text-gray-700">Activo</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="estado" 
                        value="inactivo" 
                        checked={!headquarterFormData.active}
                        onChange={(e) => setHeadquarterFormData({ ...headquarterFormData, active: !e.target.checked })}
                        className="h-4 w-4 text-blue-600" 
                      />
                      <span className="ml-2 text-sm text-gray-700">Inactivo</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowHeadquarterModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                  >
                    {isEditing ? 'Guardar Cambios' : 'Crear Sede'}
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
