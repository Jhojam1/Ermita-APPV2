import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  message, 
  Card, 
  Typography, 
  Space, 
  Divider 
} from 'antd';
import { useNavigate } from 'react-router-dom';
import inventoryTransferService from '../../services/InventoryTransferService';
import companyService from '../../services/companyService';
import inventoryService, { InventoryItem as ServiceInventoryItem } from '../../services/inventoryService';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Company {
  id: number;
  name: string;
  headquarters: Headquarter[];
}

interface Headquarter {
  id: number;
  name: string;
}

// Usar la interfaz del servicio con filtros necesarios
type InventoryItem = ServiceInventoryItem;

const EquipmentTransferForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyService.getAllCompanies();
        setCompanies((response || []).map(company => ({
          ...company,
          headquarters: company.headquarters || []
        })));
      } catch (error) {
        console.error('Error al cargar las empresas:', error);
        message.error('Error al cargar las empresas.');
      }
    };

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

    fetchCompanies();
    fetchInventoryItems();
  }, []);

  const handleCompanyChange = (value: number) => {
    const selectedCompany = companies.find(c => c.id === value);
    if (selectedCompany) {
      setHeadquarters(selectedCompany.headquarters || []);
      form.resetFields(['destinationHeadquarterId']);
    }
  };

  const handleItemChange = (value: number) => {
    const item = inventoryItems.find(item => item.id === value);
    setSelectedItem(item || null);
    
    if (item) {
      // Actualizar los campos informativos de origen
      form.setFieldsValue({
        sourceCompanyName: item.companyName,
        sourceHeadquarterName: item.sedeName
      });
    }
  };

  const handleSubmit = async (values: any) => {
    if (!selectedItem) {
      message.error('Por favor, seleccione un equipo.');
      return;
    }

    setLoading(true);
    
    // Obtener los nombres de la empresa y sede de destino
    const destinationCompany = companies.find(c => c.id === values.destinationCompanyId);
    const destinationHeadquarter = headquarters.find(h => h.id === values.destinationHeadquarterId);

    if (!selectedItem.id) {
      message.error('Error: ID del equipo no válido.');
      setLoading(false);
      return;
    }

    const transferData = {
      inventoryItemId: selectedItem.id,
      quantity: parseInt(form.getFieldValue('quantity')),
      sourceCompanyId: selectedItem.companyId || 0,
      sourceCompanyName: selectedItem.companyName || '',
      sourceHeadquarterId: selectedItem.sedeId || 0,
      sourceHeadquarterName: selectedItem.sedeName || '',
      destinationCompanyId: form.getFieldValue('destinationCompanyId'),
      destinationCompanyName: destinationCompany?.name || '',
      destinationHeadquarterId: form.getFieldValue('destinationHeadquarterId'),
      destinationHeadquarterName: destinationHeadquarter?.name || '',
      reason: form.getFieldValue('reason'),
      description: form.getFieldValue('description'),
    };

    try {
      await inventoryTransferService.createTransfer(transferData);
      message.success('Traslado registrado exitosamente.');
      navigate('/inventario'); // Redireccionar a la página de inventario
    } catch (error) {
      console.error('Error al registrar el traslado:', error);
      message.error('Error al registrar el traslado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={3}>Registrar Traslado de Equipo</Title>
      <Divider />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="inventoryItemId"
          label="Equipo a trasladar"
          rules={[{ required: true, message: 'Por favor seleccione un equipo' }]}
        >
          <Select 
            showSearch 
            placeholder="Seleccione un equipo" 
            optionFilterProp="children"
            onChange={handleItemChange}
            filterOption={(input, option) => 
              (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
            }
          >
            {inventoryItems.map(item => (
              <Option key={item.id} value={item.id}>
                {item.serial} - {item.model} ({item.companyName} - {item.sedeName})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }}>
          <Title level={5}>Ubicación Actual</Title>
          <Form.Item name="sourceCompanyName" label="Empresa">
            <Input disabled />
          </Form.Item>
          <Form.Item name="sourceHeadquarterName" label="Sede">
            <Input disabled />
          </Form.Item>
        </Space>

        <Divider>Información de Destino</Divider>

        <Form.Item
          name="destinationCompanyId"
          label="Empresa de Destino"
          rules={[{ required: true, message: 'Por favor seleccione la empresa de destino' }]}
        >
          <Select 
            placeholder="Seleccione empresa de destino" 
            onChange={handleCompanyChange}
          >
            {companies.map(company => (
              <Option key={company.id} value={company.id}>{company.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="destinationHeadquarterId"
          label="Sede de Destino"
          rules={[{ required: true, message: 'Por favor seleccione la sede de destino' }]}
        >
          <Select placeholder="Seleccione sede de destino">
            {headquarters.map(headquarter => (
              <Option key={headquarter.id} value={headquarter.id}>{headquarter.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="reason"
          label="Motivo del Traslado"
          rules={[{ required: true, message: 'Por favor ingrese el motivo del traslado' }]}
        >
          <TextArea rows={3} placeholder="Ingrese el motivo del traslado" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Observaciones Adicionales"
        >
          <TextArea rows={3} placeholder="Observaciones adicionales (opcional)" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Registrar Traslado
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/inventario')}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EquipmentTransferForm;
