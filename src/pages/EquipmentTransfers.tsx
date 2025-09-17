import React from 'react';
import { Row, Col } from 'antd';
import EquipmentTransferHistory from '../components/inventory/EquipmentTransferHistory';
// import PageTitle from '../components/common/PageTitle'; // Component not found

const EquipmentTransfers: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Historial de Traslados</h1>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <EquipmentTransferHistory />
        </Col>
      </Row>
    </>
  );
};

export default EquipmentTransfers;
