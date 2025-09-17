import React from 'react';
import { Row, Col } from 'antd';
import EquipmentTransferForm from '../components/inventory/EquipmentTransferForm';
// import PageTitle from '../components/common/PageTitle'; // Component not found

const NewEquipmentTransfer: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Traslado de Equipo</h1>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <EquipmentTransferForm />
        </Col>
      </Row>
    </>
  );
};

export default NewEquipmentTransfer;
