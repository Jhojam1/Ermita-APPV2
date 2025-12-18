import { useState, useEffect } from 'react';
import { XMarkIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import inventoryService, { InventoryItem, Brand, TypeInventoryItem, EquipmentStatus } from '../../services/inventoryService';
import companyService, { City, Company, Headquarter } from '../../services/companyService';
import { getCurrentUser } from '../../services/authService';
import ManageBrandsModal from './ManageBrandsModal';
import ManageTypesModal from './ManageTypesModal';
import ManageEquipmentStatusModal from './ManageEquipmentStatusModal';

interface AddInventoryItemModalProps {
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}

export default function AddInventoryItemModal({ onClose, onSave }: AddInventoryItemModalProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [types, setTypes] = useState<TypeInventoryItem[]>([]);
  const [equipmentStatuses, setEquipmentStatuses] = useState<EquipmentStatus[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBrandsModal, setShowBrandsModal] = useState(false);
  const [showTypesModal, setShowTypesModal] = useState(false);
  const [showEquipmentStatusModal, setShowEquipmentStatusModal] = useState(false);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    cityId: undefined,
    companyId: undefined,
    sedeId: undefined,
    responsible: '',
    service: '',
    program: '',
    equipmentName: '',
    serial: '',
    internalCode: '',
    brand: { name: '' },
    model: '',
    processor: '',
    ramMemory: '',
    hardDrive: '',
    monitor: '',
    typeInventoryItem: { name: '' },
    status: 'Activo',
    equipmentStatus: undefined,
    lastMaintenanceDate: '',
    purchaseDate: '',
    anyDeskId: '',
    email: '',
    observations: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [brandsData, typesData, equipmentStatusesData, citiesData, companiesData] = await Promise.all([
          inventoryService.getAllBrands(),
          inventoryService.getAllTypes(),
          inventoryService.getAllEquipmentStatuses(),
          companyService.getAllCities(),
          companyService.getAllCompanies()
        ]);
        setBrands(brandsData);
        setTypes(typesData);
        setEquipmentStatuses(equipmentStatusesData);
        setCities(citiesData);
        setCompanies(companiesData);
      } catch (error) {
        console.error('Error al cargar datos para el formulario:', error);
        alert('Error al cargar los datos necesarios para el formulario. Por favor, recargue la página e intente nuevamente.');
        onClose(); // Cerrar el modal si no se pueden cargar los datos
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Actualizar empresas cuando cambia la ciudad
  useEffect(() => {
    const fetchCompaniesByCity = async () => {
      if (formData.cityId) {
        try {
          setIsLoading(true);
          const companiesData = await companyService.getCompaniesByCity(formData.cityId);
          setCompanies(companiesData);
          
          // Si la empresa actual no pertenece a la ciudad seleccionada, resetearla
          if (formData.companyId && !companiesData.some(comp => comp.id === formData.companyId)) {
            setFormData(prev => ({ 
              ...prev, 
              companyId: undefined,
              sedeId: undefined 
            }));
          }
        } catch (error) {
          console.error(`Error al obtener empresas para la ciudad ${formData.cityId}:`, error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Si no hay ciudad seleccionada, mostrar todas las empresas
        companyService.getAllCompanies().then(setCompanies).catch(console.error);
        setFormData(prev => ({ 
          ...prev, 
          companyId: undefined,
          sedeId: undefined 
        }));
      }
    };

    fetchCompaniesByCity();
  }, [formData.cityId]);

  // Actualizar sedes cuando cambia la empresa
  useEffect(() => {
    const fetchHeadquarters = async () => {
      if (formData.companyId) {
        try {
          setIsLoading(true);
          const headquartersData = await companyService.getHeadquartersByCompanyId(formData.companyId);
          setHeadquarters(headquartersData);
          
          // Si la sede actual no pertenece a la empresa seleccionada, resetearla
          if (formData.sedeId && !headquartersData.some(hq => hq.id === formData.sedeId)) {
            setFormData(prev => ({ ...prev, sedeId: undefined }));
          }
        } catch (error) {
          console.error(`Error al obtener sedes para la empresa ${formData.companyId}:`, error);
          setHeadquarters([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setHeadquarters([]);
        setFormData(prev => ({ ...prev, sedeId: undefined }));
      }
    };

    fetchHeadquarters();
  }, [formData.companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`🔄 handleChange - Campo: ${name}, Valor: ${value}`);
    
    if (name === 'brandId') {
      const selectedBrand = brands.find(brand => brand.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        brand: selectedBrand || { name: '' }
      }));
    } else if (name === 'typeId') {
      const selectedType = types.find(type => type.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        typeInventoryItem: selectedType || { name: '' }
      }));
    } else if (name === 'equipmentStatusId') {
      const selectedStatus = equipmentStatuses.find(status => status.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        equipmentStatus: selectedStatus || undefined
      }));
    } else if (name === 'cityId') {
      const cityId = value ? parseInt(value) : undefined;
      console.log(`🏙️ Seleccionando ciudad - ID: ${cityId}`);
      setFormData(prev => ({
        ...prev,
        cityId: cityId,
        companyId: undefined, // Reset company when city changes
        sedeId: undefined // Reset headquarter when city changes
      }));
    } else if (name === 'companyId') {
      const companyId = value ? parseInt(value) : undefined;
      console.log(`🏢 Seleccionando empresa - ID: ${companyId}`);
      setFormData(prev => ({
        ...prev,
        companyId: companyId,
        sedeId: undefined // Reset headquarter when company changes
      }));
    } else if (name === 'sedeId') {
      const sedeId = value ? parseInt(value) : undefined;
      console.log(`🏥 Seleccionando sede - ID: ${sedeId}`);
      setFormData(prev => ({
        ...prev,
        sedeId: sedeId
      }));
    } else if (name === 'internalCode') {
      setFormData(prev => ({
        ...prev,
        [name]: value || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('📝 Estado del formulario antes de enviar:', formData);
      console.log('🔍 Validando campos requeridos...');
      console.log('  - cityId:', formData.cityId);
      console.log('  - companyId:', formData.companyId);
      console.log('  - sedeId:', formData.sedeId);
      
      // Validar campos requeridos
      if (!formData.serial || !formData.brand?.name || !formData.typeInventoryItem?.name || 
          !formData.cityId || !formData.companyId || !formData.sedeId) {
        console.log('❌ Validación fallida - campos faltantes');
        alert('Por favor complete todos los campos requeridos');
        setIsLoading(false);
        return;
      }

      // Obtener los nombres de ciudad, empresa y sede
      const selectedCity = cities.find(city => city.id === formData.cityId);
      const selectedCompany = companies.find(company => company.id === formData.companyId);
      const selectedHeadquarter = headquarters.find(hq => hq.id === formData.sedeId);

      console.log('🔍 Objetos encontrados:');
      console.log('  - selectedCity:', selectedCity);
      console.log('  - selectedCompany:', selectedCompany);
      console.log('  - selectedHeadquarter:', selectedHeadquarter);

      // Obtener el usuario actual para guardar quién creó el equipo
      const currentUser = getCurrentUser();
      
      // Convertir purchaseDate a formato LocalDateTime si existe
      let purchaseDateFormatted = undefined;
      if (formData.purchaseDate) {
        purchaseDateFormatted = `${formData.purchaseDate}T00:00:00`;
      }

      // Convertir lastMaintenanceDate a formato LocalDateTime si existe
      let lastMaintenanceDateFormatted = undefined;
      if (formData.lastMaintenanceDate) {
        lastMaintenanceDateFormatted = `${formData.lastMaintenanceDate}T00:00:00`;
      }
      
      // Preparar el objeto para enviar al API
      const newItem: InventoryItem = {
        cityId: formData.cityId!,
        cityName: selectedCity?.name || '',
        companyId: formData.companyId!,
        companyName: selectedCompany?.name || '',
        sedeId: formData.sedeId!,
        sedeName: selectedHeadquarter?.name || '',
        responsible: formData.responsible || '',
        service: formData.service || '',
        program: formData.program,
        equipmentName: formData.equipmentName,
        serial: formData.serial || '',
        internalCode: formData.internalCode,
        brand: formData.brand as Brand,
        model: formData.model || '',
        processor: formData.processor || '',
        ramMemory: formData.ramMemory || '',
        hardDrive: formData.hardDrive || '',
        monitor: formData.monitor,
        typeInventoryItem: formData.typeInventoryItem as TypeInventoryItem,
        quantity: 1, // Siempre será 1
        status: formData.status || 'Activo',
        equipmentStatus: formData.equipmentStatus,
        lastMaintenanceDate: lastMaintenanceDateFormatted,
        purchaseDate: purchaseDateFormatted,
        anyDeskId: formData.anyDeskId,
        email: formData.email,
        observations: formData.observations,
        createdByUserId: currentUser?.id
      };

      console.log('📤 Objeto que se enviará al API:', newItem);

      // Enviar los datos al API
      const savedItem = await inventoryService.createItem(newItem);
      console.log('✅ Respuesta del API:', savedItem);
      onSave(savedItem);
      onClose();
    } catch (error) {
      console.error('Error al guardar el elemento de inventario:', error);
      alert('Ocurrió un error al guardar. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandAdded = (newBrand: Brand) => {
    setBrands(prev => [...prev, newBrand]);
  };

  const handleTypeAdded = (newType: TypeInventoryItem) => {
    setTypes(prev => [...prev, newType]);
  };

  const handleEquipmentStatusAdded = (newStatus: EquipmentStatus) => {
    setEquipmentStatuses(prev => [...prev, newStatus]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-gray-900">Agregar Nuevo Equipo</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ciudad, Empresa y Sede */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500">Ubicación</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="cityId" className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="cityId"
                    name="cityId"
                    value={formData.cityId || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar ciudad</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name} - {city.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="companyId"
                    name="companyId"
                    value={formData.companyId || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar empresa</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="sedeId" className="block text-sm font-medium text-gray-700 mb-1">
                    Sede <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="sedeId"
                    name="sedeId"
                    value={formData.sedeId || ''}
                    onChange={handleChange}
                    required
                    disabled={!formData.companyId || isLoading}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Seleccionar sede</option>
                    {headquarters.map(hq => (
                      <option key={hq.id} value={hq.id}>
                        {hq.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-500">Información Básica</h4>
                
                <div>
                  <label htmlFor="serial" className="block text-sm font-medium text-gray-700 mb-1">
                    Serial <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="serial"
                    name="serial"
                    value={formData.serial || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="internalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Código Activo Fijo
                  </label>
                  <input
                    type="text"
                    id="internalCode"
                    name="internalCode"
                    value={formData.internalCode || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="brandId" className="block text-sm font-medium text-gray-700">
                      Marca <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowBrandsModal(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      <PlusCircleIcon className="h-4 w-4 mr-1" />
                      Gestionar marcas
                    </button>
                  </div>
                  <select
                    id="brandId"
                    name="brandId"
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar marca</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="typeId" className="block text-sm font-medium text-gray-700">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTypesModal(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      <PlusCircleIcon className="h-4 w-4 mr-1" />
                      Gestionar tipos
                    </button>
                  </div>
                  <select
                    id="typeId"
                    name="typeId"
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar tipo</option>
                    {types.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="equipmentStatusId" className="block text-sm font-medium text-gray-700">
                      Estado del Equipo
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowEquipmentStatusModal(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      <PlusCircleIcon className="h-4 w-4 mr-1" />
                      Gestionar estados
                    </button>
                  </div>
                  <select
                    id="equipmentStatusId"
                    name="equipmentStatusId"
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar estado</option>
                    {equipmentStatuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Especificaciones */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-500">Especificaciones</h4>
                
                <div>
                  <label htmlFor="processor" className="block text-sm font-medium text-gray-700 mb-1">
                    Procesador
                  </label>
                  <input
                    type="text"
                    id="processor"
                    name="processor"
                    value={formData.processor || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="ramMemory" className="block text-sm font-medium text-gray-700 mb-1">
                    Memoria RAM
                  </label>
                  <input
                    type="text"
                    id="ramMemory"
                    name="ramMemory"
                    value={formData.ramMemory || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="hardDrive" className="block text-sm font-medium text-gray-700 mb-1">
                    Disco Duro
                  </label>
                  <input
                    type="text"
                    id="hardDrive"
                    name="hardDrive"
                    value={formData.hardDrive || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="monitor" className="block text-sm font-medium text-gray-700 mb-1">
                    Monitor / Pantalla
                  </label>
                  <input
                    type="text"
                    id="monitor"
                    name="monitor"
                    value={formData.monitor || ''}
                    onChange={handleChange}
                    placeholder="Ej: 15 pulgadas"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status || 'Activo'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Asignación */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500">Asignación</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="responsible" className="block text-sm font-medium text-gray-700 mb-1">
                    Responsable
                  </label>
                  <input
                    type="text"
                    id="responsible"
                    name="responsible"
                    value={formData.responsible || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                    Servicio
                  </label>
                  <input
                    type="text"
                    id="service"
                    name="service"
                    value={formData.service || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
                    Programa
                  </label>
                  <input
                    type="text"
                    id="program"
                    name="program"
                    value={formData.program || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="equipmentName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Equipo
                  </label>
                  <input
                    type="text"
                    id="equipmentName"
                    name="equipmentName"
                    value={formData.equipmentName || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Compra
                  </label>
                  <input
                    type="date"
                    id="purchaseDate"
                    name="purchaseDate"
                    value={formData.purchaseDate || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="lastMaintenanceDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Última Fecha de Mantenimiento
                  </label>
                  <input
                    type="date"
                    id="lastMaintenanceDate"
                    name="lastMaintenanceDate"
                    value={formData.lastMaintenanceDate || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="anyDeskId" className="block text-sm font-medium text-gray-700 mb-1">
                    ID AnyDesk
                  </label>
                  <input
                    type="text"
                    id="anyDeskId"
                    name="anyDeskId"
                    value={formData.anyDeskId || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    id="observations"
                    name="observations"
                    value={formData.observations || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showBrandsModal && (
        <ManageBrandsModal
          onClose={() => setShowBrandsModal(false)}
          onBrandAdded={handleBrandAdded}
        />
      )}

      {showTypesModal && (
        <ManageTypesModal
          onClose={() => setShowTypesModal(false)}
          onTypeAdded={handleTypeAdded}
        />
      )}

      {showEquipmentStatusModal && (
        <ManageEquipmentStatusModal
          onClose={() => setShowEquipmentStatusModal(false)}
          onStatusAdded={handleEquipmentStatusAdded}
        />
      )}
    </div>
  );
}
