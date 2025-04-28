import { useState, useEffect } from 'react';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulamos carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tarjeta de Inventario */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700">Inventario</h2>
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-800">127</p>
                <p className="text-sm text-gray-500">Equipos registrados</p>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">70% del total en uso</p>
              </div>
            </div>

            {/* Tarjeta de Mantenimientos */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700">Mantenimientos</h2>
                <div className="p-2 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-800">24</p>
                <p className="text-sm text-gray-500">Pendientes este mes</p>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">40% completados</p>
              </div>
            </div>

            {/* Tarjeta de Reportes */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700">Reportes</h2>
                <div className="p-2 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-800">12</p>
                <p className="text-sm text-gray-500">Generados este mes</p>
              </div>
              <div className="mt-4">
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Excel</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">PDF</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Gráficos</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Actividad Reciente */}
        {!isLoading && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Actividad Reciente</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((item) => (
                  <li key={item} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Mantenimiento preventivo realizado
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          Equipo ID-{item}00{item} - {new Date(2025, 3, 27 - item).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="inline-flex items-center text-xs font-semibold text-gray-500">
                        {item === 1 ? "Hoy" : item === 2 ? "Ayer" : `Hace ${item} días`}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
