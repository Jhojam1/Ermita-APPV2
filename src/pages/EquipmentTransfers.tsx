import React from 'react';
import { Row, Col } from 'antd';
import EquipmentTransferHistory from '../components/inventory/EquipmentTransferHistory';
import PageTitle from '../components/common/PageTitle';

const EquipmentTransfers: React.FC = () => {
  return (
    <>
      <PageTitle title="Historial de Traslados" />
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <EquipmentTransferHistory />
        </Col>
      </Row>
    </>
  );
};

export default EquipmentTransfers;
