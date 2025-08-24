import { Col, DatePicker, Flex, Form, FormProps, InputNumber, Modal, Row } from 'antd';
import { EmissaoEnergiaDTO } from '../../dto/emissao_energia/EmissaoEnergiaDTO';
import BtnPrincipal from '../geral/BtnPrincipal';
import BtnSecundario from '../geral/BtnSecundario';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';

interface ModalEmissaoEnergiaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: EmissaoEnergiaDTO) => void;
  editingItem?: EmissaoEnergiaDTO | null;
  fatorEmissaoCO2?: number;
}

export default function ModalEmissaoEnergia({
  isOpen,
  onClose,
  onSave,
  editingItem,
  fatorEmissaoCO2 = 0.054
}: ModalEmissaoEnergiaProps) {
  const [form] = Form.useForm<EmissaoEnergiaDTO>();
  const [co2Calculado, setCo2Calculado] = useState<number>(0);

  useEffect(() => {
    if (editingItem) {
      form.setFieldsValue(editingItem);
      setCo2Calculado(editingItem.co2Emitido || 0);
    } else {
      form.resetFields();
      setCo2Calculado(0);
    }
  }, [editingItem, form]);

  useEffect(() => {
    const kwhValue = form.getFieldValue('kwhConsumido');
    if (kwhValue && typeof kwhValue === 'number' && kwhValue > 0) {
      const co2 = kwhValue * fatorEmissaoCO2;
      setCo2Calculado(co2);
    } else {
      setCo2Calculado(0);
    }
  }, [form.getFieldValue('kwhConsumido'), fatorEmissaoCO2]);


  const handleKwhChange = (value: number | null) => {
    if (value && value > 0) {
      const co2 = value * fatorEmissaoCO2;
      setCo2Calculado(co2);
    } else {
      setCo2Calculado(0);
    }
  };

  const handleSave: FormProps<EmissaoEnergiaDTO>['onFinish'] = (values) => {
    const valuesWithCO2 = {
      ...values,
      co2Emitido: co2Calculado
    };
    onSave(valuesWithCO2);
    form.resetFields();
    setCo2Calculado(0);
  };

  const handleCancel = () => {
    form.resetFields();
    setCo2Calculado(0);
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          borderBottom: '1px solid #8d8d8d6c',
          color: '#8D8D8D',
          paddingBottom: '8px',
          marginBottom: '16px',
          fontSize: '1.1em'
        }}>
          <span>Emissão por Energia</span>
        </div>
      }
      closable={{ 'aria-label': 'Custom Close Button' }}
      open={isOpen}
      onCancel={handleCancel}
      footer={[]}
    >
      <Form onFinish={handleSave} form={form}>
        <div className={styles.mainForm}>
          <div className={styles.containerForm}>
            <Row>
              <Col span={24}>
                <Flex vertical={true}>
                  <span className={styles.label}>Data:</span>
                  <Form.Item
                    layout="vertical"
                    name="data"
                    wrapperCol={{ span: 24 }}
                    labelCol={{ span: 8 }}
                    rules={[{ required: true, message: 'Por favor, informe a data corretamente!' }]}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      size='large'
                      style={{ width: '100%', color: '#666666ff' }}
                      placeholder=""
                      variant="underlined"
                    />
                  </Form.Item>
                </Flex>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Flex vertical>
                  <span className={styles.label}>kWh Consumido:</span>
                  <Form.Item<EmissaoEnergiaDTO["kwhConsumido"]>
                    layout="vertical"
                    name="kwhConsumido"
                    rules={[{ required: true, message: 'Por favor, informe o KwH consumido corretamente!' }]}
                  >
                    <InputNumber
                      className={styles.inputKwh}
                      controls={false}
                      placeholder=""
                      variant="underlined"
                      style={{ width: '100%' }}
                      onChange={handleKwhChange}
                      min={0}
                      step={0.1}
                    />
                  </Form.Item>
                </Flex>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Flex justify='center'>
                  <div className={styles.cardCO2}>
                    <span className={styles.label}>CO2 emitido</span>
                    <span className={styles.valor}>{co2Calculado.toFixed(3)} Kg</span>
                  </div>
                </Flex>
              </Col>
            </Row>
          </div>

          <Flex
            vertical={false}
            justify='flex-end'
            gap='8px'
            style={{ paddingTop: '8px', marginTop: '32px' }}
          >
            <BtnSecundario label='Cancelar' onClick={handleCancel} size='middle' />
            <BtnPrincipal
              label='Salvar'
              size='middle'
              width='26%'
              onClick={() => form.submit()}
            />
          </Flex>
        </div>
      </Form>
    </Modal>
  );
}