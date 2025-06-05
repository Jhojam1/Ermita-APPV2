import React from 'react';

interface DateRangeFilterProps {
  fechaInicio: string;
  fechaFin: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => void;
  onGenerateReport: () => void;
  loading: boolean;
  reportGenerated: boolean;
  onDownloadPdf: () => void;
  generatingReport: boolean;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  fechaInicio,
  fechaFin,
  onDateChange,
  onGenerateReport,
  loading,
  reportGenerated,
  onDownloadPdf,
  generatingReport
}) => {
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Reportes de Mantenimiento</h1>
        {reportGenerated && (
          <button 
            onClick={onDownloadPdf}
            disabled={generatingReport}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {generatingReport ? 'Generando PDF...' : 'Descargar PDF'}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => onDateChange(e, 'start')}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => onDateChange(e, 'end')}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={onGenerateReport}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Generar Reporte'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;
