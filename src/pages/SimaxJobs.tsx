import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Descriptions, 
  Progress, 
  Select, 
  DatePicker,
  Badge
} from 'antd';
import { 
  ReloadOutlined, 
  EyeOutlined, 
  PlayCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import simaxService, { BackupJob, BackupConfiguration } from '../services/simaxService';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Option } = Select;

const SimaxJobs: React.FC = () => {
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [configurations, setConfigurations] = useState<BackupConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadConfigurations(),
      loadAllJobs()
    ]);
    setLoading(false);
  };

  const loadConfigurations = async () => {
    const response = await simaxService.getAllConfigurations();
    if (response.success && response.data) {
      setConfigurations(response.data);
    }
  };

  const loadAllJobs = async () => {
    // Como no tenemos un endpoint para todos los jobs, cargamos por cliente
    const allJobs: BackupJob[] = [];
    
    for (const config of configurations) {
      const response = await simaxService.getJobsByClient(config.clientId, 50);
      if (response.success && response.data) {
        allJobs.push(...response.data);
      }
    }
    
    // Si no hay configuraciones aún, intentamos cargar jobs activos
    if (allJobs.length === 0) {
      const activeResponse = await simaxService.getActiveJobs();
      if (activeResponse.success && activeResponse.data) {
        allJobs.push(...activeResponse.data);
      }
    }
    
    // Ordenar por fecha de inicio descendente
    allJobs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    setJobs(allJobs);
  };

  // Función para iniciar backup (comentada por ahora)
  // const startBackup = async (clientId: string) => {
  //   const response = await simaxService.startBackup(clientId);
  //   if (response.success) {
  //     message.success('Backup iniciado exitosamente');
  //     loadAllJobs();
  //   } else {
  //     message.error(response.error || 'Error iniciando backup');
  //   }
  // };

  const showJobDetails = (job: BackupJob) => {
    setSelectedJob(job);
    setDetailModalVisible(true);
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      PENDING: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
      RUNNING: <PlayCircleOutlined style={{ color: '#722ed1' }} />,
      COMPLETED: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      FAILED: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      CANCELLED: <StopOutlined style={{ color: '#8c8c8c' }} />
    };
    return icons[status as keyof typeof icons] || <ClockCircleOutlined />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'processing', text: 'Pendiente' },
      RUNNING: { color: 'processing', text: 'Ejecutando' },
      COMPLETED: { color: 'success', text: 'Completado' },
      FAILED: { color: 'error', text: 'Fallido' },
      CANCELLED: { color: 'default', text: 'Cancelado' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    return <Badge status={config.color as any} text={config.text} />;
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '-';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatBytes = (bytes: number | undefined) => {
    if (!bytes) return '-';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Filtrar jobs
  const filteredJobs = jobs.filter(job => {
    if (selectedClient !== 'all' && job.clientId !== selectedClient) return false;
    if (selectedStatus !== 'all' && job.status !== selectedStatus) return false;
    
    if (dateRange && dateRange[0] && dateRange[1]) {
      const jobDate = dayjs(job.startedAt);
      if (!jobDate.isBetween(dateRange[0], dateRange[1], 'day', '[]')) return false;
    }
    
    return true;
  });

  const columns = [
    {
      title: 'Job ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Cliente',
      dataIndex: 'clientId',
      key: 'clientId',
      width: 200,
      render: (text: string, _record: BackupJob) => {
        // Buscar configuración para obtener hostname e IP
        const config = configurations.find(c => c.clientId === text);
        return (
          <div className="space-y-1">
            {config?.clientHostname && config?.clientIpAddress ? (
              <div className="font-semibold text-blue-600">
                {config.clientHostname.split('@')[1] || config.clientHostname}@{config.clientIpAddress}
              </div>
            ) : config?.clientHostname ? (
              <div className="font-semibold text-blue-600">{config.clientHostname}</div>
            ) : (
              <div className="font-semibold text-blue-600">{text}</div>
            )}
            <div className="text-xs text-gray-400 font-mono">{text.substring(0, 20)}...</div>
          </div>
        );
      },
    },
    {
      title: 'Alias',
      key: 'alias',
      width: 150,
      render: (_text: string, record: BackupJob) => {
        const config = configurations.find(c => c.clientId === record.clientId);
        return config?.alias ? (
          <div className="text-sm text-blue-600 font-medium">
            👤 {config.alias}
          </div>
        ) : (
          <div className="text-xs text-gray-400">Sin alias</div>
        );
      },
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(status)}
          {getStatusBadge(status)}
        </div>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'jobType',
      key: 'jobType',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'MANUAL' ? 'blue' : 'green'}>
          {type === 'MANUAL' ? 'Manual' : 'Programado'}
        </Tag>
      ),
    },
    {
      title: 'Progreso',
      key: 'progress',
      width: 160,
      render: (record: BackupJob) => {
        if (record.status === 'RUNNING' && record.progressPercentage !== undefined) {
          return (
            <div className="space-y-1">
              <Progress 
                percent={Math.round(record.progressPercentage)} 
                size="small" 
                status="active"
                showInfo={false}
              />
              <div className="text-xs text-gray-500 text-center">
                {Math.round(record.progressPercentage)}%
              </div>
            </div>
          );
        } else if (record.status === 'COMPLETED') {
          return (
            <div className="space-y-1">
              <Progress percent={100} size="small" status="success" showInfo={false} />
              <div className="text-xs text-green-600 text-center font-medium">Completado</div>
            </div>
          );
        } else if (record.status === 'FAILED') {
          return (
            <div className="space-y-1">
              <Progress percent={0} size="small" status="exception" showInfo={false} />
              <div className="text-xs text-red-600 text-center font-medium">Fallido</div>
            </div>
          );
        }
        return <div className="text-center text-gray-400">-</div>;
      },
    },
    {
      title: 'Archivos',
      key: 'files',
      width: 110,
      render: (record: BackupJob) => {
        if (record.filesTotal && record.filesProcessed !== undefined) {
          return (
            <div className="text-center">
              <div className="font-medium text-gray-800">
                {record.filesProcessed}/{record.filesTotal}
              </div>
              <div className="text-xs text-gray-500">
                📁 {Math.round((record.filesProcessed / record.filesTotal) * 100)}%
              </div>
            </div>
          );
        }
        return <div className="text-center text-gray-400">-</div>;
      },
    },
    {
      title: 'Datos Transferidos',
      dataIndex: 'bytesTransferred',
      key: 'bytesTransferred',
      width: 140,
      render: (bytes: number) => (
        <div className="text-center">
          <div className="font-medium text-gray-800">{formatBytes(bytes)}</div>
          <div className="text-xs text-gray-500">💾 Transferido</div>
        </div>
      ),
    },
    {
      title: 'Duración',
      dataIndex: 'durationSeconds',
      key: 'durationSeconds',
      width: 100,
      render: (seconds: number) => formatDuration(seconds),
    },
    {
      title: 'Iniciado',
      dataIndex: 'startedAt',
      key: 'startedAt',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Finalizado',
      dataIndex: 'finishedAt',
      key: 'finishedAt',
      width: 150,
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (record: BackupJob) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => showJobDetails(record)}
            className="min-w-[70px]"
          >
            Ver
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Jobs</h1>
          <p className="text-gray-600">Monitoreo y seguimiento de trabajos de backup</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <Select
              value={selectedClient}
              onChange={setSelectedClient}
              className="w-full"
            >
              <Option value="all">Todos los clientes</Option>
              {configurations.map(config => (
                <Option key={config.clientId} value={config.clientId}>
                  {config.clientId}
                </Option>
              ))}
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              className="w-full"
            >
              <Option value="all">Todos los estados</Option>
              <Option value="PENDING">Pendiente</Option>
              <Option value="RUNNING">Ejecutando</Option>
              <Option value="COMPLETED">Completado</Option>
              <Option value="FAILED">Fallido</Option>
              <Option value="CANCELLED">Cancelado</Option>
            </Select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rango de Fechas</label>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              className="w-full"
              format="DD/MM/YYYY"
            />
          </div>
        </div>
      </Card>

      {/* Tabla de Jobs */}
      <Card title={`Historial de Jobs (${filteredJobs.length} registros)`}>
        <Table
          columns={columns}
          dataSource={filteredJobs}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} jobs`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1400, y: 500 }}
          size="middle"
          className="custom-jobs-table"
        />
      </Card>

      {/* Modal de Detalles */}
      <Modal
        title={`Detalles del Job #${selectedJob?.id}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {selectedJob && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Job ID">{selectedJob.id}</Descriptions.Item>
            <Descriptions.Item label="Cliente">{selectedJob.clientId}</Descriptions.Item>
            <Descriptions.Item label="Alias">
              {(() => {
                const config = configurations.find(c => c.clientId === selectedJob.clientId);
                return config?.alias ? (
                  <div className="text-blue-600 font-medium">👤 {config.alias}</div>
                ) : (
                  <span className="text-gray-400">Sin alias</span>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Space>
                {getStatusIcon(selectedJob.status)}
                {getStatusBadge(selectedJob.status)}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Tipo">
              <Tag color={selectedJob.jobType === 'MANUAL' ? 'blue' : 'green'}>
                {selectedJob.jobType === 'MANUAL' ? 'Manual' : 'Programado'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Iniciado">
              {dayjs(selectedJob.startedAt).format('DD/MM/YYYY HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Finalizado">
              {selectedJob.finishedAt ? dayjs(selectedJob.finishedAt).format('DD/MM/YYYY HH:mm:ss') : 'En progreso'}
            </Descriptions.Item>
            <Descriptions.Item label="Duración">
              {formatDuration(selectedJob.durationSeconds)}
            </Descriptions.Item>
            <Descriptions.Item label="Progreso">
              {selectedJob.progressPercentage !== undefined ? `${Math.round(selectedJob.progressPercentage)}%` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Archivos Procesados">
              {selectedJob.filesProcessed || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Total de Archivos">
              {selectedJob.filesTotal || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Datos Transferidos" span={2}>
              {formatBytes(selectedJob.bytesTransferred)}
            </Descriptions.Item>
            {selectedJob.errorMessage && (
              <Descriptions.Item label="Error" span={2}>
                <div className="text-red-600 bg-red-50 p-2 rounded">
                  {selectedJob.errorMessage}
                </div>
              </Descriptions.Item>
            )}
            {selectedJob.logDetails && (
              <Descriptions.Item label="Detalles del Log" span={2}>
                <div className="bg-gray-50 p-2 rounded max-h-40 overflow-y-auto">
                  <pre className="text-xs">{selectedJob.logDetails}</pre>
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default SimaxJobs;

// Estilos CSS personalizados
const jobsStyles = `
.custom-jobs-table .ant-table-thead > tr > th {
  background-color: #fafafa;
  font-weight: 600;
  border-bottom: 2px solid #f0f0f0;
}

.custom-jobs-table .ant-table-tbody > tr > td {
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.custom-jobs-table .ant-table-tbody > tr:hover > td {
  background-color: #f8f9ff;
}

.custom-jobs-table .ant-btn {
  border-radius: 6px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.custom-jobs-table .ant-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.custom-jobs-table .ant-progress-line {
  margin: 0;
}

.custom-jobs-table .ant-progress-text {
  display: none;
}

.custom-jobs-table .ant-tag {
  border-radius: 12px;
  font-weight: 500;
  padding: 2px 8px;
  margin: 0;
}

.custom-jobs-table .ant-badge-status-dot {
  width: 8px;
  height: 8px;
}

.custom-jobs-table .ant-badge-status-text {
  font-size: 12px;
  font-weight: 500;
}
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = jobsStyles;
  document.head.appendChild(styleSheet);
}
