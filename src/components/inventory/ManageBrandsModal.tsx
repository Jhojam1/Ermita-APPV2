import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import inventoryService, { Brand } from '../../services/inventoryService';

interface ManageBrandsModalProps {
  onClose: () => void;
  onBrandAdded: (brand: Brand) => void;
}

export default function ManageBrandsModal({ onClose, onBrandAdded }: ManageBrandsModalProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const brandsData = await inventoryService.getAllBrands();
      setBrands(brandsData);
    } catch (error) {
      console.error('Error al cargar marcas:', error);
      setError('No se pudieron cargar las marcas. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      setError('El nombre de la marca no puede estar vacío');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newBrand = await inventoryService.createBrand({ name: newBrandName });
      setBrands([...brands, newBrand]);
      setNewBrandName('');
      onBrandAdded(newBrand);
    } catch (error) {
      console.error('Error al crear marca:', error);
      setError('No se pudo crear la marca. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta marca?')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await inventoryService.deleteBrand(id);
      setBrands(brands.filter(brand => brand.id !== id));
    } catch (error) {
      console.error('Error al eliminar marca:', error);
      setError('No se pudo eliminar la marca. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-gray-900">Gestionar Marcas</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Marca
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="brandName"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre de la marca"
              />
              <button
                onClick={handleAddBrand}
                disabled={isLoading || !newBrandName.trim()}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Añadir
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Marcas Existentes</h4>
            
            {isLoading && brands.length === 0 ? (
              <div className="text-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando marcas...</p>
              </div>
            ) : brands.length === 0 ? (
              <p className="text-center py-4 text-sm text-gray-500">No hay marcas registradas</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {brands.map((brand) => (
                  <li key={brand.id} className="py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{brand.name}</span>
                    <button
                      onClick={() => brand.id && handleDeleteBrand(brand.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Eliminar marca"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
