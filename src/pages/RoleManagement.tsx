import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Card, Typography, Transfer, Popconfirm, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { roleService, Role } from '../services/roleService';
import { permissionService, Permission } from '../services/permissionService';
import { PermissionWrapper } from '../components/PermissionWrapper';

const { Title } = Typography;


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
        const updateData = {
          name: values.name,
          description: values.description,
        };
        await roleService.updateRole(editingRole.id, updateData);
        message.success('Rol actualizado exitosamente');
      } else {
        const createData = {
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

  const handlePermissionChange = (targetKeys: any[]) => {
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
      render: (_: any, record: Role) => (
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
              icon={<SettingOutlined />}
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
    <div className="p-4 md:p-6">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Title level={2} className="!mb-0">Gestión de Roles</Title>
          <PermissionWrapper permission="USERS_CREATE">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
              className="w-full sm:w-auto"
            >
              Nuevo Rol
            </Button>
          </PermissionWrapper>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={roles}
            rowKey="id"
            loading={loading}
            scroll={{ x: 800 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              responsive: true,
            }}
          />
        </div>
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
        width="90%"
        style={{ maxWidth: 900 }}
        footer={[
          <Button key="cancel" onClick={() => setPermissionModalVisible(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={handleSavePermissions}
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
            className="w-full sm:w-auto mt-2 sm:mt-0"
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
          <div className="permission-transfer-container">
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
                width: '100%',
                minWidth: 250,
                height: 400,
              }}
              showSearch
              oneWay={false}
              style={{
                '--ant-transfer-operation-btn-cursor': 'pointer'
              } as React.CSSProperties}
            />
            <style>{`
              .permission-transfer-container .ant-transfer-operation .ant-btn {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                color: rgba(0, 0, 0, 0.65) !important;
              }
              
              .permission-transfer-container .ant-transfer-operation .ant-btn:disabled {
                display: flex !important;
                visibility: visible !important;
                opacity: 0.6 !important;
                color: rgba(0, 0, 0, 0.25) !important;
              }
              
              .permission-transfer-container .ant-transfer-operation .ant-btn .anticon {
                display: block !important;
                visibility: visible !important;
                color: inherit !important;
              }
              
              .permission-transfer-container .ant-transfer-operation .ant-btn:hover:not(:disabled) {
                background-color: #1890ff !important;
                border-color: #1890ff !important;
                color: #fff !important;
              }
              
              .permission-transfer-container .ant-transfer-operation .ant-btn:hover:not(:disabled) .anticon {
                color: #fff !important;
              }
              
              .permission-transfer-container :global(.ant-transfer-list-header) {
                background: #fafafa;
                border-bottom: 1px solid #f0f0f0;
                padding: 12px 16px;
                font-weight: 500;
              }
              
              .permission-transfer-container :global(.ant-transfer-list-body) {
                background: #fff;
              }
              
              .permission-transfer-container :global(.ant-transfer-list-content-item:hover) {
                background-color: #e6f7ff;
                border-color: #1890ff;
              }
              
              .permission-transfer-container :global(.ant-transfer-list-content-item.ant-transfer-list-content-item-checked) {
                background-color: #1890ff;
                color: #fff;
              }
              
              .permission-transfer-container :global(.ant-transfer-list-content-item.ant-transfer-list-content-item-checked:hover) {
                background-color: #096dd9;
              }
              @media (max-width: 768px) {
                .permission-transfer-container .ant-transfer {
                  flex-direction: column !important;
                }
                .permission-transfer-container .ant-transfer-list {
                  width: 100% !important;
                  margin-bottom: 16px;
                }
                .permission-transfer-container .ant-transfer-operation {
                  flex-direction: row !important;
                  margin: 16px 0 !important;
                }
              }
            `}</style>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoleManagement;
