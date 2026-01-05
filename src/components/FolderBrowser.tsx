import React, { useState, useEffect } from 'react';
import { Modal, Tree, Button, Input, message, Spin, Alert } from 'antd';
import { FolderOutlined, HddOutlined, ArrowUpOutlined, ReloadOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import fileSystemService, { FileSystemItem } from '../services/fileSystemService';

interface FolderBrowserProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  initialPath?: string;
}

const FolderBrowser: React.FC<FolderBrowserProps> = ({ visible, onClose, onSelect, initialPath }) => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string>(initialPath || '');
  const [currentPath, setCurrentPath] = useState<string>('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (visible) {
      loadRoots();
    }
  }, [visible]);

  const loadRoots = async () => {
    setLoading(true);
    try {
      const roots = await fileSystemService.listRoots();
      const nodes = roots.map(root => convertToTreeNode(root));
      setTreeData(nodes);
    } catch (error) {
      message.error('Error al cargar las unidades del sistema');
    } finally {
      setLoading(false);
    }
  };

  const convertToTreeNode = (item: FileSystemItem): DataNode => {
    return {
      title: item.name || item.path,
      key: item.path,
      icon: item.type === 'drive' ? <HddOutlined /> : <FolderOutlined />,
      isLeaf: !item.hasChildren,
      disabled: !item.accessible,
      children: item.hasChildren ? [] : undefined,
    };
  };

  const onLoadData = async (node: any): Promise<void> => {
    const path = node.key as string;
    
    if (node.children && node.children.length > 0) {
      return;
    }

    try {
      const items = await fileSystemService.listDirectory(path);
      const children = items.map(item => convertToTreeNode(item));
      
      setTreeData(prevData => updateTreeData(prevData, node.key, children));
    } catch (error) {
      message.error('Error al cargar el contenido del directorio');
    }
  };

  const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] => {
    return list.map(node => {
      if (node.key === key) {
        return {
          ...node,
          children,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });
  };

  const onTreeSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const path = selectedKeys[0] as string;
      setSelectedPath(path);
      setCurrentPath(path);
    }
  };

  const onExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
  };

  const handleGoUp = async () => {
    if (!currentPath) return;
    
    try {
      const parent = await fileSystemService.getParentDirectory(currentPath);
      if (parent) {
        setSelectedPath(parent.path);
        setCurrentPath(parent.path);
      }
    } catch (error) {
      message.error('No se puede navegar al directorio superior');
    }
  };

  const handleRefresh = () => {
    loadRoots();
    setExpandedKeys([]);
  };

  const handleConfirm = async () => {
    if (!selectedPath) {
      message.warning('Por favor seleccione una carpeta');
      return;
    }

    // Validar la ruta antes de confirmar
    const validation = await fileSystemService.validatePath(selectedPath);
    if (!validation.valid) {
      message.error('La ruta seleccionada no es válida o no es accesible');
      return;
    }

    onSelect(selectedPath);
    onClose();
  };

  const handleManualInput = async () => {
    if (!selectedPath) {
      message.warning('Por favor ingrese una ruta');
      return;
    }

    const validation = await fileSystemService.validatePath(selectedPath);
    if (validation.valid) {
      message.success('Ruta válida');
      setCurrentPath(selectedPath);
    } else {
      message.error('La ruta no es válida o no es accesible');
    }
  };

  return (
    <Modal
      title="Explorador de Carpetas"
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm} disabled={!selectedPath}>
          Seleccionar
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Alert
          message="Seleccione la carpeta que desea respaldar"
          description="Navegue por el árbol de directorios o ingrese la ruta manualmente"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Button icon={<ArrowUpOutlined />} onClick={handleGoUp} disabled={!currentPath}>
            Subir
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Actualizar
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Input
            placeholder="Ruta del directorio (ej: C:\Users\Documents)"
            value={selectedPath}
            onChange={(e) => setSelectedPath(e.target.value)}
            onPressEnter={handleManualInput}
          />
          <Button type="primary" onClick={handleManualInput}>
            Validar
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        <div style={{ 
          border: '1px solid #d9d9d9', 
          borderRadius: 4, 
          padding: 16, 
          maxHeight: 400, 
          overflowY: 'auto' 
        }}>
          {treeData.length > 0 ? (
            <Tree
              showIcon
              loadData={onLoadData}
              treeData={treeData}
              onSelect={onTreeSelect}
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              selectedKeys={selectedPath ? [selectedPath] : []}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
              No hay unidades disponibles
            </div>
          )}
        </div>
      </Spin>

      {currentPath && (
        <div style={{ marginTop: 16, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
          <strong>Ruta actual:</strong> {currentPath}
        </div>
      )}
    </Modal>
  );
};

export default FolderBrowser;
