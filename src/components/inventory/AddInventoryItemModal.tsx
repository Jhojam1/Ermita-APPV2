import { useState, useEffect } from 'react';
import { XMarkIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import inventoryService, { InventoryItem, Brand, TypeInventoryItem } from '../../services/inventoryService';
import companyService, { Company, Headquarter } from '../../services/companyService';
import ManageBrandsModal from './ManageBrandsModal';
import ManageTypesModal from './ManageTypesModal';

interface AddInventoryItemModalProps {
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}

export default function AddInventoryItemModal({ onClose, onSave }: AddInventoryItemModalProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [types, setTypes] = useState<TypeInventoryItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBrandsModal, setShowBrandsModal] = useState(false);
  const [showTypesModal, setShowTypesModal] = useState(false);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    companyId: undefined,
    sedeId: undefined,
    responsible: '',
    service: '',
    serial: '',
    internalCode: undefined,
    brand: { name: '' },
    model: '',
    processor: '',
    ramMemory: '',
    hardDrive: '',
    typeInventoryItem: { name: '' },
    quantity: 1,
    status: 'Activo'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [brandsData, typesData, companiesData] = await Promise.all([
          inventoryService.getAllBrands(),
          inventoryService.getAllTypes(),
          companyService.getAllCompanies()
        ]);
        setBrands(brandsData);
        setTypes(typesData);
        setCompanies(companiesData);
      } catch (error) {
        console.error('Error al cargar datos para el formulario:', error);
        // Si falla la carga de datos reales, usar datos de ejemplo
        setBrands([
          { id: 1, name: 'Dell' },
          { id: 2, name: 'HP' },
          { id: 3, name: 'Lenovo' }
        ]);
        setTypes([
          { id: 1, name: 'Laptop' },
          { id: 2, name: 'Desktop' },
          { id: 3, name: 'Servidor' }
        ]);
        setCompanies([
          { id: 1, name: 'TechCorp' },
          { id: 2, name: 'MediSalud' },
          { id: 3, name: 'EducaPlus' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
          // Datos de ejemplo en caso de error
          setHeadquarters([
            { id: 1, name: 'Sede Principal', companyId: formData.companyId },
            { id: 2, name: 'Sede Norte', companyId: formData.companyId }
          ]);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
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
    } else if (name === 'companyId' || name === 'sedeId') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseInt(value) : undefined
      }));
    } else if (name === 'internalCode') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseInt(value) : undefined
      }));
    } else if (name === 'quantity') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : 1
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
      // Validar campos requeridos
      if (!formData.serial || !formData.brand?.name || !formData.typeInventoryItem?.name || 
          !formData.companyId || !formData.sedeId) {
        alert('Por favor complete todos los campos requeridos');
        setIsLoading(false);
        return;
      }

      // Preparar el objeto para enviar al API
      const newItem: InventoryItem = {
        companyId: formData.companyId!,
        sedeId: formData.sedeId!,
        responsible: formData.responsible || '',
        service: formData.service || '',
        serial: formData.serial || '',
        internalCode: formData.internalCode,
        brand: formData.brand as Brand,
        model: formData.model || '',
        processor: formData.processor || '',
        ramMemory: formData.ramMemory || '',
        hardDrive: formData.hardDrive || '',
        typeInventoryItem: formData.typeInventoryItem as TypeInventoryItem,
        quantity: formData.quantity || 1,
        status: formData.status || 'Activo'
      };

      // Enviar los datos al API
      const savedItem = await inventoryService.createItem(newItem);
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
            {/* Empresa y Sede */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500">Ubicación</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    type="number"
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
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity || 1}
                    min="1"
                    step="1"
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
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
    </div>
  );
}
