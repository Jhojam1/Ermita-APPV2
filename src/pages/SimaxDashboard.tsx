import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Badge, Space, message, Modal, Progress } from 'antd';
import {
  CloudUploadOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import simaxService, { BackupConfiguration, BackupJob } from '../services/simaxService';
import SimaxWebSocketService, { BackupProgressData } from '../services/simaxWebSocketService';

const SimaxDashboard: React.FC = () => {
  const [configurations, setConfigurations] = useState<BackupConfiguration[]>([]);
  const [activeJobs, setActiveJobs] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
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
    const response = await simaxService.getAllConfigurations();
    if (response.success && response.data) {
      setConfigurations(response.data);
    } else {
      message.error(response.error || 'Error cargando configuraciones');
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
    const response = await simaxService.startBackup(clientId);
    if (response.success) {
      message.success('Backup iniciado exitosamente');
      loadActiveJobs();
    } else {
      message.error(response.error || 'Error iniciando backup');
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

  const configurationColumns = [
    {
      title: 'Cliente',
      dataIndex: 'clientId',
      key: 'clientId',
      render: (text: string, record: BackupConfiguration) => (
        <div>
          {record.clientHostname && (
            <div className="font-medium">
              {record.clientHostname.split('@')[1]}@{record.clientIpAddress || 'N/A'}
            </div>
          )}
          <div className="text-xs text-gray-500">{text}</div>
        </div>
      ),
    },
    {
      title: 'Directorio Origen',
      dataIndex: 'sourceDirectory',
      key: 'sourceDirectory',
      ellipsis: true,
    },
    {
      title: 'Destino SSH',
      key: 'sshDestination',
      render: (record: BackupConfiguration) => (
        <div>
          <div>{record.sshHost}:{record.sshPort}</div>
          <div className="text-xs text-gray-500">{record.sshRemotePath}</div>
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
        <Badge status={isActive ? 'success' : 'default'} text={isActive ? 'Activo' : 'Inactivo'} />
      ),
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
      width: 180,
      fixed: 'right' as const,
      render: (record: BackupConfiguration) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />}
            size="small"
            onClick={() => startBackup(record.clientId)}
            style={{ minWidth: '80px' }}
          >
            Backup
          </Button>
          <Button 
            icon={<DatabaseOutlined />}
            size="small"
            onClick={() => testSshConnection(record.clientId)}
            style={{ minWidth: '90px' }}
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

  const activeConfigurations = configurations.filter(c => c.isActive).length;
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
              title="Configuraciones Activas"
              value={activeConfigurations}
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
              value={configurations.length}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Configuraciones */}
      <Card title="Configuraciones de Backup" className="mb-6">
        <Table
          columns={configurationColumns}
          dataSource={configurations}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
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
