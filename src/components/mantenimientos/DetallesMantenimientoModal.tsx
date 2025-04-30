import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface DetallesMantenimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mantenimiento: {
    id: string;
    equipo: string;
    fechaProgramada: string;
    tipo: string;
    estado: string;
    tecnico: string;
    descripcion: string;
  };
}

export default function DetallesMantenimientoModal({
  isOpen,
  mantenimiento,
  onClose
}: DetallesMantenimientoModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="px-6 pt-6 pb-8">
                  <div className="text-center sm:text-left">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                      Detalles del Mantenimiento
                    </Dialog.Title>

                    <div className="mt-6 space-y-6">
                      {/* Información Principal */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">ID</h4>
                          <p className="mt-1 text-sm text-gray-900">#{mantenimiento.id}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                          <p className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium
                            ${mantenimiento.estado === 'Pendiente' ? 'bg-yellow-50 text-yellow-700' :
                              mantenimiento.estado === 'En Proceso' ? 'bg-blue-50 text-blue-700' :
                                'bg-green-50 text-green-700'}`}>
                            {mantenimiento.estado}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Equipo</h4>
                          <p className="mt-1 text-sm text-gray-900">{mantenimiento.equipo}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Fecha</h4>
                          <p className="mt-1 text-sm text-gray-900">{mantenimiento.fechaProgramada}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Tipo</h4>
                          <p className="mt-1 text-sm text-gray-900">{mantenimiento.tipo}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Técnico</h4>
                          <p className="mt-1 text-sm text-gray-900">{mantenimiento.tecnico}</p>
                        </div>
                      </div>

                      {/* Descripción */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Descripción</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700">{mantenimiento.descripcion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 
                              shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 
                              focus:outline-none transition-colors duration-200"
                      onClick={onClose}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
