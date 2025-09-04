import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Card, Typography, Popconfirm, Tabs, Transfer, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import { roleService, Role, CreateRoleRequest, UpdateRoleRequest } from '../services/roleService';
import { permissionService, Permission } from '../services/permissionService';
import { PermissionWrapper } from '../components/PermissionWrapper';

const { Title } = Typography;
const { TabPane } = Tabs;

interface TransferItem {
  key: string;
  title: string;
  description?: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const rolesData = await roleService.getAllRoles();
      setRoles(rolesData);
    } catch (error) {
      message.error('Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const permissionsData = await permissionService.getAllPermissions();
      setPermissions(permissionsData);
    } catch (error) {
      message.error('Error al cargar los permisos');
    }
  };

  const fetchRolePermissions = async (roleId: number) => {
    setPermissionLoading(true);
    try {
      const rolePermissionsData = await roleService.getRolePermissions(roleId);
      setRolePermissions(rolePermissionsData);
    } catch (error) {
      message.error('Error al cargar los permisos del rol');
    } finally {
      setPermissionLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await roleService.deleteRole(id);
      message.success('Rol eliminado exitosamente');
      fetchRoles();
    } catch (error) {
      message.error('Error al eliminar el rol');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRole) {
        const updateData: UpdateRoleRequest = {
          name: values.name,
          description: values.description,
        };
        await roleService.updateRole(editingRole.id, updateData);
        message.success('Rol actualizado exitosamente');
      } else {
        const createData: CreateRoleRequest = {
          name: values.name,
          description: values.description,
        };
        await roleService.createRole(createData);
        message.success('Rol creado exitosamente');
      }
      setModalVisible(false);
      fetchRoles();
    } catch (error) {
      message.error('Error al guardar el rol');
    }
  };

  const handleManagePermissions = async (role: Role) => {
    setSelectedRole(role);
    await fetchRolePermissions(role.id);
    setPermissionModalVisible(true);
  };

  const handlePermissionChange = (targetKeys: string[]) => {
    setRolePermissions(targetKeys);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    
    try {
      await roleService.updateRolePermissions(selectedRole.id, rolePermissions);
      message.success('Permisos actualizados exitosamente');
      setPermissionModalVisible(false);
    } catch (error) {
      message.error('Error al actualizar los permisos');
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
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Tipo',
      dataIndex: 'systemRole',
      key: 'systemRole',
      render: (systemRole: boolean) => (
        <span className={systemRole ? 'text-blue-600' : 'text-green-600'}>
          {systemRole ? 'Sistema' : 'Personalizado'}
        </span>
      ),
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
      render: (_, record: Role) => (
        <Space>
          <PermissionWrapper permission="USERS_EDIT">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Editar
            </Button>
          </PermissionWrapper>
          
          <PermissionWrapper permission="CONFIGURATION_MANAGE_PERMISSIONS">
            <Button
              type="link"
              icon={<KeyOutlined />}
              onClick={() => handleManagePermissions(record)}
            >
              Permisos
            </Button>
          </PermissionWrapper>
          
          <PermissionWrapper permission="USERS_DELETE">
            {!record.systemRole && (
              <Popconfirm
                title="¿Estás seguro de eliminar este rol?"
                onConfirm={() => handleDelete(record.id)}
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
            )}
          </PermissionWrapper>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Gestión de Roles</Title>
          <PermissionWrapper permission="USERS_CREATE">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
            >
              Nuevo Rol
            </Button>
          </PermissionWrapper>
        </div>

        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Modal
        title={editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Nombre del Rol"
            rules={[
              { required: true, message: 'El nombre es requerido' },
              { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Supervisor, Gerente, etc." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descripción"
            rules={[
              { required: true, message: 'La descripción es requerida' },
            ]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Describe las responsabilidades de este rol..."
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancelar
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
              >
                {editingRole ? 'Actualizar' : 'Crear'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Gestionar Permisos - ${selectedRole?.name}`}
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setPermissionModalVisible(false)}>
            Cancelar
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={handleSavePermissions}
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
          >
            Guardar Permisos
          </Button>,
        ]}
      >
        {permissionLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <Transfer
            dataSource={permissions.map(p => ({
              key: p.name,
              title: p.name,
              description: p.description,
            }))}
            titles={['Permisos Disponibles', 'Permisos Asignados']}
            targetKeys={rolePermissions}
            onChange={handlePermissionChange}
            render={item => `${item.title} - ${item.description}`}
            listStyle={{
              width: 350,
              height: 400,
            }}
            showSearch
            filterOption={(inputValue, option) =>
              option.title.toLowerCase().includes(inputValue.toLowerCase()) ||
              (option.description && option.description.toLowerCase().includes(inputValue.toLowerCase()))
            }
          />
        )}
      </Modal>
    </div>
  );
};

export default RoleManagement;
