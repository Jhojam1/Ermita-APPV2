import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import companyService, { CompanyCity, City } from '../../services/companyService';

interface ManageCompanyCitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  companyName: string;
  onUpdate: () => void;
}

export default function ManageCompanyCitiesModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  onUpdate
}: ManageCompanyCitiesModalProps) {
  const [companyCities, setCompanyCities] = useState<CompanyCity[]>([]);
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number>(0);
  const [isPrimary, setIsPrimary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, companyId]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cities, allCities] = await Promise.all([
        companyService.getCitiesByCompany(companyId),
        companyService.getAllCities()
      ]);
      
      setCompanyCities(cities);
      
      // Filtrar ciudades que ya están asignadas
      const assignedCityIds = cities.map(cc => cc.cityId);
      const available = allCities.filter(city => !assignedCityIds.includes(city.id) && city.active);
      setAvailableCities(available);
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCity = async () => {
    if (!selectedCityId) {
      setError('Seleccione una ciudad');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await companyService.addCityToCompany(companyId, selectedCityId, isPrimary);
      setSelectedCityId(0);
      setIsPrimary(false);
      await loadData();
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al agregar ciudad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrimary = async (cityId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await companyService.setPrimaryCity(companyId, cityId);
      await loadData();
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al marcar ciudad como principal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCity = async (cityId: number) => {
    if (!confirm('¿Está seguro de remover esta ciudad?')) return;

    setIsLoading(true);
    setError(null);
    try {
      await companyService.removeCityFromCompany(companyId, cityId);
      await loadData();
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al remover ciudad');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Gestionar Ciudades - {companyName}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Agregar nueva ciudad */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Agregar Ciudad</h4>
          <div className="flex gap-3">
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(Number(e.target.value))}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value={0}>Seleccione una ciudad</option>
              {availableCities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name} - {city.department}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700">Principal</span>
            </label>
            <button
              onClick={handleAddCity}
              disabled={isLoading || !selectedCityId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Agregar
            </button>
          </div>
        </div>

        {/* Lista de ciudades */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Ciudades Actuales ({companyCities.length})
          </h4>
          {isLoading && companyCities.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Cargando...</div>
          ) : companyCities.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No hay ciudades asignadas
            </div>
          ) : (
            <div className="space-y-2">
              {companyCities.map(cc => (
                <div
                  key={cc.id}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSetPrimary(cc.cityId)}
                      disabled={isLoading || cc.isPrimary}
                      className="text-yellow-500 hover:text-yellow-600 disabled:opacity-50"
                      title={cc.isPrimary ? 'Ciudad principal' : 'Marcar como principal'}
                    >
                      {cc.isPrimary ? (
                        <StarIconSolid className="h-6 w-6" />
                      ) : (
                        <StarIcon className="h-6 w-6" />
                      )}
                    </button>
                    <div>
                      <div className="font-medium text-gray-900">
                        {cc.cityName}
                        {cc.isPrimary && (
                          <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Principal
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{cc.department}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCity(cc.cityId)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    title="Remover ciudad"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
