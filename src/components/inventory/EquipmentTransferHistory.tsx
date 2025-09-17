import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Typography, 
  Space, 
 
  Tooltip,
  message, 
  Button, 
  Select,
  Divider 
} from 'antd';
import { 
  SwapOutlined, 
  HistoryOutlined, 
  InfoCircleOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import inventoryTransferService, { InventoryTransfer } from '../../services/InventoryTransferService';
import inventoryService, { InventoryItem as ServiceInventoryItem } from '../../services/inventoryService';

const { Title, Text } = Typography;
const { Option } = Select;

// Usar la interfaz del servicio
type InventoryItem = ServiceInventoryItem;

const EquipmentTransferHistory: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [transfers, setTransfers] = useState<InventoryTransfer[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await inventoryService.getAllItems();
        // Filtrar solo items con id definido
        const itemsWithId = (response || []).filter((item): item is ServiceInventoryItem & { id: number } => 
          item.id !== undefined
        );
        setInventoryItems(itemsWithId);
      } catch (error) {
        console.error('Error al cargar los equipos:', error);
        message.error('Error al cargar los equipos.');
      }
    };

    fetchInventoryItems();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      fetchTransfersForItem(selectedItem);
    } else {
      fetchAllTransfers();
    }
  }, [selectedItem]);

  const fetchAllTransfers = async () => {
    setLoading(true);
    try {
      const response = await inventoryTransferService.getAllTransfers();
      setTransfers(response.data);
    } catch (error) {
      console.error('Error al cargar los traslados:', error);
      message.error('Error al cargar el historial de traslados.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransfersForItem = async (itemId: number) => {
    setLoading(true);
    try {
      const response = await inventoryTransferService.getTransfersByItem(itemId);
      setTransfers(response.data);
    } catch (error) {
      console.error(`Error al cargar los traslados para el equipo ${itemId}:`, error);
      message.error('Error al cargar el historial de traslados para este equipo.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const columns: ColumnsType<InventoryTransfer> = [
    {
      title: 'Equipo',
      dataIndex: 'inventoryItemName',
      key: 'inventoryItemName',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Origen',
      key: 'source',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text type="secondary">Empresa:</Text>
          <Text strong>{record.sourceCompanyName}</Text>
          <Text type="secondary">Sede:</Text>
          <Text strong>{record.sourceHeadquarterName}</Text>
        </Space>
      )
    },
    {
      title: 'Destino',
      key: 'destination',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text type="secondary">Empresa:</Text>
          <Text strong>{record.destinationCompanyName}</Text>
          <Text type="secondary">Sede:</Text>
          <Text strong>{record.destinationHeadquarterName}</Text>
        </Space>
      )
    },
    {
      title: 'Fecha',
      dataIndex: 'movementDate',
      key: 'movementDate',
      render: (date) => formatDate(date)
    },
    {
      title: 'Usuario',
      dataIndex: 'userName',
      key: 'userName'
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 150 }}>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Detalle',
      key: 'description',
      render: (_, record) => (
        <>
          {record.description && (
            <Tooltip title={record.description}>
              <InfoCircleOutlined />
            </Tooltip>
          )}
        </>
      )
    }
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Title level={4}>
            <HistoryOutlined /> Historial de Traslados de Equipos
          </Title>
          <Button
            type="primary"
            icon={<SwapOutlined />}
            onClick={() => navigate('/inventario/traslados/nuevo')}
          >
            Nuevo Traslado
          </Button>
        </Space>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Filtrar por equipo:</Text>
          <Select 
            style={{ width: 300 }}
            showSearch
            placeholder="Seleccione un equipo para filtrar" 
            optionFilterProp="children"
            allowClear
            onChange={(value) => setSelectedItem(value)}
            filterOption={(input, option) => 
              (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
            }
          >
            {inventoryItems.map(item => (
              <Option key={item.id} value={item.id}>
                {item.serial} - {item.model}
              </Option>
            ))}
          </Select>
        </Space>

        <Divider />

        <Table 
          columns={columns} 
          dataSource={transfers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No hay traslados registrados' }}
        />
      </Space>
    </Card>
  );
};

export default EquipmentTransferHistory;
