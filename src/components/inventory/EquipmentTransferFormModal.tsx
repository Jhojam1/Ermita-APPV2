import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import inventoryTransferService from '../../services/InventoryTransferService';
import companyService from '../../services/CompanyService';

interface Props {
  equipmentId: number;
  equipmentName: string;
  sourceCompanyId: number;
  sourceCompanyName: string;
  sourceHeadquarterId: number;
  sourceHeadquarterName: string;
  onClose: () => void;
  onSaveSuccess: () => void;
}

interface Company {
  id: number;
  name: string;
  headquarters: Headquarter[];
}

interface Headquarter {
  id: number;
  name: string;
}

const EquipmentTransferFormModal: React.FC<Props> = ({
  equipmentId,
  equipmentName,
  sourceCompanyId,
  sourceCompanyName,
  sourceHeadquarterId,
  sourceHeadquarterName,
  onClose,
  onSaveSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [formData, setFormData] = useState({
    destinationCompanyId: '',
    destinationHeadquarterId: '',
    reason: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyService.getAllCompanies();
        // El método getAllCompanies ya retorna directamente los datos, no response.data
        setCompanies(response || []);
      } catch (error) {
        console.error('Error al cargar las empresas:', error);
        setErrorMsg('Error al cargar las empresas.');
        setCompanies([]); // Inicializar con array vacío en caso de error
      }
    };

    fetchCompanies();
  }, []);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    
    setFormData({
      ...formData,
      destinationCompanyId: companyId,
      destinationHeadquarterId: ''
    });
    
    if (companyId) {
      const selectedCompany = companies.find(c => c.id.toString() === companyId);
      
      if (selectedCompany && selectedCompany.headquarters) {
        // Si la empresa ya tiene las sedes cargadas
        setHeadquarters(selectedCompany.headquarters);
      } else {
        // Si necesitamos cargar las sedes desde la API
        fetchHeadquartersForCompany(parseInt(companyId));
      }
    } else {
      // Si no se selecciona ninguna empresa, limpiar sedes
      setHeadquarters([]);
    }
  };
  
  // Función para cargar las sedes de una empresa
  const fetchHeadquartersForCompany = async (companyId: number) => {
    try {
      const response = await companyService.getHeadquartersByCompanyId(companyId);
      setHeadquarters(response || []);
    } catch (error) {
      console.error(`Error al cargar las sedes para la empresa ${companyId}:`, error);
      setErrorMsg('Error al cargar las sedes para la empresa seleccionada.');
      setHeadquarters([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    // Validación básica
    if (!formData.destinationCompanyId || !formData.destinationHeadquarterId || !formData.reason) {
      setErrorMsg('Por favor, complete todos los campos obligatorios.');
      setLoading(false);
      return;
    }
    
    // Obtener los nombres de la empresa y sede de destino
    const destinationCompany = companies.find(c => c.id.toString() === formData.destinationCompanyId);
    const destinationHeadquarter = headquarters.find(h => h.id.toString() === formData.destinationHeadquarterId);

    try {
      // Usar los datos de origen que vienen como props
      const sourceCompId = parseInt(String(sourceCompanyId)) || 0;
      const sourceHeadId = parseInt(String(sourceHeadquarterId)) || 0;
      const sourceCmpName = sourceCompanyName || "Empresa desconocida";
      const sourceHeadName = sourceHeadquarterName || "Sede desconocida";
      
      // Log para depuración
      console.log('Datos de origen:', {
        sourceCompId, 
        sourceCmpName,
        sourceHeadId,
        sourceHeadName
      });
      
      const transferData = {
        // Datos de movimiento general
        inventoryItemId: equipmentId,
        quantity: 1, // Para equipos individuales
        reason: formData.reason,
        description: formData.reason, // Usar el motivo como descripción
        type: "Traslado", // Especificar explícitamente el tipo de movimiento
        
        // Datos de origen con valores por defecto si faltan
        sourceCompanyId: sourceCompId,
        sourceCompanyName: sourceCmpName,
        sourceHeadquarterId: sourceHeadId,
        sourceHeadquarterName: sourceHeadName,
        
        // Datos de destino
        destinationCompanyId: parseInt(formData.destinationCompanyId),
        destinationCompanyName: destinationCompany?.name || "Empresa destino",
        destinationHeadquarterId: parseInt(formData.destinationHeadquarterId),
        destinationHeadquarterName: destinationHeadquarter?.name || "Sede destino"
      };

      await inventoryTransferService.createTransfer(transferData);
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error('Error al registrar el traslado:', error);
      setErrorMsg('Error al registrar el traslado. Inténtelo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Trasladar Equipo
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4">
              {errorMsg && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {errorMsg}
                </div>
              )}
              
              <div className="mb-4">
                <div className="font-medium text-gray-700 mb-1">Equipo a trasladar:</div>
                <div className="p-3 bg-gray-50 rounded-md">
                  {equipmentName}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Ubicación Actual</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-500">Empresa:</div>
                  <div className="text-gray-900">{sourceCompanyName}</div>
                  <div className="text-gray-500">Sede:</div>
                  <div className="text-gray-900">{sourceHeadquarterName}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Empresa de Destino<span className="text-red-500">*</span>
                </label>
                <select
                  name="destinationCompanyId"
                  value={formData.destinationCompanyId}
                  onChange={handleCompanyChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccione empresa de destino</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Sede de Destino<span className="text-red-500">*</span>
                </label>
                <select
                  name="destinationHeadquarterId"
                  value={formData.destinationHeadquarterId}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!formData.destinationCompanyId}
                >
                  <option value="">Seleccione sede de destino</option>
                  {headquarters.map(headquarters => (
                    <option key={headquarters.id} value={headquarters.id}>{headquarters.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Motivo del Traslado<span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Indique el motivo del traslado"
                  required
                />
              </div>
            
              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {loading ? 'Guardando...' : 'Registrar Traslado'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentTransferFormModal;
