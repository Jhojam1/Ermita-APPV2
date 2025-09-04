import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../PermissionWrapper';
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
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasModuleAccess, hasPermission } = usePermissions();
  
  // Obtener el rol del usuario actual
  const userRole = user?.role || '';

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // En desktop, mantener el sidebar siempre abierto
      if (!mobile) {
        setIsOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar el sidebar al cambiar de página solo en móviles
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      // En desktop, mantener siempre abierto
      setIsOpen(true);
    }
  }, [location.pathname, isMobile]);

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
      { name: 'Asignar Técnicos', href: '/mantenimientos/asignaciones', icon: UserGroupIcon },
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
  
  // Filtrar los elementos del menú según los permisos del usuario
  let menuItems = [homeItem]; // Todos tienen acceso al inicio
  
  // Agregar módulos basados en permisos
  if (hasModuleAccess('INVENTORY')) {
    menuItems.push(inventoryItem);
  }
  
  if (hasModuleAccess('MAINTENANCE')) {
    menuItems.push(maintenanceItem);
  }
  
  if (hasModuleAccess('REPORTS')) {
    menuItems.push(reportsItem);
  }

  // Agregar menú de Configuración si tiene acceso
  if (hasModuleAccess('CONFIGURATION')) {
    const configurationItem = {
      name: 'Configuración',
      href: '/configuracion',
      icon: Cog6ToothIcon,
      isOpen: configOpen,
      onToggle: () => setConfigOpen(!configOpen),
      subItems: configItems
        .filter(item => {
          // Filtrar elementos de configuración por permisos
          if (item.href.includes('/usuarios')) return hasPermission('USERS_VIEW');
          if (item.href.includes('/empresas')) return hasPermission('COMPANIES_VIEW');
          if (item.href.includes('/mantenimientos')) return hasPermission('CONFIGURATION_VIEW');
          return true;
        })
        .concat([
          // Agregar gestión de roles y permisos si tiene permisos de configuración
          ...(hasPermission('CONFIGURATION_VIEW') ? [{ name: 'Roles', href: '/configuracion/roles', icon: UserGroupIcon }] : []),
          ...(hasPermission('CONFIGURATION_VIEW') ? [{ name: 'Permisos', href: '/configuracion/permisos', icon: Cog6ToothIcon }] : [])
        ])
    };
    menuItems.push(configurationItem);
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
          w-[280px] bg-white shadow-lg border-r border-gray-100
          transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isMobile ? 'fixed top-0 left-0 h-full z-50' : 'h-screen sticky top-0'}
          ${isOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
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
                      transition-all duration-300 ease-in-out
                      ${item.isOpen ? 'max-h-96 opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}
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
            </ul>
          </nav>

          {/* Footer con información del usuario y logout */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="mb-3 px-2">
              <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.roleName || user?.role}</p>
            </div>
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

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
