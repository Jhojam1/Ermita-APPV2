import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import inventoryService, { InventoryItem } from '../../services/inventoryService';

interface EditInventoryItemModalProps {
  item: any; // El item a editar (ya mapeado a la UI)
  originalItem: InventoryItem; // El item original con la estructura del backend
  onClose: () => void;
  onSave: (updatedItem: any) => void;
}

export default function EditInventoryItemModal({ item, originalItem, onClose, onSave }: EditInventoryItemModalProps) {
  const [formData, setFormData] = useState({
    responsible: originalItem.responsible || '',
    service: originalItem.service || '',
    ramMemory: originalItem.ramMemory || '',
    hardDrive: originalItem.hardDrive || '',
    status: originalItem.status || 'Activo'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Crear objeto con solo los campos que se pueden editar
      const updateData: Partial<InventoryItem> = {
        responsible: formData.responsible,
        service: formData.service,
        ramMemory: formData.ramMemory,
        hardDrive: formData.hardDrive,
        status: formData.status
      };

      console.log('Enviando datos para actualizar:', updateData);
      
      // Enviar al API
      const updatedItemFromServer = await inventoryService.updateItem(originalItem.id!, updateData);
      console.log('Respuesta del servidor:', updatedItemFromServer);
      
      // Actualizar la UI con los datos actualizados
      const updatedItem = {
        ...item,
        responsable: formData.responsible,
        servicio: formData.service,
        ram: formData.ramMemory,
        disco: formData.hardDrive,
        estado: formData.status
      };
      
      onSave(updatedItem);
      onClose();
    } catch (error) {
      console.error('Error al actualizar el elemento:', error);
      setError('Ocurrió un error al guardar los cambios. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-gray-900">Editar Equipo</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-4">Información del Equipo</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm"><span className="font-medium">Serial:</span> {item.serial}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm"><span className="font-medium">Código:</span> {item.codigoInterno}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm"><span className="font-medium">Empresa:</span> {item.empresa}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm"><span className="font-medium">Sede:</span> {item.sede}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm"><span className="font-medium">Marca:</span> {item.marca}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm"><span className="font-medium">Modelo:</span> {item.modelo}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm"><span className="font-medium">Procesador:</span> {item.procesador}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm"><span className="font-medium">Tipo:</span> {item.tipo}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500">Campos Editables</h4>
              
              <div>
                <label htmlFor="responsible" className="block text-sm font-medium text-gray-700 mb-1">
                  Responsable
                </label>
                <input
                  type="text"
                  id="responsible"
                  name="responsible"
                  value={formData.responsible}
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
                  value={formData.service}
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
                  value={formData.ramMemory}
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
                  value={formData.hardDrive}
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
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
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
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
