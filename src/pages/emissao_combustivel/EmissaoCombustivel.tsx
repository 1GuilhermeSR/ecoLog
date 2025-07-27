import { Col, Flex, Row, Space, Table, TableProps } from 'antd';
import styles from './styles.module.scss';
import { IoChevronBackSharp } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import BtnPrincipal from '../../components/geral/BtnPrincipal';
import Input, { SearchProps } from 'antd/es/input';
import { EmissaoCombustivelDTO } from '../../dto/EmissaoCombustivelDTO';
import { useState, useEffect } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ModalEmissaoCombustivel from '../../components/emissaoCombustivel/ModalEmissaoCombustivel';

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const BackIcon = IoChevronBackSharp as unknown as SVGIcon;

export default function EmissaoCombustivel() {
  const navigate = useNavigate();
  const { Search } = Input;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emissoes, setEmissoes] = useState<EmissaoCombustivelDTO[]>([
    {
      id: 1,
      data: dayjs('02/01/2025', 'DD/MM/YYYY'),
      kmPercorrido: 50,
      combustivel: 'Etanol',
      mediaKm: 10,
      co2Emitido: 4,
      IdCombustivel: 1,
      fatorEmissao: 1.533
    },
    {
      id: 2,
      data: dayjs('02/01/2025', 'DD/MM/YYYY'),
      kmPercorrido: 50,
      combustivel: 'Etanol',
      mediaKm: 10,
      co2Emitido: 4,
      IdCombustivel: 1,
      fatorEmissao: 1.533
    },
    {
      id: 3,
      data: dayjs('02/01/2025', 'DD/MM/YYYY'),
      kmPercorrido: 50,
      combustivel: 'Gasolina',
      mediaKm: 12,
      co2Emitido: 19.9,
      IdCombustivel: 2,
      fatorEmissao: 2.318
    },
    {
      id: 4,
      data: dayjs('02/01/2025', 'DD/MM/YYYY'),
      kmPercorrido: 50,
      combustivel: 'Gasolina',
      mediaKm: 12,
      co2Emitido: 19.9,
      IdCombustivel: 2,
      fatorEmissao: 2.318
    },
  ]);
  const [emissoesFiltradas, setEmissoesFiltradas] = useState<EmissaoCombustivelDTO[]>([]);
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<EmissaoCombustivelDTO | null>(null);

  useEffect(() => {
    setEmissoesFiltradas(emissoes);
  }, [emissoes]);

  const realizarBusca = (termo: string) => {
    setTermoBusca(termo);
    if (!termo.trim()) {
      setEmissoesFiltradas(emissoes);
      return;
    }
    const lower = termo.toLowerCase().trim();
    const resultados = emissoes.filter(item => {
      const dataFmt = item.data.format('DD/MM/YYYY').toLowerCase();
      const partes = dataFmt.split('/');
      return (
        dataFmt.includes(lower) ||
        partes.some(p => p.includes(lower)) ||
        item.data.format('MMMM YYYY').toLowerCase().includes(lower) ||
        item.data.format('MMM YYYY').toLowerCase().includes(lower) ||
        item.kmPercorrido.toString().includes(lower) ||
        item.combustivel.toLowerCase().includes(lower) ||
        item.mediaKm.toString().includes(lower) ||
        item.co2Emitido.toString().includes(lower)
      );
    });
    setEmissoesFiltradas(resultados);
  };

  const novo = () => {
    setCurrentItem(null);
    setIsModalOpen(true);
  };

  const editar = (record: EmissaoCombustivelDTO) => {
    setCurrentItem(record);
    setIsModalOpen(true);
  };

  const excluir = (record: EmissaoCombustivelDTO) => {
    setEmissoes(emissoes.filter(e => e.id !== record.id));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSave = (values: EmissaoCombustivelDTO) => {
    console.log('Valores recebidos do modal:', values);

    if (currentItem?.id) {
      // Editando item existente
      setEmissoes(emissoes.map(e =>
        e.id === currentItem.id ? { ...values, id: currentItem.id } : e
      ));
    } else {
      // Criando novo item
      const maxId = emissoes.reduce((m, e) => (e.id! > m ? e.id! : m), 0);
      const novoItem = { ...values, id: maxId + 1 };
      console.log('Novo item a ser adicionado:', novoItem);
      setEmissoes(prevEmissoes => [...prevEmissoes, novoItem]);
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
      render: (_, r) => <span className={styles.itemTable}>{r.combustivel}</span>,
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

  const onSearch: SearchProps['onSearch'] = realizarBusca;
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => realizarBusca(e.target.value);

  return (
    <div className={styles.main}>
      <Row style={{ height: '6.5vh' }}>
        <Col span={24} className={styles.header}>
          <BackIcon className={styles.backIcon} onClick={() => navigate('/home')} />
          <span>Emissões por combustível</span>
        </Col>
      </Row>

      <div className={styles.container}>
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