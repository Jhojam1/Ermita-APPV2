import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  ComputerDesktopIcon, 
  WrenchScrewdriverIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  CameraIcon,
  PrinterIcon,
  Squares2X2Icon  
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Obtener el rol del usuario actual
  const userRole = user?.role || '';

  // Cerrar el sidebar al cambiar de página
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Abrir el menú correspondiente según la ruta actual
  useEffect(() => {
    if (location.pathname?.startsWith('/configuracion')) {
      setConfigOpen(true);
    }
    if (location.pathname?.startsWith('/reportes')) {
      setReportsOpen(true);
    }
    if (location.pathname?.startsWith('/inventario')) {
      setInventoryOpen(true);
    }
    // Abrir el menú de mantenimientos
    if (location.pathname?.startsWith('/mantenimientos') || 
        location.pathname?.startsWith('/historial')) {
      setMaintenanceOpen(true);
    }
  }, [location.pathname]);

  // Definir los elementos del menú base
  const homeItem = { name: 'Inicio', href: '/', icon: HomeIcon };
  
  const inventoryItem = { 
    name: 'Inventario',
    icon: Squares2X2Icon,
    isOpen: inventoryOpen,
    onToggle: () => setInventoryOpen(!inventoryOpen),
    subItems: [
      { name: 'Equipos', href: '/inventario', icon: ComputerDesktopIcon },
      { name: 'Camaras', href: '', icon: CameraIcon },
      { name: 'Impresoras', href: '', icon: PrinterIcon },
    ]
  };

  const maintenanceItem = { 
    name: 'Mantenimientos',
    icon: WrenchScrewdriverIcon,
    isOpen: maintenanceOpen,
    onToggle: () => setMaintenanceOpen(!maintenanceOpen),
    subItems: [
      {name: 'Equipos', href: '/mantenimientos', icon: ComputerDesktopIcon},
      { name: 'Camaras', href: '', icon: CameraIcon },
      { name: 'Impresoras', href: '', icon: PrinterIcon },
      { name: 'Historial Mantenimientos', href: '/historial', icon: ClipboardDocumentListIcon }
    ]
  };
  
  const reportsItem = { 
    name: 'Reportes',
    icon: ChartBarIcon,
    isOpen: reportsOpen,
    onToggle: () => setReportsOpen(!reportsOpen),
    subItems: [
      { name: 'Mantenimientos', href: '/reportes', icon: ChartBarIcon },
      { name: 'Hosvital', href: '/reportes/hosvital', icon: ChartBarIcon },
      // Aquí se añadirá el nuevo apartado de reportes para usuarios
    ]
  };

  // Eliminado el elemento de menú para Programación de Mantenimientos (trasladado a configuración)
  
  // Elementos del menú de configuración
  const configItems = [
    { name: 'Usuarios', href: '/configuracion/usuarios', icon: UserGroupIcon },
    { name: 'Empresas Y Sedes', href: '/configuracion/empresas', icon: BuildingOfficeIcon },
    { name: 'Programación de Mantenimientos', href: '/configuracion/mantenimientos', icon: WrenchScrewdriverIcon },
  ];
  
  // Filtrar los elementos del menú según el rol del usuario
  let menuItems = [];
  
  if (userRole === 'Administrador') {
    // El administrador tiene acceso a todo
    menuItems = [homeItem, inventoryItem, maintenanceItem, reportsItem];
  } else if (userRole === 'Tecnico') {
    // El técnico solo tiene acceso a inventario y mantenimientos
    menuItems = [homeItem, inventoryItem, maintenanceItem];
  } else if (userRole === 'Usuario') {
    // El usuario solo tiene acceso al inicio y reportes
    menuItems = [homeItem, reportsItem];
  } else {
    // Por defecto, solo mostrar el inicio
    menuItems = [homeItem];
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-30">
        <div className="h-full flex items-center justify-between px-4 bg-gradient-to-r from-blue-50/50 to-white">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100/80 transition-all duration-200 group"
          >
            <Bars3Icon className="h-6 w-6 transition-transform group-hover:scale-110" />
          </button>
          <h1 className="text-gray-800 text-lg font-semibold tracking-tight">Sistema Ermita</h1>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100/80 transition-all duration-200 group"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
          </button>
        </div>
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-[280px] bg-white shadow-lg z-50
          transform transition-all duration-300 ease-in-out
          border-r border-gray-100
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Sistema Ermita</h2>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  {item.subItems ? (
                    <button
                      onClick={item.onToggle}
                      className={`
                        flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200
                        ${location.pathname?.startsWith(item.href)
                          ? 'bg-blue-50/80 text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50/80'}
                        group
                      `}
                    >
                      <item.icon className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                      <span className="font-medium flex-1 text-left">{item.name}</span>
                      <ChevronDownIcon 
                        className={`h-5 w-5 transition-transform duration-300 ${item.isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className={`
                        flex items-center px-4 py-2.5 rounded-lg transition-all duration-200
                        ${location.pathname === item.href 
                          ? 'bg-blue-50/80 text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-50/80'}
                        group
                      `}
                    >
                      <item.icon className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )}
                  
                  {item.subItems && (
                    <div className={`
                      mt-1 ml-4 space-y-1 border-l-2 border-gray-100
                      transition-all duration-300 ease-in-out overflow-hidden
                      ${item.isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
                    `}>
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className={`
                            flex items-center px-4 py-2 rounded-lg transition-all duration-200
                            ${location.pathname === subItem.href
                              ? 'bg-blue-50/80 text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:bg-gray-50/80'}
                            group
                          `}
                        >
                          <subItem.icon className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
                          <span className="font-medium text-sm">{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}

              {/* Menú de Configuración - Solo visible para Administradores */}
              {userRole === 'Administrador' && (
                <li>
                  <button
                    onClick={() => setConfigOpen(!configOpen)}
                    className={`
                      flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200
                      ${location.pathname?.startsWith('/configuracion')
                        ? 'bg-blue-50/80 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50/80'}
                      group
                    `}
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                    <span className="font-medium flex-1 text-left">Configuración</span>
                    <ChevronDownIcon 
                      className={`h-5 w-5 transition-transform duration-300 ${configOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {/* Submenú de Configuración */}
                  <div className={`
                    mt-1 ml-4 space-y-1 border-l-2 border-gray-100
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${configOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
                  `}>
                    {configItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`
                          flex items-center px-4 py-2 rounded-lg transition-all duration-200
                          ${location.pathname === item.href
                            ? 'bg-blue-50/80 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50/80'}
                          group
                        `}
                      >
                        <item.icon className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
                        <span className="font-medium text-sm">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </li>
              )}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50/80 transition-all duration-200 group"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
