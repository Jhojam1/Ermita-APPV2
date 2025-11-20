import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Badge, Space, message, Modal, Progress, Tag } from 'antd';
import {
  CloudUploadOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  ReloadOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import simaxService, { BackupConfiguration, BackupJob } from '../services/simaxService';
import SimaxWebSocketService, { BackupProgressData } from '../services/simaxWebSocketService';

const SimaxDashboard: React.FC = () => {
  const [configurations, setConfigurations] = useState<BackupConfiguration[]>([]); // Solo clientes conectados
  const [allConfigurations, setAllConfigurations] = useState<BackupConfiguration[]>([]); // Todas las configuraciones
  const [activeJobs, setActiveJobs] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [backupLoading, setBackupLoading] = useState<Set<string>>(new Set());
  const [wsService] = useState(() => new SimaxWebSocketService('admin-dashboard'));
  const [progressModal, setProgressModal] = useState<{
    visible: boolean;
    jobId?: number;
    progress: number;
    message: string;
    clientId?: string;
  }>({
    visible: false,
    progress: 0,
    message: ''
  });

  useEffect(() => {
    loadData();
    connectWebSocket();

    return () => {
      wsService.disconnect();
    };
  }, []);

  const connectWebSocket = async () => {
    const connected = await wsService.connect();
    setWsConnected(connected);

    // Configurar listeners
    wsService.on('connection', (data) => {
      setWsConnected(data.connected);
    });

    wsService.on('backupStarted', (data) => {
      message.success(`Backup iniciado: Job ID ${data.jobId}`);
      loadActiveJobs();
    });

    wsService.on('backupProgress', (data: BackupProgressData) => {
      setProgressModal(prev => ({
        ...prev,
        visible: true,
        jobId: data.jobId,
        progress: data.progress,
        message: data.message
      }));
    });

    wsService.on('backupCompleted', (data) => {
      message.success(`Backup completado: Job ID ${data.jobId}`);
      
      // Cerrar modal de progreso
      setProgressModal(prev => ({
        ...prev,
        visible: false
      }));
      
      // Limpiar estado de loading
      if (data.clientId) {
        setBackupLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.clientId);
          return newSet;
        });
      }
      
      loadActiveJobs();
      loadConfigurations(); // Recargar configuraciones para actualizar "Último Backup"
    });

    wsService.on('backupFailed', (data) => {
      message.error(`Backup falló: ${data.error || 'Error desconocido'}`);
      
      // Cerrar modal de progreso
      setProgressModal(prev => ({
        ...prev,
        visible: false
      }));
      
      // Limpiar estado de loading
      if (data.clientId) {
        setBackupLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.clientId);
          return newSet;
        });
      }
      
      loadActiveJobs();
    });

    wsService.on('error', (data) => {
      message.error(data.error || 'Error en WebSocket');
    });
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadConfigurations(),
      loadActiveJobs()
    ]);
    setLoading(false);
  };

  const loadConfigurations = async () => {
    // Cargar clientes activos (conectados)
    const activeResponse = await simaxService.getAllActiveConfigurations();
    if (activeResponse.success && activeResponse.data) {
      setConfigurations(activeResponse.data);
    }

    // Cargar todas las configuraciones
    const allResponse = await simaxService.getAllConfigurations();
    if (allResponse.success && allResponse.data) {
      setAllConfigurations(allResponse.data);
    } else {
      message.error(allResponse.error || 'Error cargando configuraciones');
    }
  };

  const loadActiveJobs = async () => {
    const response = await simaxService.getActiveJobs();
    if (response.success && response.data) {
      setActiveJobs(response.data);
    } else {
      message.error(response.error || 'Error cargando jobs activos');
    }
  };

  const startBackup = async (clientId: string) => {
    // Agregar cliente al estado de loading
    setBackupLoading(prev => new Set(prev).add(clientId));
    
    // Mostrar loading y modal de progreso inmediatamente
    setProgressModal({
      visible: true,
      progress: 0,
      message: 'Iniciando backup...',
      clientId: clientId
    });

    try {
      const response = await simaxService.startBackup(clientId);
      if (response.success) {
        message.success('Backup iniciado exitosamente');
        
        // Actualizar modal con job ID
        setProgressModal(prev => ({
          ...prev,
          jobId: response.data?.jobId,
          progress: 10,
          message: 'Backup en progreso...'
        }));
        
        loadActiveJobs();
      } else {
        message.error(response.error || 'Error iniciando backup');
        
        // Cerrar modal y remover loading en caso de error
        setProgressModal(prev => ({
          ...prev,
          visible: false
        }));
        setBackupLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(clientId);
          return newSet;
        });
      }
    } catch (error) {
      message.error('Error de conexión al iniciar backup');
      setProgressModal(prev => ({
        ...prev,
        visible: false
      }));
      setBackupLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(clientId);
        return newSet;
      });
    }
  };

  const testSshConnection = async (clientId: string) => {
    const response = await simaxService.testSshConnection(clientId);
    if (response.success && response.data) {
      if (response.data.success) {
        message.success(response.data.message);
      } else {
        message.error(response.data.message);
      }
    } else {
      message.error(response.error || 'Error probando conexión SSH');
    }
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

  // Columnas para "Configuraciones de Backup" (todas las configuraciones registradas)
  const configurationColumns = [
    {
      title: 'Cliente',
      dataIndex: 'clientId',
      key: 'clientId',
      render: (text: string, record: BackupConfiguration) => (
        <div>
          <div className="font-medium">{record.clientHostname || text}</div>
          <div className="text-xs text-gray-500">{text}</div>
        </div>
      ),
    },
    {
      title: 'Directorio Origen',
      dataIndex: 'sourceDirectory',
      key: 'sourceDirectory',
    },
    {
      title: 'Destino SSH',
      key: 'sshDestination',
      render: (record: BackupConfiguration) => (
        <div className="text-xs">
          <div>{record.sshHost}:{record.sshPort}</div>
          <div className="text-gray-500">{record.sshRemotePath}</div>
        </div>
      ),
    },
    {
      title: 'Frecuencia',
      dataIndex: 'frequencyHours',
      key: 'frequencyHours',
      render: (hours: number) => `${hours}h`,
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Último Backup',
      dataIndex: 'lastBackupAt',
      key: 'lastBackupAt',
      render: (date: string) => date ? new Date(date).toLocaleString() : 'Nunca',
    },
  ];

  // Columnas para tabla de "Clientes Activos" (solo conectados, con acciones)
  const activeClientsColumns = [
    {
      title: 'Cliente',
      dataIndex: 'clientId',
      key: 'clientId',
      render: (text: string, record: BackupConfiguration) => (
        <div>
          <div className="font-medium text-green-600">{record.clientHostname || text}</div>
          <div className="text-xs text-gray-500">{text}</div>
          <div className="text-xs text-green-500"> Conectado</div>
        </div>
      ),
    },
    {
      title: 'Directorio Origen',
      dataIndex: 'sourceDirectory',
      key: 'sourceDirectory',
    },
    {
      title: 'Destino SSH',
      key: 'sshDestination',
      render: (record: BackupConfiguration) => (
        <div className="text-xs">
          <div>{record.sshHost}:{record.sshPort}</div>
          <div className="text-gray-500">{record.sshRemotePath}</div>
        </div>
      ),
    },
    {
      title: 'Frecuencia',
      dataIndex: 'frequencyHours',
      key: 'frequencyHours',
      render: (hours: number) => `${hours}h`,
    },
    {
      title: 'Último Backup',
      dataIndex: 'lastBackupAt',
      key: 'lastBackupAt',
      render: (date: string) => date ? new Date(date).toLocaleString() : 'Nunca',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (record: BackupConfiguration) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => startBackup(record.clientId)}
            loading={backupLoading.has(record.clientId)}
            className="min-w-[80px]"
          >
            Backup
          </Button>
          <Button
            size="small"
            onClick={() => testSshConnection(record.clientId)}
            className="min-w-[80px]"
          >
            Test SSH
          </Button>
        </Space>
      ),
    },
  ];

  const jobColumns = [
    {
      title: 'Job ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Cliente',
      dataIndex: 'clientId',
      key: 'clientId',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: 'Tipo',
      dataIndex: 'jobType',
      key: 'jobType',
      render: (type: string) => type === 'MANUAL' ? 'Manual' : 'Programado',
    },
    {
      title: 'Progreso',
      key: 'progress',
      render: (record: BackupJob) => {
        if (record.status === 'RUNNING' && record.progressPercentage !== undefined) {
          return <Progress percent={Math.round(record.progressPercentage)} size="small" />;
        }
        return record.status === 'COMPLETED' ? '100%' : '-';
      },
    },
    {
      title: 'Archivos',
      key: 'files',
      render: (record: BackupJob) => {
        if (record.filesTotal && record.filesProcessed !== undefined) {
          return `${record.filesProcessed}/${record.filesTotal}`;
        }
        return '-';
      },
    },
    {
      title: 'Iniciado',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  const activeClients = configurations.length; // Solo clientes conectados
  const totalConfigurations = allConfigurations.length; // Todas las configuraciones
  const totalJobs = activeJobs.length;
  const runningJobs = activeJobs.filter(j => j.status === 'RUNNING').length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SIMAX - Sistema de Backups</h1>
          <p className="text-gray-600">Administración y monitoreo de backups automáticos</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge 
            status={wsConnected ? 'success' : 'error'} 
            text={wsConnected ? 'WebSocket Conectado' : 'WebSocket Desconectado'} 
          />
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Clientes Conectados"
              value={activeClients}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Jobs Activos"
              value={totalJobs}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ejecutándose"
              value={runningJobs}
              prefix={<CloudUploadOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Configuraciones"
              value={totalConfigurations}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Clientes Activos */}
      <Card title="Clientes Activos" className="mb-6">
        <Table
          columns={activeClientsColumns}
          dataSource={configurations}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} clientes activos`
          }}
          scroll={{ x: 1000, y: 300 }}
          size="middle"
          className="custom-table"
          locale={{
            emptyText: 'No hay clientes conectados'
          }}
        />
      </Card>

      {/* Configuraciones de Backup */}
      <Card title="Configuraciones de Backup" className="mb-6">
        <Table
          columns={configurationColumns}
          dataSource={allConfigurations}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} configuraciones`
          }}
          scroll={{ x: 1000, y: 300 }}
          size="middle"
          className="custom-table"
        />
      </Card>

      {/* Jobs Activos */}
      <Card title="Jobs Activos">
        <Table
          columns={jobColumns}
          dataSource={activeJobs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal de Progreso */}
      <Modal
        title="Progreso del Backup"
        open={progressModal.visible}
        onCancel={() => setProgressModal(prev => ({ ...prev, visible: false }))}
        footer={null}
        width={500}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Job ID: {progressModal.jobId}</p>
            <Progress 
              percent={progressModal.progress} 
              status={progressModal.progress === 100 ? 'success' : 'active'}
            />
          </div>
          <div>
            <p className="text-sm font-medium">Estado:</p>
            <p className="text-sm text-gray-600">{progressModal.message}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SimaxDashboard;

// Estilos CSS personalizados
const styles = `
.custom-table .ant-table-thead > tr > th {
  background-color: #fafafa;
  font-weight: 600;
  border-bottom: 2px solid #f0f0f0;
}

.custom-table .ant-table-tbody > tr > td {
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.custom-table .ant-table-tbody > tr:hover > td {
  background-color: #f8f9ff;
}

.custom-table .ant-btn {
  border-radius: 6px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.custom-table .ant-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.custom-table .ant-btn-primary {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
}

.custom-table .ant-btn-primary:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
}
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
