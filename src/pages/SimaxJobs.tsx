import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Badge, 
  Space, 
  message, 
  Select, 
  DatePicker, 
  Progress,
  Modal,
  Descriptions,
  Tag
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

  const startBackup = async (clientId: string) => {
    const response = await simaxService.startBackup(clientId);
    if (response.success) {
      message.success('Backup iniciado exitosamente');
      loadAllJobs();
    } else {
      message.error(response.error || 'Error iniciando backup');
    }
  };

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
    
    if (dateRange) {
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
      width: 150,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Space>
          {getStatusIcon(status)}
          {getStatusBadge(status)}
        </Space>
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
      width: 150,
      render: (record: BackupJob) => {
        if (record.status === 'RUNNING' && record.progressPercentage !== undefined) {
          return (
            <Progress 
              percent={Math.round(record.progressPercentage)} 
              size="small" 
              status="active"
            />
          );
        } else if (record.status === 'COMPLETED') {
          return <Progress percent={100} size="small" status="success" />;
        } else if (record.status === 'FAILED') {
          return <Progress percent={0} size="small" status="exception" />;
        }
        return '-';
      },
    },
    {
      title: 'Archivos',
      key: 'files',
      width: 100,
      render: (record: BackupJob) => {
        if (record.filesTotal && record.filesProcessed !== undefined) {
          return `${record.filesProcessed}/${record.filesTotal}`;
        }
        return '-';
      },
    },
    {
      title: 'Datos Transferidos',
      dataIndex: 'bytesTransferred',
      key: 'bytesTransferred',
      width: 120,
      render: (bytes: number) => formatBytes(bytes),
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
      width: 100,
      fixed: 'right' as const,
      render: (record: BackupJob) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => showJobDetails(record)}
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
              onChange={setDateRange}
              className="w-full"
              format="DD/MM/YYYY"
            />
          </div>
        </div>
      </Card>

      {/* Tabla de Jobs */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredJobs}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} jobs`
          }}
          scroll={{ x: 1200 }}
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
