import { Col, Flex, message, Row, Space, Table, TableProps } from 'antd';
import styles from './styles.module.scss';
import { IoChevronBackSharp } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import BtnPrincipal from '../../components/geral/BtnPrincipal';
import { Input } from 'antd';
import type { SearchProps } from 'antd/es/input';
import { EmissaoCombustivelDTO } from '../../dto/emissao_combustivel/EmissaoCombustivelDTO';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ModalEmissaoCombustivel from '../../components/emissaoCombustivel/ModalEmissaoCombustivel';
import Loading from '../../components/geral/Loading';
import emissaoCombustivelService from '../../services/emissao_combustivel/emissaoCombustivelService';
import { removeById, sortInitialByDateDesc, upsertByIdMaintainDateDesc } from '../../utils/listOrder';
import { EmissaoCombustivelUpsertDTO } from '../../dto/emissao_combustivel/emissaoCombustivelUpsertDTO';

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const BackIcon = IoChevronBackSharp as unknown as SVGIcon;

export default function EmissaoCombustivel() {
  const navigate = useNavigate();
  const { Search } = Input;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emissoes, setEmissoes] = useState<EmissaoCombustivelDTO[]>([]);
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<EmissaoCombustivelDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchEmissoes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await emissaoCombustivelService.getEmissaoByUser();
      if (response.success && Array.isArray(response.data)) {
        setEmissoes(sortInitialByDateDesc(response.data));
      } else {
        setEmissoes([]);
      }
    } catch (e) {
      console.error('Erro ao carregar emissões:', e);
      setEmissoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmissoes();

  }, [fetchEmissoes]);

  const emissoesFiltradas = useMemo(() => {
    const termo = termoBusca.toLowerCase().trim();
    if (!termo) return emissoes;

    return emissoes.filter((emissao) => {
      const dataStr = emissao.data?.isValid?.() ? emissao.data.format('DD/MM/YYYY') : '';
      const matchData = dataStr.toLowerCase().includes(termo);

      const matchKmPerc = String(emissao.kmPercorrido ?? '').toLowerCase().includes(termo);
      const matchMediaKm = String(emissao.mediaKm ?? '').toLowerCase().includes(termo);
      const matchCo2 = String(emissao.co2Emitido ?? '').toLowerCase().includes(termo);
      const matchComb = (emissao.nomeCombustivel ?? '').toLowerCase().includes(termo);

      const matchDataParcial = dataStr
        ? dataStr.split('/').some((p) => p.toLowerCase().includes(termo))
        : false;

      const matchMesNome = emissao.data?.isValid?.()
        ? emissao.data.format('MMMM YYYY').toLowerCase().includes(termo) ||
        emissao.data.format('MMM YYYY').toLowerCase().includes(termo)
        : false;

      return matchData || matchKmPerc || matchMediaKm || matchCo2 || matchComb || matchDataParcial || matchMesNome;
    });
  }, [emissoes, termoBusca]);

  const novo = () => {
    setCurrentItem(null);
    setIsModalOpen(true);
  };

  const editar = (record: EmissaoCombustivelDTO) => {
    setCurrentItem(record);
    setIsModalOpen(true);
  };

  const excluir = async (record: EmissaoCombustivelDTO) => {
    if (!record.id) return;
    setLoading(true);
    try {
      const resp = await emissaoCombustivelService.excluirEmissaoCombustivel(record.id);
      if (resp.success) {
        setEmissoes(prev => removeById(prev, record.id!));
        messageApi.open({ type: 'success', content: 'Emissão excluída com sucesso!' });
      } else {
        messageApi.open({ type: 'error', content: resp.message ?? 'Não foi possível excluir a emissão.' });
      }
    } catch (err: any) {
      messageApi.open({ type: 'error', content: err?.message ?? 'Erro ao excluir a emissão.' });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSave = async (values: EmissaoCombustivelDTO) => {
    const isEditing = !!currentItem?.id;
    var sucesso = false;

    const upsert: EmissaoCombustivelUpsertDTO = {
      id: isEditing ? currentItem!.id : 0,
      data: values.data.format('DD/MM/YYYY'),
      kmPercorrido: Number(values.kmPercorrido),
      idCombustivel: Number(values.idCombustivel),
      mediaKm: Number(values.mediaKm),
      co2Emitido: Number(values.co2Emitido?.toFixed?.(4) ?? 0),
      fatorEmissao: Number(values.fatorEmissao ?? 0),
    };

    if (isEditing) {
      const response = await emissaoCombustivelService.editarEmissaoCombustivel(upsert);
      if (response.success) {
        messageApi.open({ type: 'success', content: 'Emissão editada com sucesso!' });
        sucesso = true;
      }
      else {
        messageApi.open({ type: 'error', content: 'Erro ao editar emissão!\n' + response.message });
      }
    }
    else {
      const response = await emissaoCombustivelService.gravarEmissaoCombustivel(upsert);
      if (response.success) {
        messageApi.open({ type: 'success', content: 'Emissão gravada com sucesso!' });
        sucesso = true;
      }
      else {
        messageApi.open({ type: 'error', content: 'Erro ao gravar emissão!\n' + response.message });
      }
    }

    if (sucesso) {
      const rowForTable: EmissaoCombustivelDTO = {
        id: upsert.id ?? (emissoes.reduce((m, e) => (e.id ?? 0) > m ? (e.id ?? 0) : m, 0) + 1),
        data: dayjs(upsert.data, 'DD/MM/YYYY'),
        idCombustivel: upsert.idCombustivel,
        nomeCombustivel: values.nomeCombustivel ?? currentItem?.nomeCombustivel ?? '',
        mediaKm: upsert.mediaKm,
        kmPercorrido: upsert.kmPercorrido,
        co2Emitido: upsert.co2Emitido!,
        fatorEmissao: upsert.fatorEmissao,
        idEstado: currentItem?.idEstado,
        idUsuario: currentItem?.idUsuario,
      };

      setEmissoes(prev => upsertByIdMaintainDateDesc(prev, rowForTable));


      setIsModalOpen(false);
      setCurrentItem(null);
    }

    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const columns: TableProps<EmissaoCombustivelDTO>['columns'] = [
    {
      title: <span className={styles.headerTable}>Data</span>,
      dataIndex: 'data',
      key: 'data',
      align: 'center',
      render: (_, r) => <span className={styles.itemTable}>{r.data.format('DD/MM/YYYY')}</span>,
    },
    {
      title: <span className={styles.headerTable}>Km Percorrido</span>,
      dataIndex: 'kmPercorrido',
      key: 'kmPercorrido',
      align: 'center',
      render: (_, r) => <span className={styles.itemTable}>{r.kmPercorrido} km</span>,
    },
    {
      title: <span className={styles.headerTable}>Combustível</span>,
      dataIndex: 'combustivel',
      key: 'combustivel',
      align: 'center',
      render: (_, r) => <span className={styles.itemTable}>{r.nomeCombustivel}</span>,
    },
    {
      title: <span className={styles.headerTable}>Média Km</span>,
      dataIndex: 'mediaKm',
      key: 'mediaKm',
      align: 'center',
      render: (_, r) => <span className={styles.itemTable}>{r.mediaKm} km/l</span>,
    },
    {
      title: <span className={styles.headerTable}>CO2 Emitido</span>,
      dataIndex: 'co2Emitido',
      key: 'co2Emitido',
      align: 'center',
      render: (_, r) => <span className={styles.itemTable}>{r.co2Emitido.toFixed(2)} kg</span>,
    },
    {
      title: <span className={styles.headerTable}>Ações</span>,
      key: 'action',
      align: 'center',
      render: (_, r) => (
        <Space size="middle">
          <EditOutlined className={styles.editIcon} onClick={() => editar(r)} />
          <DeleteOutlined className={styles.deleteIcon} onClick={() => excluir(r)} />
        </Space>
      ),
    },
  ];

  const onSearch: SearchProps['onSearch'] = (value) => setTermoBusca(value);
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setTermoBusca(e.target.value);

  return (
    <div className={styles.main}>
      <Row style={{ height: '6.5vh' }}>
        <Col span={24} className={styles.header}>
          <BackIcon className={styles.backIcon} onClick={() => navigate('/home')} />
          <span>Emissões por combustível</span>
        </Col>
      </Row>

      <div className={styles.container}>
        {loading && (<Loading />)}
        {contextHolder}
        <Row>
          <Col span={24}>
            <Flex justify="space-between" vertical={false}>
              <BtnPrincipal label="Novo" onClick={novo} size="middle" width="16%" />
              <Search
                placeholder="Buscar"
                onSearch={onSearch}
                onChange={onSearchChange}
                value={termoBusca}
                style={{ width: 250 }}
                allowClear
              />
            </Flex>
          </Col>
        </Row>

        <Row style={{ marginTop: 26 }}>
          <Col span={24}>
            <Table<EmissaoCombustivelDTO>
              columns={columns}
              dataSource={emissoesFiltradas}
              size="middle"
              pagination={{
                pageSize: 6,
                showSizeChanger: false,
                showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
              }}
              locale={{
                emptyText: termoBusca
                  ? `Nenhum resultado encontrado para "${termoBusca}"`
                  : 'Nenhum dado disponível',
              }}
              rowKey="id"
            />
          </Col>
        </Row>

        <ModalEmissaoCombustivel
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleSave}
          editingItem={currentItem}
        />
      </div>
    </div>
  );
}