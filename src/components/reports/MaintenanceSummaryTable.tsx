import React from 'react';
import AnimatedContainer from '../ui/AnimatedContainer';

interface SummaryItem {
  type: string;
  quantity: number;
  averageTime: string;
}

interface MaintenanceSummaryTableProps {
  data: SummaryItem[];
  containerRef: React.RefObject<any>;
  delay?: number;
}

const MaintenanceSummaryTable: React.FC<MaintenanceSummaryTableProps> = ({ 
  data, 
  containerRef, 
  delay = 0.5 
}) => {
  return (
    <AnimatedContainer delay={delay}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden" ref={containerRef}>
        <h3 className="text-lg font-semibold p-6 border-b">Resumen de Mantenimientos</h3>
        <div className="p-6 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Cantidad</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Tiempo Promedio</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr 
                    key={item.type}
                    className={`${index < data.length - 1 ? 'border-b' : ''} ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                  >
                    <td className="py-3 px-4 text-sm">
                      {item.type}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-center">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      {item.averageTime}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500">
                    No hay datos de mantenimientos para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default MaintenanceSummaryTable;
