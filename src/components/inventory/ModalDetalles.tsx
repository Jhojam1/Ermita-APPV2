import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import EquipmentTransferHistoryTab from './EquipmentTransferHistoryTab';

interface ModalDetallesProps {
  equipo: any;
  onClose: () => void;
  selectedTab?: number; // 0 para Info General, 1 para Historial de Traslados
}

const ModalDetalles: React.FC<ModalDetallesProps> = ({ equipo, onClose, selectedTab = 0 }) => {
  // Estado para la pestaña seleccionada
  const [activeTab, setActiveTab] = useState<number>(selectedTab);
  
  // Actualizar la pestaña activa si cambia desde props
  useEffect(() => {
    setActiveTab(selectedTab);
  }, [selectedTab]);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {equipo.serial} - {equipo.modelo}
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mt-4">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab(0)}
                  className={`${activeTab === 0
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Información General
                </button>
                <button
                  onClick={() => setActiveTab(1)}
                  className={`${activeTab === 1
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Historial de Traslados
                </button>
              </nav>
            </div>
            
            {/* Tab content */}
            {activeTab === 0 && (
              <div className="mt-4 space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800">Información General</h4>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-gray-500">Empresa:</div>
                    <div className="text-gray-900">{equipo.empresa}</div>
                    <div className="text-gray-500">Sede:</div>
                    <div className="text-gray-900">{equipo.sede}</div>
                    <div className="text-gray-500">Tipo:</div>
                    <div className="text-gray-900">{equipo.tipo}</div>
                    <div className="text-gray-500">Estado:</div>
                    <div className="text-gray-900">{equipo.estado}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800">Especificaciones</h4>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-gray-500">Marca:</div>
                    <div className="text-gray-900">{equipo.marca}</div>
                    <div className="text-gray-500">Modelo:</div>
                    <div className="text-gray-900">{equipo.modelo}</div>
                    <div className="text-gray-500">Serial:</div>
                    <div className="text-gray-900">{equipo.serial}</div>
                    <div className="text-gray-500">Código Interno:</div>
                    <div className="text-gray-900">{equipo.codigoInterno}</div>
                    <div className="text-gray-500">Procesador:</div>
                    <div className="text-gray-900">{equipo.procesador}</div>
                    <div className="text-gray-500">Memoria RAM:</div>
                    <div className="text-gray-900">{equipo.ram}</div>
                    <div className="text-gray-500">Disco Duro:</div>
                    <div className="text-gray-900">{equipo.disco}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800">Asignación</h4>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-gray-500">Responsable:</div>
                    <div className="text-gray-900">{equipo.responsable || 'No asignado'}</div>
                    <div className="text-gray-500">Servicio:</div>
                    <div className="text-gray-900">{equipo.servicio || 'No asignado'}</div>
                    <div className="text-gray-500">Fecha Creación:</div>
                    <div className="text-gray-900">{equipo.fechaCreacion}</div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 1 && (
              <div className="mt-4">
                <EquipmentTransferHistoryTab equipmentId={equipo.id} />
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalles;
