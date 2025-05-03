import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserItemUI } from '../services/userService';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItemUI | null;
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Detalles del Usuario</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Nombre</p>
              <p className="text-sm text-gray-900">{user.nombre}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Identificación</p>
              <p className="text-sm text-gray-900">{user.identificacion}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Teléfono</p>
              <p className="text-sm text-gray-900">{user.telefono || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Rol</p>
              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                bg-purple-50 text-purple-700 ring-1 ring-purple-700/10">
                {user.rol}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Estado</p>
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                ${user.estado === 'Activo'
                  ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                  : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'}`}>
                {user.estado}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Empresa</p>
              <p className="text-sm text-gray-900">{user.empresa}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Sede</p>
              <p className="text-sm text-gray-900">{user.sede}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
