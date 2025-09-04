import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PermissionWrapperProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const { user } = useAuth();

  if (!user || !user.permissions) {
    return <>{fallback}</>;
  }

  const hasPermission = user.permissions.includes(permission);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

// Hook personalizado para verificar permisos
export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasModuleAccess = (module: string): boolean => {
    return user?.permissions?.some(p => p.startsWith(module)) || false;
  };

  const canPerformAction = (module: string, action: string): boolean => {
    const permissionName = `${module}_${action}`;
    return hasPermission(permissionName);
  };

  return {
    hasPermission,
    hasModuleAccess,
    canPerformAction,
    permissions: user?.permissions || []
  };
};

export default PermissionWrapper;
