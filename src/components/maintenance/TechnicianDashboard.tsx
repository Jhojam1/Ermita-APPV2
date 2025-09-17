import { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import technicianAssignmentService, { 
  MaintenanceAssignment, 
  TechnicianProductivityStats 
} from '../../services/technicianAssignmentService';
import maintenanceService from '../../services/maintenanceService';

export default function TechnicianDashboard() {
  const [assignedMaintenances, setAssignedMaintenances] = useState<MaintenanceAssignment[]>([]);
  const [productivityStats, setProductivityStats] = useState<TechnicianProductivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener datos del usuario actual
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const technicianId = user?.id;
  // const companyId = user?.idcompany || 1;
  // const headquarterId = user?.idheadquarter || 1;

  useEffect(() => {
    if (technicianId) {
      loadData();
    }
  }, [technicianId]);

  const loadData = async () => {
    if (!technicianId) return;
    
    setLoading(true);
    try {
      const [assignedData, statsData] = await Promise.all([
        technicianAssignmentService.getAssignedMaintenances(technicianId),
        technicianAssignmentService.getTechnicianProductivityStats(technicianId)
      ]);

      setAssignedMaintenances(assignedData);
      setProductivityStats(statsData);
    } catch (error) {
      console.error('Error cargando datos del técnico:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (maintenanceId: number, newStatus: 'PROGRAMADO' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO') => {
    setUpdatingStatus(maintenanceId);
    try {
      await maintenanceService.updateMaintenance(maintenanceId, { status: newStatus });
      await loadData(); // Recargar datos para reflejar cambios
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado. Por favor, inténtalo de nuevo.');
    } finally {
      setUpdatingStatus(null);
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ALTA': return 'bg-red-100 text-red-800';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-800';
      case 'BAJA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETADO': return CheckCircleIcon;
      case 'EN_PROCESO': return PlayIcon;
      case 'PROGRAMADO': return ClockIcon;
      case 'VENCIDO': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const getAvailableStatusTransitions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PROGRAMADO':
        return [
          { value: 'EN_PROCESO', label: 'Iniciar Trabajo', color: 'bg-blue-600' }
        ];
      case 'EN_PROCESO':
        return [
          { value: 'COMPLETADO', label: 'Completar', color: 'bg-green-600' },
          { value: 'PROGRAMADO', label: 'Pausar', color: 'bg-yellow-600' }
        ];
      case 'VENCIDO':
        return [
          { value: 'EN_PROCESO', label: 'Reanudar', color: 'bg-blue-600' },
          { value: 'COMPLETADO', label: 'Completar', color: 'bg-green-600' }
        ];
      default:
        return [];
    }
  };

  const isOverdue = (scheduledDate: string) => {
    return new Date(scheduledDate) < new Date() && 
           !assignedMaintenances.find(m => m.scheduledDate === scheduledDate)?.status?.includes('COMPLETADO');
  };

  const filteredMaintenances = assignedMaintenances.filter(maintenance => {
    const matchesSearch = maintenance.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.inventoryItemSerial?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || maintenance.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getUpcomingMaintenances = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return assignedMaintenances.filter(maintenance => {
      const scheduledDate = new Date(maintenance.scheduledDate);
      return scheduledDate >= today && scheduledDate <= nextWeek && 
             maintenance.status === 'PROGRAMADO';
    }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!technicianId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Restringido</h3>
        <p className="text-gray-600">Solo los técnicos pueden acceder a este dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y Estadísticas del Técnico */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Mi Dashboard de Mantenimientos
            </h2>
            <p className="text-gray-600">
              Bienvenido, {user?.fullName || user?.name}
            </p>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <WrenchScrewdriverIcon className="h-6 w-6" />
            <span className="font-medium">Técnico</span>
          </div>
        </div>

        {productivityStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{productivityStats.totalAssigned}</div>
              <div className="text-sm text-gray-600">Total Asignados</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{productivityStats.completed}</div>
              <div className="text-sm text-gray-600">Completados</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{productivityStats.inProgress}</div>
              <div className="text-sm text-gray-600">En Proceso</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{productivityStats.overdue}</div>
              <div className="text-sm text-gray-600">Vencidos</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{productivityStats.efficiency}%</div>
              <div className="text-sm text-gray-600">Mi Eficiencia</div>
            </div>
          </div>
        )}
      </div>

      {/* Próximos Mantenimientos */}
      {getUpcomingMaintenances().length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
            Próximos Mantenimientos (Esta Semana)
          </h3>
          <div className="space-y-3">
            {getUpcomingMaintenances().slice(0, 3).map((maintenance) => (
              <div key={maintenance.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div>
                  <div className="font-medium text-gray-900">#{maintenance.id} - {maintenance.description}</div>
                  <div className="text-sm text-gray-600">
                    {maintenance.inventoryItemSerial} • {new Date(maintenance.scheduledDate).toLocaleDateString()}
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(maintenance.type)}`}>
                  {maintenance.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controles de Filtrado */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <DocumentTextIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar mantenimientos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los Estados</option>
            <option value="PROGRAMADO">Programados</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="COMPLETADO">Completados</option>
            <option value="VENCIDO">Vencidos</option>
          </select>

          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <ChartBarIcon className="h-5 w-5" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Lista de Mantenimientos Asignados */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Mis Mantenimientos Asignados ({filteredMaintenances.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredMaintenances.length === 0 ? (
            <div className="p-8 text-center">
              <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mantenimientos</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No se encontraron mantenimientos con los filtros aplicados.'
                  : 'No tienes mantenimientos asignados en este momento.'
                }
              </p>
            </div>
          ) : (
            filteredMaintenances.map((maintenance) => {
              const StatusIcon = getStatusIcon(maintenance.status);
              const availableTransitions = getAvailableStatusTransitions(maintenance.status);
              const overdue = isOverdue(maintenance.scheduledDate);
              
              return (
                <div key={maintenance.id} className={`p-6 hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="h-5 w-5 text-gray-400" />
                        <div className="font-medium text-gray-900">
                          #{maintenance.id} - {maintenance.description || 'Sin descripción'}
                        </div>
                        {overdue && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            VENCIDO
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Activo</div>
                          <div className="font-medium">{maintenance.inventoryItemSerial || 'No especificado'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Fecha Programada</div>
                          <div className="font-medium flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {new Date(maintenance.scheduledDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Prioridad</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor('MEDIA')}`}>
                            {'MEDIA'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(maintenance.status)}`}>
                          {maintenance.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(maintenance.type)}`}>
                          {maintenance.type}
                        </span>
                      </div>

                      {maintenance.description && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-500 mb-1">Notas</div>
                          <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {maintenance.description}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acciones de Estado */}
                    <div className="ml-6 flex flex-col gap-2">
                      {availableTransitions.map((transition) => (
                        <button
                          key={transition.value}
                          onClick={() => handleStatusUpdate(maintenance.id, transition.value as 'PROGRAMADO' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO')}
                          disabled={updatingStatus === maintenance.id}
                          className={`${transition.color} text-white px-3 py-1 rounded text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
                        >
                          {updatingStatus === maintenance.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              {transition.value === 'EN_PROCESO' && <PlayIcon className="h-4 w-4" />}
                              {transition.value === 'COMPLETADO' && <CheckCircleIcon className="h-4 w-4" />}
                              {transition.value === 'PROGRAMADO' && <PauseIcon className="h-4 w-4" />}
                              {transition.label}
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
