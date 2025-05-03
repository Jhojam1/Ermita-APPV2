import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  FunnelIcon,
  EyeIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import userService, { UserItemUI, UserItem } from '../services/userService';
import UserFormModal from '../components/UserFormModal';
import UserDetailsModal from '../components/UserDetailsModal';

interface SortConfig {
  key: string;
  direction: string;
}

export default function Users() {
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: '' });
  const [usuariosData, setUsuariosData] = useState<UserItemUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Estados para los modales
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItemUI | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      const mappedData = data.map(item => userService.mapToUI(item));
      setUsuariosData(mappedData);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar los datos de usuarios. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortableHeader = (key: string, label: string) => (
    <button
      onClick={() => handleSort(key)}
      className="inline-flex items-center gap-1 hover:text-gray-700"
    >
      {label}
      <ChevronUpDownIcon className="h-4 w-4" />
    </button>
  );

  // Aplicar filtros y ordenamiento
  const filteredAndSortedUsuarios = usuariosData
    .filter(usuario => {
      // Filtro por término de búsqueda
      const matchesSearch = searchTerm === '' || 
        usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.identificacion.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por rol
      const matchesRole = filterRole === '' || usuario.rol === filterRole;
      
      // Filtro por empresa
      const matchesCompany = filterCompany === '' || usuario.empresa === filterCompany;
      
      // Filtro por estado
      const matchesStatus = filterStatus === '' || usuario.estado === filterStatus;
      
      return matchesSearch && matchesRole && matchesCompany && matchesStatus;
    })
    .sort((a, b) => {
      if (sortConfig.key === '') return 0;
      
      const key = sortConfig.key as keyof UserItemUI;
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Obtener listas únicas para los filtros
  const uniqueRoles = [...new Set(usuariosData.map(user => user.rol))];
  const uniqueCompanies = [...new Set(usuariosData.map(user => user.empresa))];
  const uniqueStatuses = [...new Set(usuariosData.map(user => user.estado))];

  // Manejadores para los modales
  const handleOpenNewUserModal = () => {
    setSelectedUser(null);
    setShowNewUserModal(true);
  };

  const handleOpenEditUserModal = (user: UserItemUI) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleOpenUserDetailsModal = (user: UserItemUI) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const handleSaveNewUser = async (userData: UserItem) => {
    try {
      console.log('Datos a guardar (nuevo usuario):', userData);
      
      // Asegurarnos de que los valores sean números válidos si existen
      if (userData.companyId) {
        userData.companyId = Number(userData.companyId);
      }
      
      if (userData.headquarterId) {
        userData.headquarterId = Number(userData.headquarterId);
      }
      
      await userService.createUser(userData);
      setShowNewUserModal(false);
      fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      console.error('Error al crear usuario:', error);
    }
  };

  const handleUpdateUser = async (userData: UserItem) => {
    if (!selectedUser?.id) return;
    
    try {
      console.log('Datos a actualizar:', userData);
      
      // Asegurarnos de que los valores sean números válidos si existen
      if (userData.companyId) {
        userData.companyId = Number(userData.companyId);
      }
      
      if (userData.headquarterId) {
        userData.headquarterId = Number(userData.headquarterId);
      }
      
      await userService.updateUser(parseInt(selectedUser.id), userData);
      setShowEditUserModal(false);
      fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      {/* Header y Búsqueda */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-light tracking-tight text-gray-900">
          Gestión de <span className="font-medium">Usuarios</span>
        </h1>
        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-white/50 backdrop-blur-sm border-0 rounded-full 
                       text-sm text-gray-600 placeholder-gray-400
                       ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500
                       transition-shadow duration-200"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <FunnelIcon className="h-5 w-5 text-gray-500" />
          </button>
          <button 
            onClick={handleOpenNewUserModal}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors duration-200">
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filtros */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100
                      grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                         focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los roles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select 
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                         focus:ring-2 focus:ring-blue-500">
            <option value="">Todas las empresas</option>
            {uniqueCompanies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600
                         focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los estados</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-medium text-xs text-gray-500 uppercase tracking-wider">
                  {renderSortableHeader('nombre', 'Nombre')}
                </th>
                <th className="p-4 font-medium text-xs text-gray-500 uppercase tracking-wider">
                  {renderSortableHeader('email', 'Email')}
                </th>
                <th className="p-4 font-medium text-xs text-gray-500 uppercase tracking-wider">
                  {renderSortableHeader('rol', 'Rol')}
                </th>
                <th className="p-4 font-medium text-xs text-gray-500 uppercase tracking-wider">
                  {renderSortableHeader('empresa', 'Empresa')}
                </th>
                <th className="p-4 font-medium text-xs text-gray-500 uppercase tracking-wider">
                  {renderSortableHeader('sede', 'Sede')}
                </th>
                <th className="p-4 font-medium text-xs text-gray-500 uppercase tracking-wider">
                  {renderSortableHeader('estado', 'Estado')}
                </th>
                <th className="p-4 font-medium text-xs text-gray-500 uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">Cargando usuarios...</td>
                </tr>
              ) : filteredAndSortedUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">No se encontraron usuarios</td>
                </tr>
              ) : (
                filteredAndSortedUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50/50">
                    <td className="p-4 text-sm text-gray-600">{usuario.nombre}</td>
                    <td className="p-4 text-sm text-gray-600">{usuario.email}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                        bg-purple-50 text-purple-700 ring-1 ring-purple-700/10">
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{usuario.empresa}</td>
                    <td className="p-4 text-sm text-gray-600">{usuario.sede}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                        ${usuario.estado === 'Activo'
                          ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                          : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'}`}>
                        {usuario.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleOpenUserDetailsModal(usuario)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditUserModal(usuario)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          title="Editar usuario"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {filteredAndSortedUsuarios.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <p className="text-sm text-gray-700 whitespace-nowrap">
                Mostrando <span className="font-medium">{filteredAndSortedUsuarios.length}</span> de <span className="font-medium">{usuariosData.length}</span> usuarios
              </p>
              <select className="w-full sm:w-auto pl-3 pr-8 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg
                              focus:ring-2 focus:ring-blue-500">
                <option value="10">10 por página</option>
                <option value="20">20 por página</option>
                <option value="50">50 por página</option>
              </select>
            </div>
            <nav className="flex gap-1 w-full sm:w-auto justify-center">
              <button className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100">
                Anterior
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                1
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100">
                2
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100">
                3
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100">
                Siguiente
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Modales */}
      <UserFormModal 
        isOpen={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        onSave={handleSaveNewUser}
      />

      <UserFormModal 
        isOpen={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        onSave={handleUpdateUser}
        user={selectedUser ? userService.mapToBackend(selectedUser) : undefined}
        isEditing={true}
      />

      <UserDetailsModal 
        isOpen={showUserDetailsModal}
        onClose={() => setShowUserDetailsModal(false)}
        user={selectedUser}
      />
    </div>
  );
}
