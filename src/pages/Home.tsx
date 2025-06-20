import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import AnimatedContainer from "../components/ui/AnimatedContainer";
import { 
  ComputerDesktopIcon, 
  WrenchScrewdriverIcon, 
  ClipboardDocumentCheckIcon, 
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  BellAlertIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ArrowPathIcon,
  BookOpenIcon,
  LifebuoyIcon,
  CheckCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user } = useAuth();
  const [currentDate] = useState(new Date());

  // Noticias o actualizaciones recientes del sistema según el rol del usuario
  const getSystemUpdates = () => {
    // Actualizaciones para administradores
    if (user?.role === 'Administrador') {
      return [
        {
          title: 'Nueva funcionalidad de reportes',
          description: 'Se ha implementado un nuevo módulo de reportes avanzados con estadísticas detalladas.',
          date: '18 Jun 2025',
          icon: ChartBarIcon
        },
        {
          title: 'Gestión de usuarios mejorada',
          description: 'Nuevas opciones para administración de permisos y roles en el sistema.',
          date: '12 Jun 2025',
          icon: UserGroupIcon
        },
        {
          title: 'Actualización de base de datos',
          description: 'Se ha optimizado el rendimiento de las consultas en el módulo de reportes.',
          date: '05 Jun 2025',
          icon: ArrowPathIcon
        }
      ];
    }
    
    // Actualizaciones para técnicos
    if (user?.role === 'Tecnico') {
      return [
        {
          title: 'Nuevas plantillas de mantenimiento',
          description: 'Se han agregado nuevas plantillas para diferentes tipos de equipos.',
          date: '15 Jun 2025',
          icon: ClipboardDocumentCheckIcon
        },
        {
          title: 'Manual técnico actualizado',
          description: 'El manual técnico de procedimientos ha sido actualizado con nuevos protocolos.',
          date: '10 Jun 2025',
          icon: BookOpenIcon
        },
        {
          title: 'Catálogo de repuestos',
          description: 'Se ha actualizado el catálogo de repuestos con nuevos componentes disponibles.',
          date: '03 Jun 2025',
          icon: WrenchScrewdriverIcon
        }
      ];
    }
    
    // Actualizaciones para usuarios regulares
    return [
      {
        title: 'Nueva interfaz de usuario',
        description: 'Rediseño de la interfaz para mejorar la experiencia y facilidad de uso.',
        date: '18 Jun 2025',
        icon: ArrowPathIcon
      },
      {
        title: 'Solicitudes de servicio simplificadas',
        description: 'Ahora es más fácil realizar y dar seguimiento a solicitudes de servicio técnico.',
        date: '10 Jun 2025',
        icon: CheckCircleIcon
      },
      {
        title: 'Guías de uso actualizadas',
        description: 'Nuevos tutoriales disponibles en el centro de ayuda para facilitar su experiencia.',
        date: '05 Jun 2025',
        icon: BookOpenIcon
      }
    ];
  };
  
  // Obtener las actualizaciones según el rol del usuario
  const systemUpdates = getSystemUpdates();

  // Accesos rápidos según rol del usuario
  const getQuickAccessItems = () => {
    const baseItems = [
      {
        title: 'Inventario',
        description: 'Gestión de equipos, cámaras e impresoras',
        link: '/inventario',
        icon: ComputerDesktopIcon,
        color: 'from-blue-400 to-blue-600'
      },
      {
        title: 'Mantenimientos',
        description: 'Programación y seguimiento de mantenimientos',
        link: '/mantenimientos',
        icon: WrenchScrewdriverIcon,
        color: 'from-green-400 to-green-600'
      }
    ];
    
    // Elementos para administradores
    if (user?.role === 'Administrador') {
      return [
        ...baseItems,
        {
          title: 'Reportes',
          description: 'Estadísticas y análisis de datos',
          link: '/reportes',
          icon: ChartBarIcon,
          color: 'from-purple-400 to-purple-600'
        },
        {
          title: 'Configuración',
          description: 'Usuarios, empresas y parámetros del sistema',
          link: '/configuracion/usuarios',
          icon: UserGroupIcon,
          color: 'from-gray-500 to-gray-700'
        }
      ];
    }
    
    // Elementos para técnicos
    if (user?.role === 'Tecnico') {
      return [
        ...baseItems,
        {
          title: 'Histórico',
          description: 'Historial de mantenimientos realizados',
          link: '/historial',
          icon: ClipboardDocumentCheckIcon,
          color: 'from-amber-400 to-amber-600'
        }
      ];
    }
    
    // Elementos para usuarios regulares
    return [
      {
        title: 'Reportes',
        description: 'Visualización de estadísticas',
        link: '/reportes',
        icon: ChartBarIcon,
        color: 'from-purple-400 to-purple-600'
      },
      {
        title: 'Soporte',
        description: 'Centro de ayuda y soporte técnico',
        link: '#',
        icon: LifebuoyIcon,
        color: 'from-red-400 to-red-600'
      }
    ];
  };

  // Formatear la fecha actual
  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentDate);
  
  // Obtener la hora del día para personalizar el saludo
  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="space-y-6">
      {/* Banner de bienvenida */}
      <AnimatedContainer>
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-700 p-8 rounded-xl shadow-md">
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
            <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M38.6,-65.1C49.3,-54.5,56.6,-42.1,65.2,-28.7C73.8,-15.4,83.8,-1.1,83,13.5C82.2,28,70.7,42.8,57.5,54.7C44.2,66.5,29.3,75.4,12.9,77.6C-3.4,79.7,-21.2,75.1,-35.5,66.5C-49.8,57.9,-60.5,45.3,-69.7,30.6C-78.9,15.9,-86.6,-0.8,-83.6,-15.7C-80.5,-30.5,-66.8,-43.5,-52.1,-54.2C-37.3,-65,-18.7,-73.4,-1.3,-71.6C16,-69.9,32,-75.7,38.6,-65.1Z" transform="translate(100 100)" />
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                ¡{getGreeting()}, {user?.name || 'Bienvenido'}!
              </h1>
              <p className="text-blue-100 text-lg">
                {formattedDate}
              </p>
              {user?.company && (
                <div className="mt-3 flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-200" />
                  <span className="ml-2 text-blue-100">{user.company}</span>
                </div>
              )}
            </div>
            
            <Link 
              to="/mantenimientos" 
              className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg px-5 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 flex items-center group"
            >
              <span className="text-white font-medium">Ver mantenimientos pendientes</span>
              <ChevronRightIcon className="w-5 h-5 text-white ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </AnimatedContainer>
      
      {/* Accesos rápidos */}
      <AnimatedContainer delay={0.1}>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Accesos Rápidos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getQuickAccessItems().map((item, index) => (
              <AnimatedContainer key={item.title} delay={0.1 + (index * 0.05)}>
                <Link 
                  to={item.link}
                  className="block bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md group border border-gray-100 hover:border-transparent"
                >
                  <div className="p-5">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-800 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                    <p className="text-gray-500 text-sm">{item.description}</p>
                  </div>
                </Link>
              </AnimatedContainer>
            ))}
          </div>
        </div>
      </AnimatedContainer>

      {/* Espacio reservado para implementación futura */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Espacio en blanco para implementación futura */}
        </div>

        {/* Recursos y Ayuda personalizada según rol */}
        <AnimatedContainer delay={0.3}>
          <div className="bg-white p-6 rounded-xl shadow-sm h-full">
            <div className="flex items-center mb-6">
              {user?.role === 'Administrador' ? (
                <>
                  <InformationCircleIcon className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">Herramientas</h2>
                </>
              ) : user?.role === 'Tecnico' ? (
                <>
                  <WrenchScrewdriverIcon className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">Herramientas</h2>
                </>
              ) : (
                <>
                  <BookOpenIcon className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">Recursos</h2>
                </>
              )}
            </div>

            <div className="space-y-4 mt-2">
              {/* Contenido personalizado según rol */}
              {user?.role === 'Administrador' && (
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <h3 className="text-base font-medium text-purple-700 mb-2 flex items-center">
                    <Cog6ToothIcon className="w-5 h-5 mr-2" /> Configuración Avanzada
                  </h3>
                  <p className="text-sm text-purple-600 mb-3">Parámetros del sistema y opciones de personalización.</p>
                  <Link to="/configuracion" className="text-sm text-purple-700 font-medium hover:underline flex items-center">
                    Administrar sistema
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              )}
              
              {user?.role === 'Tecnico' && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                  <h3 className="text-base font-medium text-amber-700 mb-2 flex items-center">
                    <ClipboardDocumentListIcon className="w-5 h-5 mr-2" /> Mantenimientos Pendientes
                  </h3>
                  <p className="text-sm text-amber-600 mb-3">Revisa las tareas de mantenimiento programadas.</p>
                  <Link to="/mantenimientos" className="text-sm text-amber-700 font-medium hover:underline flex items-center">
                    Ver pendientes
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              )}
              
              {user?.role === 'Usuario' && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                  <h3 className="text-base font-medium text-green-700 mb-2 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2" /> Reportes Disponibles
                  </h3>
                  <p className="text-sm text-green-600 mb-3">Accede a los reportes y estadísticas del sistema.</p>
                  <Link to="/reportes" className="text-sm text-green-700 font-medium hover:underline flex items-center">
                    Ver reportes
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </div>
  );
};

export default Home;
