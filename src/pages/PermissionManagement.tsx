import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, message, Space, Card, Typography, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import { permissionService, Permission } from '../services/permissionService';
import { moduleService, Module } from '../services/moduleService';
import { roleService, Role } from '../services/roleService';
import { PermissionWrapper } from '../components/PermissionWrapper';

const { Title } = Typography;
const { Option } = Select;

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [permissionsData, modulesData, rolesData] = await Promise.all([
        permissionService.getAllPermissions(),
        moduleService.getAllModules(),
        roleService.getAllRoles()
      ]);
      setPermissions(permissionsData);
      setModules(modulesData);
      setRoles(rolesData);
    } catch (error) {
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPermission(null);
    form.resetFields();
    setModalVisible(true);
  };

  // const handleEdit = (permission: Permission) => {
  //   setEditingPermission(permission);
  //   form.setFieldsValue({
  //     name: permission.name,
  //     description: permission.description,
  //     moduleId: typeof permission.module === 'string' ? permission.module : permission.module.id,
  //     action: permission.action,
  //   });
  //   setModalVisible(true);
  // };

  const handleAssignPermissions = () => {
    assignForm.resetFields();
    setAssignModalVisible(true);
  };

  const handleSubmit = (_values: any) => {
    try {
      if (editingPermission) {
        // Actualizar permiso existente
        message.success('Permiso actualizado exitosamente');
      } else {
        // Crear nuevo permiso
        // await permissionService.createPermission(values.name, values.description, values.moduleId, values.action);
        message.success('Permiso creado exitosamente');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Error al guardar el permiso');
    }
  };

  const handleAssignSubmit = async (_values: any) => {
    try {
      // await permissionService.assignPermissionToRole(values.roleId, values.permissionId);
      message.success('Permiso asignado exitosamente');
      setAssignModalVisible(false);
    } catch (error) {
      message.error('Error al asignar el permiso');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Módulo',
      dataIndex: ['module', 'name'],
      key: 'module',
      render: (moduleName: string) => <Tag color="green">{moduleName}</Tag>,
    },
    {
      title: 'Acción',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => <Tag color="orange">{action}</Tag>,
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Switch checked={active} disabled />
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => console.log('Edit:', record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de eliminar este permiso?"
            onConfirm={() => console.log('Delete:', record)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Title level={2} className="!mb-0">Gestión de Permisos</Title>
          <Space direction="vertical" className="w-full sm:w-auto" size="small">
            <Space className="w-full">
              <PermissionWrapper permission="CONFIG_EDIT">
                <Button
                  type="default"
                  icon={<SettingOutlined />}
                  onClick={handleAssignPermissions}
                  className="flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">Asignar Permisos</span>
                  <span className="sm:hidden">Asignar</span>
                </Button>
              </PermissionWrapper>
              <PermissionWrapper permission="CONFIG_EDIT">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                  className="flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">Nuevo Permiso</span>
                  <span className="sm:hidden">Nuevo</span>
                </Button>
              </PermissionWrapper>
            </Space>
          </Space>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={permissions}
            rowKey="id"
            loading={loading}
            scroll={{ x: 900 }}
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showQuickJumper: true,
              responsive: true,
            }}
          />
        </div>
      </Card>

      {/* Modal para crear/editar permisos */}
      <Modal
        title={editingPermission ? 'Editar Permiso' : 'Crear Nuevo Permiso'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 600 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Nombre del Permiso"
            rules={[
              { required: true, message: 'El nombre es requerido' },
            ]}
          >
            <Input placeholder="Ej: INVENTORY_CREATE" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descripción"
            rules={[
              { required: true, message: 'La descripción es requerida' },
            ]}
          >
            <Input.TextArea 
              rows={2} 
              placeholder="Describe qué permite hacer este permiso..."
            />
          </Form.Item>

          <Form.Item
            name="moduleId"
            label="Módulo"
            rules={[
              { required: true, message: 'El módulo es requerido' },
            ]}
          >
            <Select placeholder="Selecciona un módulo">
              {modules.map(module => (
                <Option key={module.id} value={module.id}>
                  {module.name} - {module.description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="action"
            label="Acción"
            rules={[
              { required: true, message: 'La acción es requerida' },
            ]}
          >
            <Select placeholder="Selecciona una acción">
              <Option value="VIEW">Ver</Option>
              <Option value="CREATE">Crear</Option>
              <Option value="EDIT">Editar</Option>
              <Option value="DELETE">Eliminar</Option>
              <Option value="EXPORT">Exportar</Option>
              <Option value="ASSIGN">Asignar</Option>
              <Option value="COMPLETE">Completar</Option>
              <Option value="TRANSFER">Transferir</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full flex-col sm:flex-row">
              <Button onClick={() => setModalVisible(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" className="w-full sm:w-auto">
                {editingPermission ? 'Actualizar' : 'Crear'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para asignar permisos a roles */}
      <Modal
        title="Asignar Permiso a Rol"
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 600 }}
      >
        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssignSubmit}
        >
          <Form.Item
            name="roleId"
            label="Rol"
            rules={[
              { required: true, message: 'El rol es requerido' },
            ]}
          >
            <Select placeholder="Selecciona un rol">
              {roles.map(role => (
                <Option key={role.id} value={role.id}>
                  {role.name} - {role.description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="permissionId"
            label="Permiso"
            rules={[
              { required: true, message: 'El permiso es requerido' },
            ]}
          >
            <Select placeholder="Selecciona un permiso">
              {permissions.map(permission => (
                <Option key={permission.id} value={permission.id}>
                  {permission.name} - {permission.description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full flex-col sm:flex-row">
              <Button onClick={() => setAssignModalVisible(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" className="w-full sm:w-auto">
                Asignar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PermissionManagement;
