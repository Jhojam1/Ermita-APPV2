import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Button, 
  Switch, 
  Space, 
  message, 
  Divider,
  Table,
  Modal,
  Tag
} from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { 
  SaveOutlined, 
  PlusOutlined, 
  EditOutlined,
  CheckCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import simaxService, { BackupConfiguration } from '../services/simaxService';

const SimaxConfiguration: React.FC = () => {
  const [form] = Form.useForm();
  const [configurations, setConfigurations] = useState<BackupConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [editingConfig, setEditingConfig] = useState<BackupConfiguration | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setLoading(true);
    const response = await simaxService.getAllConfigurations();
    if (response.success && response.data) {
      setConfigurations(response.data);
    } else {
      message.error(response.error || 'Error cargando configuraciones');
    }
    setLoading(false);
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    
    const configData: BackupConfiguration = {
      ...values,
      id: editingConfig?.id,
      clientHostname: values.clientHostname || `web-${values.clientId}`,
      useManualPath: values.useManualPath || false,
      isActive: values.isActive !== false,
    };

    const response = await simaxService.saveConfiguration(configData);
    
    if (response.success) {
      message.success('Configuración guardada exitosamente');
      form.resetFields();
      setEditingConfig(null);
      setModalVisible(false);
      loadConfigurations();
    } else {
      message.error(response.error || 'Error guardando configuración');
    }
    
    setLoading(false);
  };

  const testSshConnection = async () => {
    const values = form.getFieldsValue();
    
    if (!values.clientId) {
      message.warning('Debe especificar un Client ID para probar la conexión');
      return;
    }

    setTestingConnection(true);
    
    // Primero guardamos temporalmente la configuración para poder probarla
    const tempConfig: BackupConfiguration = {
      ...values,
      clientHostname: values.clientHostname || `web-${values.clientId}`,
      useManualPath: values.useManualPath || false,
      isActive: false, // Temporal, no activa
    };

    const saveResponse = await simaxService.saveConfiguration(tempConfig);
    
    if (saveResponse.success) {
      const testResponse = await simaxService.testSshConnection(values.clientId);
      
      if (testResponse.success && testResponse.data) {
        if (testResponse.data.success) {
          message.success(testResponse.data.message);
        } else {
          message.error(testResponse.data.message);
        }
      } else {
        message.error(testResponse.error || 'Error probando conexión SSH');
      }
    } else {
      message.error('Error guardando configuración temporal para prueba');
    }
    
    setTestingConnection(false);
  };

  const editConfiguration = (config: BackupConfiguration) => {
    setEditingConfig(config);
    form.setFieldsValue(config);
    setModalVisible(true);
  };

  const newConfiguration = () => {
    setEditingConfig(null);
    form.resetFields();
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'clientId',
      key: 'clientId',
      width: 180,
      render: (text: string, record: BackupConfiguration) => (
        <div className="space-y-1">
          {record.clientHostname ? (
            <div className="font-semibold text-blue-600">{record.clientHostname}</div>
          ) : (
            <div className="font-semibold text-blue-600">{text}</div>
          )}
          <div className="text-xs text-gray-400 font-mono">{text.substring(0, 20)}...</div>
        </div>
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
        <div className="p-2">
          <Input
            placeholder="Buscar por hostname o alias"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 200, marginBottom: 8, display: 'block' }}
          />
          <div className="flex justify-between">
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Buscar
            </Button>
            <Button onClick={() => clearFilters?.()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value: any, record: BackupConfiguration) => {
        const searchValue = value.toString().toLowerCase();
        return (
          (record.clientHostname?.toLowerCase().includes(searchValue)) ||
          (record.alias?.toLowerCase().includes(searchValue)) ||
          false
        );
      },
    },
    {
      title: 'Alias',
      dataIndex: 'alias',
      key: 'alias',
      width: 120,
      render: (alias: string) => (
        alias ? (
          <div className="text-sm text-blue-600 font-medium">
            👤 {alias}
          </div>
        ) : (
          <div className="text-xs text-gray-400">Sin alias</div>
        )
      ),
    },
    {
      title: 'Directorio Origen',
      dataIndex: 'sourceDirectory',
      key: 'sourceDirectory',
      width: 150,
      ellipsis: true,
      render: (text: string) => (
        <span className="text-sm" title={text}>{text}</span>
      ),
    },
    {
      title: 'Destino SSH',
      key: 'sshDestination',
      width: 170,
      render: (record: BackupConfiguration) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-800">{record.sshHost}:{record.sshPort}</div>
          <div className="text-xs text-gray-500">👤 {record.sshUsername}</div>
          <div className="text-xs text-gray-500 truncate" title={record.sshRemotePath}>📁 {record.sshRemotePath}</div>
        </div>
      ),
    },
    {
      title: 'Frecuencia',
      dataIndex: 'frequencyHours',
      key: 'frequencyHours',
      width: 100,
      render: (hours: number) => `${hours}h`,
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (record: BackupConfiguration) => (
        <Space size="small" wrap>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => editConfiguration(record)}
            className="min-w-[70px]"
          >
            Editar
          </Button>
          <Button 
            icon={<CheckCircleOutlined />} 
            size="small"
            onClick={() => simaxService.testSshConnection(record.clientId)}
            className="min-w-[80px]"
          >
            Test SSH
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-3 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Configuración SIMAX</h1>
          <p className="text-sm md:text-base text-gray-600">Gestión de configuraciones de backup</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={newConfiguration}
          className="w-full md:w-auto"
        >
          Nueva Configuración
        </Button>
      </div>

      <Card title="Configuraciones Existentes" className="mb-6 overflow-x-auto">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={configurations}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} configuraciones`
            }}
            scroll={{ x: 1000 }}
            size="small"
            className="custom-config-table"
          />
        </div>
      </Card>

      {/* Modal de Configuración */}
      <Modal
        title={editingConfig ? 'Editar Configuración' : 'Nueva Configuración'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingConfig(null);
          form.resetFields();
        }}
        footer={null}
        width={window.innerWidth > 768 ? 800 : Math.max(window.innerWidth - 32, 300)}
        style={{ maxWidth: '100vw', top: 0 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', padding: '24px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            sshPort: 22,
            frequencyHours: 24,
            isActive: true,
            useManualPath: false,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Client ID"
              name="clientId"
              rules={[{ required: true, message: 'Client ID es requerido' }]}
            >
              <Input placeholder="ej: cliente-001" />
            </Form.Item>

            <Form.Item
              label="Hostname del Cliente"
              name="clientHostname"
            >
              <Input placeholder="ej: DESKTOP-ABC123@192.168.1.100" />
            </Form.Item>
          </div>

          <Form.Item
            label="Alias (Responsable)"
            name="alias"
            tooltip="Nombre del responsable del computador (ej: Jhojam)"
          >
            <Input placeholder="ej: Jhojam" />
          </Form.Item>

          <Form.Item
            label="Directorio de Origen"
            name="sourceDirectory"
            rules={[{ required: true, message: 'Directorio de origen es requerido' }]}
          >
            <Input placeholder="ej: C:/Users/Usuario/Documents" />
          </Form.Item>

          <Divider>Configuración SSH</Divider>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Host SSH"
              name="sshHost"
              rules={[{ required: true, message: 'Host SSH es requerido' }]}
            >
              <Input placeholder="ej: 192.168.2.18" />
            </Form.Item>

            <Form.Item
              label="Puerto SSH"
              name="sshPort"
              rules={[{ required: true, message: 'Puerto SSH es requerido' }]}
            >
              <InputNumber min={1} max={65535} className="w-full" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Usuario SSH"
              name="sshUsername"
              rules={[{ required: true, message: 'Usuario SSH es requerido' }]}
            >
              <Input placeholder="ej: admin" />
            </Form.Item>

            <Form.Item
              label="Contraseña SSH"
              name="sshPassword"
              rules={[{ required: true, message: 'Contraseña SSH es requerida' }]}
            >
              <Input.Password placeholder="Contraseña SSH" />
            </Form.Item>
          </div>

          <Form.Item
            label="Ruta Remota"
            name="sshRemotePath"
            rules={[{ required: true, message: 'Ruta remota es requerida' }]}
          >
            <Input placeholder="ej: /Backups" />
          </Form.Item>

          <Divider>Configuración de Backup</Divider>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Frecuencia (horas)"
              name="frequencyHours"
              rules={[{ required: true, message: 'Frecuencia es requerida' }]}
            >
              <InputNumber min={1} max={8760} className="w-full" />
            </Form.Item>

            <div className="space-y-4">
              <Form.Item
                label="Usar Ruta Manual"
                name="useManualPath"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Configuración Activa"
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-2 md:gap-4 pt-6 mt-6 border-t border-gray-200">
            <Button 
              icon={<CheckCircleOutlined />}
              onClick={testSshConnection}
              loading={testingConnection}
              className="w-full md:w-auto order-3 md:order-1"
            >
              Probar SSH
            </Button>
            <Button 
              onClick={() => setModalVisible(false)}
              className="w-full md:w-auto order-2"
            >
              Cancelar
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={loading}
              className="w-full md:w-auto order-1 md:order-3"
            >
              Guardar
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SimaxConfiguration;

// Estilos CSS personalizados
const configStyles = `
.custom-config-table .ant-table-thead > tr > th {
  background-color: #fafafa;
  font-weight: 600;
  border-bottom: 2px solid #f0f0f0;
}

.custom-config-table .ant-table-tbody > tr > td {
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.custom-config-table .ant-table-tbody > tr:hover > td {
  background-color: #f8f9ff;
}

.custom-config-table .ant-btn {
  border-radius: 6px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.custom-config-table .ant-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.custom-config-table .ant-btn-primary {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
}

.custom-config-table .ant-btn-primary:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
}

.custom-config-table .ant-tag {
  border-radius: 12px;
  font-weight: 500;
  padding: 2px 8px;
}
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = configStyles;
  document.head.appendChild(styleSheet);
}
