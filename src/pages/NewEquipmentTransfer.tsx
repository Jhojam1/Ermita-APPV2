import React from 'react';
import { Row, Col } from 'antd';
import EquipmentTransferForm from '../components/inventory/EquipmentTransferForm';
import PageTitle from '../components/common/PageTitle';

const NewEquipmentTransfer: React.FC = () => {
  return (
    <>
      <PageTitle title="Nuevo Traslado de Equipo" />
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <EquipmentTransferForm />
        </Col>
      </Row>
    </>
  );
};

export default NewEquipmentTransfer;
