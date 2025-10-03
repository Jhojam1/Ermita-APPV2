import { useState, useEffect } from 'react';
import { 
  UserIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  MagnifyingGlassIcon,
  UserPlusIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';
import technicianAssignmentService, { 
  MaintenanceAssignment, 
  TechnicianUser
} from '../../services/technicianAssignmentService';
import maintenanceService from '../../services/maintenanceService';

export default function TechnicianAssignmentManager() {
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [unassignedMaintenances, setUnassignedMaintenances] = useState<MaintenanceAssignment[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMaintenances, setSelectedMaintenances] = useState<number[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [technicianSearchTerm, setTechnicianSearchTerm] = useState('');

  // Obtener datos del usuario actual
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const companyId = user?.idcompany || 1;
  const headquarterId = user?.idheadquarter || 1;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar datos en paralelo
      const [
        allMaintenancesData,
        unassignedData,
        techniciansData
      ] = await Promise.all([
        maintenanceService.getAllMaintenances(),
        technicianAssignmentService.getUnassignedMaintenances(companyId, headquarterId),
        technicianAssignmentService.getTechnicians()
      ]);

      setMaintenances(allMaintenancesData);
      setUnassignedMaintenances(unassignedData);
      setTechnicians(techniciansData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTechnician = async (maintenanceId: number, technician: TechnicianUser) => {
    try {
      await technicianAssignmentService.assignTechnician(
        maintenanceId, 
        technician.id, 
        technician.fullName
      );
      
      // Recargar datos
      await loadData();
      setShowAssignModal(false);
      setSelectedTechnician(null);
    } catch (error) {
      console.error('Error asignando técnico:', error);
      alert('Error al asignar técnico. Por favor, inténtalo de nuevo.');
    }
  };

  const handleUnassignTechnician = async (maintenanceId: number) => {
    if (confirm('¿Estás seguro de que quieres desasignar este técnico?')) {
      try {
        await technicianAssignmentService.unassignTechnician(maintenanceId);
        await loadData();
      } catch (error) {
        console.error('Error desasignando técnico:', error);
        alert('Error al desasignar técnico. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedTechnician || selectedMaintenances.length === 0) {
      alert('Selecciona un técnico y al menos un mantenimiento.');
      return;
    }

    try {
      await technicianAssignmentService.bulkAssignTechnician(
        selectedMaintenances,
        selectedTechnician.id,
        selectedTechnician.fullName
      );
      
      await loadData();
      setShowBulkAssignModal(false);
      setSelectedMaintenances([]);
      setSelectedTechnician(null);
    } catch (error) {
      console.error('Error en asignación masiva:', error);
      alert('Error en la asignación masiva. Por favor, inténtalo de nuevo.');
    }
  };

  const toggleMaintenanceSelection = (maintenanceId: number) => {
    setSelectedMaintenances(prev => 
      prev.includes(maintenanceId)
        ? prev.filter(id => id !== maintenanceId)
        : [...prev, maintenanceId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETADO': return 'bg-green-100 text-green-800';
      case 'EN_PROCESO': return 'bg-blue-100 text-blue-800';
      case 'PROGRAMADO': return 'bg-yellow-100 text-yellow-800';
      case 'VENCIDO': return 'bg-red-100 text-red-800';
      case 'CANCELADO': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'PREVENTIVO' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-orange-100 text-orange-800';
  };

  // Filtrar mantenimientos según búsqueda y estado
  const filteredMaintenances = maintenances.filter(maintenance => {
    const matchesSearch = maintenance.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.id.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'assigned' && maintenance.technicianId) ||
                         (filterStatus === 'unassigned' && !maintenance.technicianId) ||
                         maintenance.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Filtrar técnicos según búsqueda por nombre o cédula
  const filteredTechnicians = technicians.filter(technician => {
    const searchLower = technicianSearchTerm.toLowerCase();
    return technician.fullName.toLowerCase().includes(searchLower) ||
           technician.numberIdentification?.toString().includes(technicianSearchTerm) ||
           technician.mail.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Gestión de Asignación de Técnicos
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              {unassignedMaintenances.length} Sin Asignar
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              {technicians.length} Técnicos Disponibles
            </span>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar mantenimientos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-0 sm:min-w-[140px]"
            >
              <option value="all">Todos</option>
              <option value="assigned">Asignados</option>
              <option value="unassigned">Sin Asignar</option>
              <option value="PROGRAMADO">Programados</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="COMPLETADO">Completados</option>
              <option value="VENCIDO">Vencidos</option>
            </select>

            <button
              onClick={() => setShowBulkAssignModal(true)}
              disabled={selectedMaintenances.length === 0}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap"
            >
              <UserPlusIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Asignación Masiva</span>
              <span className="sm:hidden">Masiva</span>
              ({selectedMaintenances.length})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Mantenimientos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMaintenances(filteredMaintenances.map(m => m.id));
                      } else {
                        setSelectedMaintenances([]);
                      }
                    }}
                    checked={selectedMaintenances.length === filteredMaintenances.length && filteredMaintenances.length > 0}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mantenimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Área de Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Técnico Asignado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Programada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaintenances.map((maintenance) => (
                <tr key={maintenance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedMaintenances.includes(maintenance.id)}
                      onChange={() => toggleMaintenanceSelection(maintenance.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{maintenance.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {maintenance.description || 'Sin descripción'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {maintenance.inventoryItemSerial || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {maintenance.inventoryItemName || 'Sin nombre'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {maintenance.serviceArea || 'No especificada'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(maintenance.status)}`}>
                      {maintenance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(maintenance.type)}`}>
                      {maintenance.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {maintenance.technicianName ? (
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{maintenance.technicianName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 italic">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {new Date(maintenance.scheduledDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {maintenance.technicianId ? (
                      <button
                        onClick={() => handleUnassignTechnician(maintenance.id)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                      >
                        <UserMinusIcon className="h-4 w-4" />
                        Desasignar
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedMaintenances([maintenance.id]);
                          setShowAssignModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <UserPlusIcon className="h-4 w-4" />
                        Asignar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Asignación Individual */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Asignar Técnico
              </h3>
              
              {/* Buscador de técnicos */}
              <div className="mb-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar técnico..."
                    value={technicianSearchTerm}
                    onChange={(e) => setTechnicianSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredTechnicians.map((technician) => (
                  <button
                    key={technician.id}
                    onClick={() => handleAssignTechnician(selectedMaintenances[0], technician)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{technician.fullName}</div>
                      <div className="text-sm text-gray-500 truncate">{technician.mail}</div>
                      {technician.numberIdentification && (
                        <div className="text-xs text-gray-400 mt-1">Cédula: {technician.numberIdentification}</div>
                      )}
                    </div>
                  </button>
                ))}
                {filteredTechnicians.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No se encontraron técnicos</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedMaintenances([]);
                    setTechnicianSearchTerm('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Asignación Masiva */}
      {showBulkAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Asignación Masiva
                </h3>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {selectedMaintenances.length} mantenimientos seleccionados
                </span>
              </div>
              
              {/* Buscador de técnicos para asignación masiva */}
              <div className="mb-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar técnico..."
                    value={technicianSearchTerm}
                    onChange={(e) => setTechnicianSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredTechnicians.map((technician) => (
                  <button
                    key={technician.id}
                    onClick={() => setSelectedTechnician(technician)}
                    className={`w-full text-left p-4 border rounded-lg transition-all duration-200 flex items-start gap-3 ${
                      selectedTechnician?.id === technician.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:bg-gray-50 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <UserIcon className={`h-5 w-5 ${selectedTechnician?.id === technician.id ? 'text-blue-500' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{technician.fullName}</div>
                      <div className="text-sm text-gray-500 truncate">{technician.mail}</div>
                      {technician.numberIdentification && (
                        <div className="text-xs text-gray-400 mt-1">Cédula: {technician.numberIdentification}</div>
                      )}
                    </div>
                    {selectedTechnician?.id === technician.id && (
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                      </div>
                    )}
                  </button>
                ))}
                {filteredTechnicians.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No se encontraron técnicos</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowBulkAssignModal(false);
                    setSelectedMaintenances([]);
                    setSelectedTechnician(null);
                    setTechnicianSearchTerm('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBulkAssign}
                  disabled={!selectedTechnician}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Asignar Técnico
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
