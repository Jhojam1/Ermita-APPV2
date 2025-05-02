import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import maintenanceConfigService, { AutoMaintenanceConfigItem, AutoMaintenanceConfigUI } from '../services/maintenanceConfigService';
import inventoryService from '../services/inventoryService';
import companyService, { Company, Headquarter } from '../services/companyService';

export default function MaintenanceConfig() {
  const [configs, setConfigs] = useState<AutoMaintenanceConfigUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AutoMaintenanceConfigUI | null>(null);
  const [equipmentTypes, setEquipmentTypes] = useState<{id: number, name: string}[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [filteredHeadquarters, setFilteredHeadquarters] = useState<Headquarter[]>([]);
  
  // Formulario para nueva configuración
  const [formData, setFormData] = useState({
    tipoEquipo: '',
    equipmentTypeId: 0,
    intervaloMeses: 3,
    activo: true,
    companyId: 0,
    headquarterId: 0
  });

  useEffect(() => {
    fetchConfigs();
    fetchEquipmentTypes();
    fetchCompanies();
  }, []);

  // Cargar sedes cuando cambia la empresa seleccionada
  useEffect(() => {
    if (formData.companyId > 0) {
      fetchHeadquartersByCompany(formData.companyId);
    } else {
      setFilteredHeadquarters([]);
    }
  }, [formData.companyId]);

  const fetchConfigs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await maintenanceConfigService.getAllConfigs();
      const mappedData = data.map(item => maintenanceConfigService.mapToUI(item));
      setConfigs(mappedData);
    } catch (err) {
      console.error('Error al cargar configuraciones:', err);
      setError('Error al cargar las configuraciones de mantenimiento. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEquipmentTypes = async () => {
    try {
      const types = await inventoryService.getAllTypes();
      setEquipmentTypes(types);
    } catch (err) {
      console.error('Error al cargar tipos de equipo:', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await companyService.getAllCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Error al cargar empresas:', err);
    }
  };

  const fetchHeadquartersByCompany = async (companyId: number) => {
    try {
      const data = await companyService.getHeadquartersByCompanyId(companyId);
      setFilteredHeadquarters(data);
    } catch (err) {
      console.error(`Error al cargar sedes para la empresa ${companyId}:`, err);
    }
  };

  const fetchAllHeadquarters = async () => {
    try {
      const data = await companyService.getAllHeadquarters();
      setHeadquarters(data);
    } catch (err) {
      console.error('Error al cargar todas las sedes:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.companyId === 0 || formData.headquarterId === 0) {
      setError('Debe seleccionar una empresa y una sede');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const configData: AutoMaintenanceConfigItem = {
        equipmentTypeId: formData.equipmentTypeId,
        equipmentTypeName: formData.tipoEquipo,
        monthsInterval: formData.intervaloMeses,
        isActive: formData.activo,
        companyId: formData.companyId,
        headquarterId: formData.headquarterId
      };
      
      console.log('Enviando configuración con datos de empresa y sede:', configData);
      
      if (editingConfig?.id) {
        // Actualizar configuración existente
        await maintenanceConfigService.updateConfig(
          parseInt(editingConfig.id), 
          configData
        );
      } else {
        // Crear nueva configuración
        await maintenanceConfigService.createConfig(configData);
      }
      
      // Recargar datos
      await fetchConfigs();
      
      // Cerrar modal y resetear formulario
      setShowAddModal(false);
      setEditingConfig(null);
      setFormData({
        tipoEquipo: '',
        equipmentTypeId: 0,
        intervaloMeses: 3,
        activo: true,
        companyId: 0,
        headquarterId: 0
      });
      
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setError('Error al guardar la configuración. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar esta configuración?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await maintenanceConfigService.deleteConfig(parseInt(id));
      await fetchConfigs();
    } catch (err) {
      console.error('Error al eliminar configuración:', err);
      setError('Error al eliminar la configuración. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (config: AutoMaintenanceConfigUI) => {
    setEditingConfig(config);
    setFormData({
      tipoEquipo: config.tipoEquipo,
      equipmentTypeId: config.equipmentTypeId || 0,
      intervaloMeses: config.intervaloMeses,
      activo: config.activo,
      companyId: config.companyId || 0,
      headquarterId: config.headquarterId || 0
    });
    
    // Cargar las sedes para la empresa seleccionada
    if (config.companyId) {
      fetchHeadquartersByCompany(config.companyId);
    }
    
    setShowAddModal(true);
  };

  // Manejar cambio de tipo de equipo
  const handleEquipmentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTypeName = e.target.value;
    const selectedType = equipmentTypes.find(type => type.name === selectedTypeName);
    
    setFormData({
      ...formData,
      tipoEquipo: selectedTypeName,
      equipmentTypeId: isNaN(selectedType?.id) ? 0 : selectedType?.id
    });
  };

  // Manejar cambio de empresa
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = parseInt(e.target.value);
    setFormData({
      ...formData,
      companyId,
      headquarterId: 0 // Resetear la sede al cambiar de empresa
    });
  };

  // Manejar cambio de sede
  const handleHeadquarterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const headquarterId = parseInt(e.target.value);
    setFormData({
      ...formData,
      headquarterId
    });
  };

  // Filtrar configuraciones según búsqueda
  const filteredConfigs = configs.filter(config => 
    config.tipoEquipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header y Búsqueda */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-light tracking-tight text-gray-900">
          Configuración de <span className="font-medium">Mantenimientos Automáticos</span>
        </h1>
        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Buscar configuración..."
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
            onClick={() => {
              setEditingConfig(null);
              setFormData({
                tipoEquipo: '',
                equipmentTypeId: 0,
                intervaloMeses: 3,
                activo: true,
                companyId: 0,
                headquarterId: 0
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors duration-200">
            <PlusIcon className="h-5 w-5 inline-block mr-1" />
            Nueva Configuración
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Tabla de Configuraciones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando configuraciones...</div>
        ) : filteredConfigs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron configuraciones de mantenimiento automático</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de Equipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Intervalo (Meses)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConfigs.map((config) => (
                  <tr key={config.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {config.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {config.tipoEquipo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {config.intervaloMeses} meses
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                      ${config.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {config.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                      <button
                        onClick={() => handleEdit(config)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(config.id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Añadir/Editar Configuración */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">
                  {editingConfig ? 'Editar Configuración' : 'Nueva Configuración'}
                </h3>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingConfig(null);
                  }} 
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Selección de Empresa */}
                  <div>
                    <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa
                    </label>
                    <select
                      id="companyId"
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900
                             focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="0">Seleccione una empresa</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Selección de Sede */}
                  <div>
                    <label htmlFor="headquarterId" className="block text-sm font-medium text-gray-700 mb-1">
                      Sede
                    </label>
                    <select
                      id="headquarterId"
                      name="headquarterId"
                      value={formData.headquarterId}
                      onChange={handleHeadquarterChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900
                             focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={formData.companyId === 0}
                    >
                      <option value="0">Seleccione una sede</option>
                      {filteredHeadquarters.map(headquarter => (
                        <option key={headquarter.id} value={headquarter.id}>
                          {headquarter.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Selección de Tipo de Equipo */}
                  <div>
                    <label htmlFor="tipoEquipo" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Equipo
                    </label>
                    <select
                      id="tipoEquipo"
                      name="tipoEquipo"
                      value={formData.tipoEquipo}
                      onChange={handleEquipmentTypeChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900
                             focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccione un tipo</option>
                      {equipmentTypes.map(type => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Intervalo de Mantenimiento */}
                  <div>
                    <label htmlFor="intervaloMeses" className="block text-sm font-medium text-gray-700 mb-1">
                      Intervalo de Mantenimiento (Meses)
                    </label>
                    <input
                      type="number"
                      id="intervaloMeses"
                      name="intervaloMeses"
                      min="1"
                      max="24"
                      value={formData.intervaloMeses}
                      onChange={(e) => setFormData({ ...formData, intervaloMeses: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900
                             focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Configuración Activa */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activo"
                      name="activo"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                      Configuración Activa
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingConfig(null);
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
                    {isLoading ? 'Guardando...' : 'Guardar'}
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
