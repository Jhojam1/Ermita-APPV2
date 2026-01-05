import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import companyService, { HeadquarterCompany, Company } from '../../services/companyService';

interface ManageHeadquarterCompaniesModalProps {
  isOpen: boolean;
  onClose: () => void;
  headquarterId: number;
  headquarterName: string;
  onUpdate: () => void;
}

export default function ManageHeadquarterCompaniesModal({
  isOpen,
  onClose,
  headquarterId,
  headquarterName,
  onUpdate
}: ManageHeadquarterCompaniesModalProps) {
  const [headquarterCompanies, setHeadquarterCompanies] = useState<HeadquarterCompany[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, headquarterId]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [companies, allCompanies] = await Promise.all([
        companyService.getCompaniesByHeadquarter(headquarterId),
        companyService.getAllCompanies()
      ]);
      
      setHeadquarterCompanies(companies);
      
      // Filtrar empresas que ya están asignadas
      const assignedCompanyIds = companies.map(hc => hc.companyId);
      const available = allCompanies.filter(comp => !assignedCompanyIds.includes(comp.id) && comp.active);
      setAvailableCompanies(available);
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompany = async () => {
    if (!selectedCompanyId) {
      setError('Seleccione una empresa');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await companyService.addCompanyToHeadquarter(headquarterId, selectedCompanyId);
      setSelectedCompanyId(0);
      await loadData();
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al agregar empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCompany = async (companyId: number) => {
    if (!confirm('¿Está seguro de remover esta empresa de la sede?')) return;

    setIsLoading(true);
    setError(null);
    try {
      await companyService.removeCompanyFromHeadquarter(headquarterId, companyId);
      await loadData();
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al remover empresa');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Gestionar Empresas - {headquarterName}
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

        {/* Agregar nueva empresa */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Agregar Empresa</h4>
          <div className="flex gap-3">
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value={0}>Seleccione una empresa</option>
              {availableCompanies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddCompany}
              disabled={isLoading || !selectedCompanyId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Agregar
            </button>
          </div>
        </div>

        {/* Lista de empresas */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Empresas en esta Sede ({headquarterCompanies.length})
          </h4>
          {isLoading && headquarterCompanies.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Cargando...</div>
          ) : headquarterCompanies.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No hay empresas en esta sede
            </div>
          ) : (
            <div className="space-y-2">
              {headquarterCompanies.map(hc => (
                <div
                  key={hc.id}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">{hc.companyName}</div>
                  <button
                    onClick={() => handleRemoveCompany(hc.companyId)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    title="Remover empresa"
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
