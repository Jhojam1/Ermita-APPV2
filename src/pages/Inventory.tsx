import React, { useState, useEffect } from 'react';
import {
  EyeIcon,
  PencilSquareIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import inventoryService, { InventoryItem } from '../services/inventoryService';
import AddInventoryItemModal from '../components/inventory/AddInventoryItemModal';
import EditInventoryItemModal from '../components/inventory/EditInventoryItemModal';
import ModalDetalles from '../components/inventory/ModalDetalles';
import EquipmentTransferFormModal from '../components/inventory/EquipmentTransferFormModal';

// Mapeo de propiedades del backend al frontend
const mapInventoryItemToUI = (item: InventoryItem) => {
  return {
    id: item.id,
    // IDs para traslados y edición
    cityId: item.cityId,
    companyId: item.companyId,
    sedeId: item.sedeId,
    // Nombres para visualización
    ciudad: item.cityName || 'Ciudad no especificada',
    empresa: item.companyName || 'Desconocida',
    sede: item.sedeName || 'Desconocida',
    serial: item.serial,
    codigoInterno: item.internalCode ?? 'N/A',
    marca: item.brand.name,
    modelo: item.model,
    procesador: item.processor,
    ram: item.ramMemory,
    disco: item.hardDrive,
    tipo: item.typeInventoryItem.name,
    estado: item.status || 'Activo',
    fechaCreacion: item.createdAt || new Date().toISOString(),
    responsable: item.responsible,
    servicio: item.service
  };
};

export default function Inventory() {
  const [inventarioData, setInventarioData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedEquipo, setSelectedEquipo] = useState<any | null>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<any | null>(null);
  const [transferEquipo, setTransferEquipo] = useState<any | null>(null);
  const [originalItems, setOriginalItems] = useState<InventoryItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    ciudad: '',
    empresa: '',
    sede: '',
    tipo: '',
    estado: ''
  });
  
  // Listas para los filtros
  const [empresas, setEmpresas] = useState<{id: number, name: string}[]>([]);
  const [sedes, setSedes] = useState<{id: number, name: string, companyId: number}[]>([]);
  const [tipos, setTipos] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    fetchInventoryItems();
  }, []);
  
  // Cargar datos para los filtros
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Obtener tipos de equipos
        const typesData = await inventoryService.getAllTypes();
        setTipos(typesData.map(type => ({ id: type.id || 0, name: type.name })));
        
        // Extraer empresas y sedes únicas de los datos de inventario
        const uniqueCompanies = new Map();
        const uniqueHeadquarters = new Map();
        
        inventarioData.forEach(item => {
          // Añadir empresa si no existe
          if (item.empresa && !uniqueCompanies.has(item.companyId)) {
            uniqueCompanies.set(item.companyId, {
              id: item.companyId,
              name: item.empresa
            });
          }
          
          // Añadir sede si no existe
          if (item.sede && !uniqueHeadquarters.has(item.sedeId)) {
            uniqueHeadquarters.set(item.sedeId, {
              id: item.sedeId,
              name: item.sede,
              companyId: item.companyId
            });
          }
        });
        
        setEmpresas(Array.from(uniqueCompanies.values()));
        setSedes(Array.from(uniqueHeadquarters.values()));
      } catch (error) {
        console.error('Error al cargar datos para filtros:', error);
      }
    };
    
    if (inventarioData.length > 0) {
      fetchFilterData();
    }
  }, [inventarioData]);

  const fetchInventoryItems = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Intentar obtener datos del API
      const items = await inventoryService.getAllItems();
      setOriginalItems(items); // Guardar los items originales
      const mappedItems = items.map(mapInventoryItemToUI);
      setInventarioData(mappedItems);
    } catch (error) {
      console.error('Error al obtener datos de inventario:', error);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
      setInventarioData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction: direction as 'asc' | 'desc' });
  };

  const handleAddItem = async (newItem: InventoryItem) => {
    try {
      // Enviar al API
      // const savedItem = await inventoryService.createItem(newItem);
      
      // Por ahora, simulamos una respuesta exitosa y actualizamos la UI
      const uiItem = mapInventoryItemToUI(newItem);
      setInventarioData(prev => [uiItem, ...prev]);
    } catch (error) {
      console.error('Error al agregar elemento de inventario:', error);
    }
  };

  const handleEditItem = (equipo: any) => {
    // Encontrar el item original correspondiente
    const originalItem = originalItems.find(item => item.id === equipo.id);
    if (originalItem) {
      setEditingEquipo({ uiItem: equipo, originalItem });
    } else {
      console.error('No se encontró el item original para editar');
    }
  };

  const handleSaveEdit = (updatedItem: any) => {
    // Actualizar el item en la lista
    setInventarioData(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  };

  // Manejar el traslado de un equipo
  const handleTransferItem = (equipo: any) => {
    setTransferEquipo(equipo);
  };

  // Actualizar la lista después de un traslado exitoso
  const handleTransferSuccess = async () => {
    setTransferEquipo(null);
    setError(null);
    await fetchInventoryItems();
  };
    
  // Manejar cambios en los filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si se selecciona una empresa, filtrar las sedes disponibles
    if (name === 'empresa' && value) {
      const companyId = parseInt(value);
      // Obtener todas las sedes y filtrar por la empresa seleccionada
      const filteredSedes = Array.from(new Set(
        inventarioData
          .filter(item => item.companyId === companyId)
          .map(item => JSON.stringify({ id: item.sedeId, name: item.sede, companyId }))
      )).map(item => JSON.parse(item));
      
      setSedes(filteredSedes);
    } else if (name === 'empresa' && !value) {
      // Si se deselecciona la empresa, mostrar todas las sedes
      const allSedes = Array.from(new Set(
        inventarioData.map(item => JSON.stringify({ id: item.sedeId, name: item.sede, companyId: item.companyId }))
      )).map(item => JSON.parse(item));
      
      setSedes(allSedes);
    }
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

  // Aplicar filtros y búsqueda
  const filteredAndSortedData = inventarioData
    .filter(equipo => {
      // Filtrar por término de búsqueda
      const searchMatch = 
        equipo.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.codigoInterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.sede.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.tipo.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtrar por filtros seleccionados
      const empresaMatch = !filters.empresa || equipo.companyId === parseInt(filters.empresa);
      const sedeMatch = !filters.sede || equipo.sedeId === parseInt(filters.sede);
      const tipoMatch = !filters.tipo || equipo.tipo.toLowerCase() === filters.tipo.toLowerCase();
      const estadoMatch = !filters.estado || equipo.estado.toLowerCase() === filters.estado.toLowerCase();
      
      return searchMatch && empresaMatch && sedeMatch && tipoMatch && estadoMatch;
    })
    .sort((a, b) => {
      if (!sortConfig?.key) return 0;
      
      const key = sortConfig.key as keyof typeof a;
      if (a[key] < b[key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1600px] mx-auto space-y-4 p-4 sm:p-6">
        {/* Header con título y botón de agregar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-medium text-gray-900">Inventario de Equipos</h1>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Agregar Equipo
            </button>
          </div>
        </div>

        {/* Mensaje de error si existe */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

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
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
                        bg-gray-50 text-gray-700 hover:bg-gray-100"
            >
              <FunnelIcon className="h-5 w-5" />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
          </div>

          {showFilters && (
            <div className="border-t border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                name="empresa"
                value={filters.empresa}
                onChange={handleFilterChange}
                className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las empresas</option>
                {empresas.map(empresa => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.name}
                  </option>
                ))}
              </select>
              
              <select
                name="sede"
                value={filters.sede}
                onChange={handleFilterChange}
                className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las sedes</option>
                {sedes.map(sede => (
                  <option key={sede.id} value={sede.id}>
                    {sede.name}
                  </option>
                ))}
              </select>
              
              <select
                name="tipo"
                value={filters.tipo}
                onChange={handleFilterChange}
                className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                {tipos.map(tipo => (
                  <option key={tipo.id} value={tipo.name}>
                    {tipo.name}
                  </option>
                ))}
              </select>
              
              <select
                name="estado"
                value={filters.estado}
                onChange={handleFilterChange}
                className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Cargando datos de inventario...</p>
            </div>
          ) : filteredAndSortedData.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No se encontraron equipos que coincidan con tu búsqueda.</p>
            </div>
          ) : (
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
                    {filteredAndSortedData.map((equipo) => (
                      <tr 
                        key={equipo.id} 
                        className="hover:bg-gray-50/50 cursor-pointer"
                        onClick={() => {
                          console.log('Equipo seleccionado (fila):', equipo);
                          setSelectedEquipo(equipo);
                          setSelectedTab(1); // Establece directamente la pestaña de Historial de traslados
                        }}
                      >
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
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Evita que el evento se propague a la fila
                                console.log('Ver detalles (ojo):', equipo);
                                setSelectedEquipo(equipo);
                                setSelectedTab(0); // Mostrar la pestaña de información general
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                              title="Ver información general"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Evita que el evento se propague a la fila
                                handleEditItem(equipo);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                              title="Editar equipo"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Evita que el evento se propague a la fila
                                handleTransferItem(equipo);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-100"
                              title="Trasladar equipo"
                            >
                              <ArrowsRightLeftIcon className="h-5 w-5" />
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
        </div>

        {/* Paginación */}
        {!isLoading && filteredAndSortedData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <p className="text-sm text-gray-700 whitespace-nowrap">
                  Mostrando <span className="font-medium">{filteredAndSortedData.length}</span> de <span className="font-medium">{inventarioData.length}</span> equipos
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
        )}

        {/* Modal de Detalles */}
        {selectedEquipo && (
          <ModalDetalles
            equipo={selectedEquipo}
            onClose={() => {
              setSelectedEquipo(null);
              setSelectedTab(0); // Resetear la pestaña seleccionada al cerrar
            }}
            selectedTab={selectedTab}
          />
        )}

        {/* Modal para Agregar Equipo */}
        {showAddModal && (
          <AddInventoryItemModal
            onClose={() => setShowAddModal(false)}
            onSave={handleAddItem}
          />
        )}

        {/* Modal para Editar Equipo */}
        {editingEquipo && (
          <EditInventoryItemModal
            item={editingEquipo.uiItem}
            originalItem={editingEquipo.originalItem}
            onClose={() => setEditingEquipo(null)}
            onSave={handleSaveEdit}
          />
        )}

        {/* Modal para Trasladar Equipo */}
        {transferEquipo && (
          <EquipmentTransferFormModal
              equipmentId={transferEquipo.id}
              equipmentName={`${transferEquipo.serial} - ${transferEquipo.modelo}`}
              sourceCityId={transferEquipo.cityId}
              sourceCityName={transferEquipo.ciudad}
              sourceCompanyId={transferEquipo.companyId}
              sourceCompanyName={transferEquipo.empresa}
              sourceHeadquarterId={transferEquipo.sedeId}
              sourceHeadquarterName={transferEquipo.sede}
              onClose={() => setTransferEquipo(null)}
              onSaveSuccess={handleTransferSuccess}
            />
        )}
      </div>
    </div>
  );
}
