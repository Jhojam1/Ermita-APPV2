import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import inventoryTransferService, { InventoryTransfer } from '../../services/InventoryTransferService';
import { CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

// Usamos la interfaz del servicio directamente para los traslados
interface Transfer extends InventoryTransfer {
  // Aseguramos que todos los campos necesarios estén definidos
}

interface Props {
  equipmentId: number;
}

const EquipmentTransferHistoryTab: React.FC<Props> = ({ equipmentId }) => {
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState<Transfer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovements();
  }, [equipmentId]);

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener solo los traslados del equipo
      const transfersResponse = await inventoryTransferService.getTransfersByItem(equipmentId);
      
      if (transfersResponse && transfersResponse.data && Array.isArray(transfersResponse.data)) {
        // Ordenar los traslados por fecha (más reciente primero)
        const sortedTransfers = [...transfersResponse.data];
        sortedTransfers.sort((a, b) => 
          new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
        );
        
        setMovements(sortedTransfers);
      } else {
        setMovements([]);
        setError('No se encontraron traslados para este equipo');
      }
    } catch (error) {
      console.error('Error al cargar historial de traslados:', error);
      setError('Error al cargar el historial de traslados del equipo');
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  // formatDate function removed as it's not used
  
  if (loading) {
    return <div className="py-4 text-center text-gray-500">Cargando historial de movimientos...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }

  if (movements.length === 0) {
    return <div className="py-4 text-center text-gray-500">No hay traslados registrados para este equipo.</div>;
  }

  return (
    <div className="overflow-hidden">
      <div className="bg-white overflow-y-auto max-h-96 space-y-2 py-2">
        {movements.map((movement) => {
          const date = parseISO(movement.movementDate);
          const formattedDate = format(date, 'dd MMM yyyy', { locale: es });
          const formattedTime = format(date, 'HH:mm', { locale: es });
          
          return (
            <div key={movement.id} className="bg-white px-3 py-2 border-l-4 border-blue-500 mb-2">
              <div className="text-sm font-medium text-gray-800">{movement.description}</div>
              
              <div className="flex flex-wrap items-center text-xs text-gray-500 mt-2">
                <div className="flex items-center mr-3 mb-1">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                  {formattedDate} • {formattedTime}
                </div>
                
                <div className="flex items-center mr-3 mb-1">
                  <UserIcon className="h-3.5 w-3.5 mr-1" />
                  {movement.userName || 'Usuario desconocido'}
                </div>
                
                {movement.reason && (
                  <div className="w-full mt-1">
                    <span className="font-medium">Motivo:</span> {movement.reason}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {movements.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay traslados registrados</div>
        )}
      </div>
      
      {movements.length > 0 && (
        <div className="text-xs text-gray-500 text-right mt-2 px-1">
          Mostrando {movements.length} {movements.length === 1 ? 'traslado' : 'traslados'}
        </div>
      )}
    </div>
  );
};

export default EquipmentTransferHistoryTab;
