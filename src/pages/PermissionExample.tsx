import React from 'react';
import { PermissionWrapper, usePermissions } from '../components/PermissionWrapper';
import { Button, Card, Space, Typography } from 'antd';

const { Title, Text } = Typography;

// Ejemplo de cómo usar el sistema de permisos en tus páginas
const PermissionExample: React.FC = () => {
  const { hasPermission, canPerformAction, permissions } = usePermissions();

  return (
    <div className="p-6">
      <Title level={2}>Ejemplo de Sistema de Permisos</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Ejemplo 1: Mostrar botón solo si tiene permiso */}
        <Card title="Ejemplo 1: Botón condicional">
          <PermissionWrapper permission="INVENTORY_CREATE">
            <Button type="primary">Crear Elemento de Inventario</Button>
          </PermissionWrapper>
          
          <PermissionWrapper 
            permission="INVENTORY_CREATE"
            fallback={<Text type="secondary">No tienes permisos para crear elementos</Text>}
          >
            <Button type="primary">Crear con mensaje alternativo</Button>
          </PermissionWrapper>
        </Card>

        {/* Ejemplo 2: Verificación programática */}
        <Card title="Ejemplo 2: Verificación en código">
          {canPerformAction('MAINTENANCE', 'EDIT') ? (
            <Button type="primary">Editar Mantenimiento</Button>
          ) : (
            <Text type="secondary">Sin permisos para editar</Text>
          )}
        </Card>

        {/* Ejemplo 3: Mostrar permisos actuales */}
        <Card title="Tus permisos actuales">
          <ul>
            {permissions.map(permission => (
              <li key={permission}>
                <Text code>{permission}</Text>
              </li>
            ))}
          </ul>
        </Card>
      </Space>
    </div>
  );
};

export default PermissionExample;
