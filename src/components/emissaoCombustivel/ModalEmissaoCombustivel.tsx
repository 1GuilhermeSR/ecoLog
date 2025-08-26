import { Col, DatePicker, Flex, Form, FormProps, InputNumber, Modal, Row, Select } from 'antd';
import { EmissaoCombustivelDTO } from '../../dto/emissao_combustivel/EmissaoCombustivelDTO';
import { CombustivelDTO } from '../../dto/combustivel/CombustivelDTO';
import BtnPrincipal from '../geral/BtnPrincipal';
import BtnSecundario from '../geral/BtnSecundario';
import styles from './styles.module.scss';
import { useCallback, useEffect, useState } from 'react';
import Loading from '../geral/Loading';
import combustivelService from '../../services/combustivel/combustivelService';

interface ModalEmissaoCombustivelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: EmissaoCombustivelDTO) => void;
  editingItem?: EmissaoCombustivelDTO | null;
}

export default function ModalEmissaoCombustivel({
  isOpen,
  onClose,
  onSave,
  editingItem,
}: ModalEmissaoCombustivelProps) {
  const [form] = Form.useForm<EmissaoCombustivelDTO>();
  const [co2Calculado, setCo2Calculado] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [combustiveis, setCombustiveis] = useState<CombustivelDTO[]>([]);

  const fetchCombustivel = useCallback(async () => {
    setLoading(true);
    try {
      const response = await combustivelService.getAll();
      setCombustiveis(Array.isArray(response) ? response : []);
    } catch (e) {
      console.error('Erro ao carregar combustíveis:', e);
      setCombustiveis([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchCombustivel();
  }, [isOpen, fetchCombustivel]);

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      // garante que o Select bate o tipo number
      form.setFieldsValue({
        ...editingItem,
        idCombustivel: editingItem.idCombustivel,
      });

      // recalc com fator do combustível carregado
      const c = combustiveis.find((x) => x.id === editingItem.idCombustivel);
      if (c && editingItem.mediaKm && editingItem.kmPercorrido) {
        const litros = Number(editingItem.kmPercorrido) / Number(editingItem.mediaKm);
        setCo2Calculado(litros * Number(c.fatorEmissao));
      } else {
        setCo2Calculado(editingItem.co2Emitido ?? 0);
      }
    } else {
      form.resetFields();
      setCo2Calculado(0);
    }
  }, [isOpen, editingItem, combustiveis, form]);

  // Recalcula CO2 a cada mudança de campos
  const handleValuesChange = (_: any, all: EmissaoCombustivelDTO) => {
    const mediaKm = Number(all.mediaKm);
    const kmPercorrido = Number(all.kmPercorrido);
    const idCombustivel = all.idCombustivel as number | undefined;

    if (mediaKm > 0 && kmPercorrido > 0 && idCombustivel) {
      const combustivelSelecionado = combustiveis.find((c) => c.id === idCombustivel);
      if (combustivelSelecionado) {
        const litros = kmPercorrido / mediaKm;
        setCo2Calculado(litros * Number(combustivelSelecionado.fatorEmissao));
        return;
      }
    }
    setCo2Calculado(0);
  };

  const handleSave: FormProps<EmissaoCombustivelDTO>['onFinish'] = (values) => {
    const c = combustiveis.find((x) => x.id === values.idCombustivel);
    const valuesWithCO2: EmissaoCombustivelDTO = {
      ...values,
      co2Emitido: co2Calculado,
      fatorEmissao: c?.fatorEmissao ?? 0,
      nomeCombustivel: c?.nome ?? undefined,
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            borderBottom: '1px solid #8d8d8d6c',
            color: '#8D8D8D',
            paddingBottom: '8px',
            marginBottom: '16px',
            fontSize: '1.1em',
          }}
        >
          <span>Emissão por Combustível</span>
        </div>
      }
      closable
      afterClose={() => {
        form.resetFields();
        setCo2Calculado(0);
      }}
      open={isOpen}
      onCancel={handleCancel}
      footer={[]}
    >
      <Form form={form} onFinish={handleSave} onValuesChange={handleValuesChange}>
        <div className={styles.mainForm}>
          <div className={styles.containerForm}>
            {loading && <Loading />}

            <Row>
              <Col span={24}>
                <Flex vertical>
                  <span className={styles.label}>Data:</span>
                  <Form.Item
                    layout="vertical"
                    name="data"
                    rules={[{ required: true, message: 'Por favor, informe a data corretamente!' }]}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      size="large"
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
                  <Form.Item<EmissaoCombustivelDTO['mediaKm']>
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
                  <Form.Item<EmissaoCombustivelDTO['kmPercorrido']>
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
                  <Form.Item<EmissaoCombustivelDTO['idCombustivel']>
                    layout="vertical"
                    name="idCombustivel"
                    rules={[{ required: true, message: 'Por favor, informe o Tipo de combustível corretamente!' }]}
                  >
                    <Select
                      showSearch
                      variant="underlined"
                      style={{ flex: 1 }}
                      className={styles.dropdownCombustivel}
                      optionFilterProp="label"
                      filterSort={(a, b) =>
                        (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())
                      }
                      options={combustiveis.map((combustivel) => ({
                        value: combustivel.id, 
                        label: combustivel.nome,
                      }))}
                    />
                  </Form.Item>
                </Flex>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Flex justify="center">
                  <div className={styles.cardCO2}>
                    <span className={styles.label}>CO2 emitido</span>
                    <span className={styles.valor}>{co2Calculado.toFixed(2)} Kg</span>
                  </div>
                </Flex>
              </Col>
            </Row>
          </div>

          <Flex vertical={false} justify="flex-end" gap="8px" style={{ paddingTop: '8px', marginTop: '32px' }}>
            <BtnSecundario label="Cancelar" onClick={handleCancel} size="middle" />
            <BtnPrincipal label="Salvar" size="middle" width="26%" onClick={() => form.submit()} />
          </Flex>
        </div>
      </Form>
    </Modal>
  );
}
