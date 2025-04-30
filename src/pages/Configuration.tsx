import { Link } from 'react-router-dom';
import { UserGroupIcon, BuildingOfficeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import AnimatedContainer from '../components/ui/AnimatedContainer';

export default function Configuration() {
  const configItems = [
    {
      name: 'Usuarios',
      description: 'Gestiona los usuarios del sistema y sus permisos',
      href: '/configuracion/usuarios',
      icon: UserGroupIcon,
    },
    {
      name: 'Empresas',
      description: 'Administra las empresas registradas en el sistema',
      href: '/configuracion/empresas',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Sedes',
      description: 'Configura las sedes de las empresas',
      href: '/configuracion/sedes',
      icon: MapPinIcon,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <AnimatedContainer>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-1 text-xs md:text-sm text-gray-500">
            Gestiona los ajustes generales del sistema
          </p>
        </div>
      </AnimatedContainer>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {configItems.map((item, index) => (
          <AnimatedContainer key={item.name} delay={0.1 * (index + 1)}>
            <Link
              to={item.href}
              className="relative group flex flex-col h-full rounded-lg border border-gray-200 bg-white p-4 md:p-6 hover:border-blue-400 hover:ring-1 hover:ring-blue-400 transition-all"
            >
              <div>
                <span className="inline-flex rounded-lg bg-blue-50 p-2 md:p-3">
                  <item.icon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-3 md:mt-4 flex-grow">
                <h3 className="text-base md:text-lg font-medium text-gray-900">
                  {item.name}
                  <span className="absolute inset-0" />
                </h3>
                <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500">
                  {item.description}
                </p>
              </div>
            </Link>
          </AnimatedContainer>
        ))}
      </div>
    </div>
  );
}
