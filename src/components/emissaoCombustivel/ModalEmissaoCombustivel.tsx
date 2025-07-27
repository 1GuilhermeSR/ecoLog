import { Col, DatePicker, Flex, Form, FormProps, Input, InputNumber, Modal, Row, Select } from 'antd';
import { EmissaoCombustivelDTO } from '../../dto/EmissaoCombustivelDTO';
import { CombustivelDTO } from '../../dto/CombustivelDTO';
import BtnPrincipal from '../geral/BtnPrincipal';
import BtnSecundario from '../geral/BtnSecundario';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';

interface ModalEmissaoEnergiaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: EmissaoCombustivelDTO) => void;
  editingItem?: EmissaoCombustivelDTO | null;
  fatorEmissaoCO2?: number;
}

export default function ModalEmissaoCombustivel({
  isOpen,
  onClose,
  onSave,
  editingItem,
  fatorEmissaoCO2 = 0.054
}: ModalEmissaoEnergiaProps) {
  const [form] = Form.useForm<EmissaoCombustivelDTO>();
  const [co2Calculado, setCo2Calculado] = useState<number>(0);
  const [combustiveis, setCombustiveis] = useState<CombustivelDTO[]>([
    {
      id: 1,
      combustivel: 'Diesel',
      fatorEmissao: 2.669,
    },
    {
      id: 2,
      combustivel: 'Etanol',
      fatorEmissao: 1.533,
    },
    {
      id: 3,
      combustivel: 'Gasolina',
      fatorEmissao: 2.318,
    },
  ]); // Inicializa diretamente com os dados

  useEffect(() => {
    console.log('Modal aberto, combustíveis:', combustiveis);
  }, [isOpen]); // Log quando o modal abre

  useEffect(() => {
    if (editingItem) {
      form.setFieldsValue(editingItem);
      setCo2Calculado(editingItem.co2Emitido || 0);
    } else {
      form.resetFields();
      setCo2Calculado(0);
    }
  }, [editingItem, form]);

  // Calcular CO2 quando os valores mudarem
  useEffect(() => {
    calcularCO2();
  }, [form.getFieldValue('mediaKm'), form.getFieldValue('kmPercorrido'), form.getFieldValue('IdCombustivel')]);

  const calcularCO2 = () => {
    const mediaKm = form.getFieldValue('mediaKm');
    const kmPercorrido = form.getFieldValue('kmPercorrido');
    const idCombustivel = form.getFieldValue('IdCombustivel');

    if (mediaKm && kmPercorrido && idCombustivel) {
      const idNumber = typeof idCombustivel === 'string' ? parseInt(idCombustivel) : idCombustivel;
      const combustivelSelecionado = combustiveis.find(c => c.id === idNumber);

      if (combustivelSelecionado) {
        // Fórmula: (KM percorrido / Média KM) * Fator de emissão do combustível
        const litrosConsumidos = kmPercorrido / mediaKm;
        const co2 = litrosConsumidos * combustivelSelecionado.fatorEmissao;
        setCo2Calculado(co2);
      }
    } else {
      setCo2Calculado(0);
    }
  };

  const handleFieldChange = () => {
    // Usar setTimeout para garantir que o valor foi atualizado no form
    setTimeout(() => {
      calcularCO2();
    }, 0);
  };

  const handleSave: FormProps<EmissaoCombustivelDTO>['onFinish'] = (values) => {
    console.log('Values do form:', values);
    console.log('Combustíveis disponíveis:', combustiveis);
    console.log('Buscando combustível com ID:', values.IdCombustivel);

    const combustivelSelecionado = combustiveis.find(c => {
      if (!values.IdCombustivel) return false;
      const idNumber = typeof values.IdCombustivel === 'string' ? parseInt(values.IdCombustivel) : values.IdCombustivel;
      console.log(`Comparando: ${c.id} (${typeof c.id}) === ${idNumber} (${typeof idNumber})`);
      return c.id === idNumber;
    });
    console.log('Combustível selecionado:', combustivelSelecionado);

    const valuesWithCO2 = {
      ...values,
      co2Emitido: co2Calculado,
      combustivel: combustivelSelecionado?.combustivel || '',
      fatorEmissao: combustivelSelecionado?.fatorEmissao || 0
    };

    console.log('Dados finais a serem salvos:', valuesWithCO2);
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
          <span>Emissão por Combustível</span>
        </div>
      }
      closable={{ 'aria-label': 'Custom Close Button' }}
      destroyOnHidden 
      open={isOpen}
      onCancel={handleCancel}
      footer={[]}
    >
      <Form onFinish={handleSave} form={form} onValuesChange={handleFieldChange}>
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
                  <span className={styles.label}>Média de KM/L:</span>
                  <Form.Item<EmissaoCombustivelDTO["mediaKm"]>
                    layout="vertical"
                    name="mediaKm"
                    rules={[{ required: true, message: 'Por favor, informe a média de KM/L corretamente!' }]}
                  >
                    <InputNumber
                      controls={false}
                      placeholder=""
                      variant="underlined"
                      style={{ width: '100%' }}
                      min={0}
                      step={0.1}
                    />
                  </Form.Item>
                </Flex>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Flex vertical>
                  <span className={styles.label}>KM Percorrido:</span>
                  <Form.Item<EmissaoCombustivelDTO["kmPercorrido"]>
                    layout="vertical"
                    name="kmPercorrido"
                    rules={[{ required: true, message: 'Por favor, informe o KM percorrido corretamente!' }]}
                  >
                    <InputNumber
                      controls={false}
                      placeholder=""
                      variant="underlined"
                      style={{ width: '100%' }}
                      min={0}
                      step={0.1}
                    />
                  </Form.Item>
                </Flex>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Flex vertical>
                  <span className={styles.label}>Tipo Combustível:</span>
                  <Form.Item<EmissaoCombustivelDTO["IdCombustivel"]>
                    layout="vertical"
                    name="IdCombustivel"
                    rules={[{ required: true, message: 'Por favor, informe o Tipo de combustível corretamente!' }]}
                  >
                    <Select
                      showSearch
                      variant="underlined"
                      style={{ flex: 1 }}
                      className={styles.dropdownCombustivel}
                      filterSort={(optionA, optionB) =>
                        (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                      }
                      optionFilterProp="label"
                      options={combustiveis.map(combustivel => ({
                        value: combustivel.id.toString(),
                        label: `${combustivel.combustivel}`
                      }))}
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
                    <span className={styles.valor}>{co2Calculado.toFixed(2)} Kg</span>
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