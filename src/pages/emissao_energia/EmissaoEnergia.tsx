import { Col, Flex, Row, Space, Table, TableProps } from 'antd';
import styles from './styles.module.scss';
import { IoChevronBackSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import BtnPrincipal from '../../components/geral/BtnPrincipal';
import Input, { SearchProps } from 'antd/es/input';
import { EmissaoEnergiaDTO } from '../../dto/EmissaoEnergiaDTO';
import { useState, useEffect } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ModalEmissaoEnergia from '../../components/emissaoEnergia/ModalEmissaoEnergia';

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const BackIcon = IoChevronBackSharp as unknown as SVGIcon;

export default function EmissaoEnergia() {
    const navigate = useNavigate();
    const { Search } = Input;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [emissoes, setEmissoes] = useState<EmissaoEnergiaDTO[]>([
        { id: 1, data: dayjs('02/01/2025', 'DD/MM/YYYY'), kwhConsumido: 152.2, co2Emitido: 8.2 },
        { id: 2, data: dayjs('15/01/2025', 'DD/MM/YYYY'), kwhConsumido: 200.5, co2Emitido: 10.8 },
        { id: 3, data: dayjs('28/01/2025', 'DD/MM/YYYY'), kwhConsumido: 180.3, co2Emitido: 9.7 },
    ]);
    const [emissoesFiltradas, setEmissoesFiltradas] = useState<EmissaoEnergiaDTO[]>([]);
    const [termoBusca, setTermoBusca] = useState<string>('');
    const [currentItem, setCurrentItem] = useState<EmissaoEnergiaDTO | null>(null);

    useEffect(() => {
        setEmissoesFiltradas(emissoes);
    }, [emissoes]);

    const realizarBusca = (termo: string) => {
        setTermoBusca(termo);
        
        if (!termo.trim()) {
            setEmissoesFiltradas(emissoes);
            return;
        }

        const termoLowerCase = termo.toLowerCase().trim();
        
        const resultadosFiltrados = emissoes.filter(emissao => {
            const dataFormatada = emissao.data.format('DD/MM/YYYY');
            const matchData = dataFormatada.toLowerCase().includes(termoLowerCase);
            
            const matchKwh = emissao.kwhConsumido.toString().toLowerCase().includes(termoLowerCase);

            const matchCo2 = emissao.co2Emitido.toString().toLowerCase().includes(termoLowerCase);

            const matchDataParcial = dataFormatada.split('/').some(parte => 
                parte.toLowerCase().includes(termoLowerCase)
            );
            const matchMesNome = emissao.data.format('MMMM YYYY').toLowerCase().includes(termoLowerCase) ||
                                emissao.data.format('MMM YYYY').toLowerCase().includes(termoLowerCase);
            
            return matchData || matchKwh || matchCo2 || matchDataParcial || matchMesNome;
        });
        
        setEmissoesFiltradas(resultadosFiltrados);
    };

    function novo() {
        setCurrentItem(null);
        setIsModalOpen(true);
    }

    function editar(record: EmissaoEnergiaDTO) {
        setCurrentItem(record);
        setIsModalOpen(true);
    }

    function excluir(record: EmissaoEnergiaDTO) {
        setEmissoes(emissoes.filter(e => e.id !== record.id));
    }

    const handleModalClose = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = (values: EmissaoEnergiaDTO) => {
        if (currentItem?.id) {
            setEmissoes(emissoes.map(e =>
                e.id === currentItem.id ? { ...values, id: currentItem.id } : e
            ));
        } else {
            const maxId = emissoes.reduce((m, e) => e.id! > m ? e.id! : m, 0);
            setEmissoes([...emissoes, { ...values, id: maxId + 1 }]);
        }
        
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const columns: TableProps<EmissaoEnergiaDTO>['columns'] = [
        {
            title: <span className={styles.headerTable}>Data</span>,
            dataIndex: 'data',
            align: 'center',
            key: 'data',
            render: (_, record) => (
                <span className={styles.itemTable}>{record.data.format('DD/MM/YYYY')}</span>
            ),
        },
        {
            title: <span className={styles.headerTable}>KwH Consumido</span>,
            dataIndex: 'kwhConsumido',
            align: 'center',
            key: 'KwH Consumido',
            render: (_, record) => (
                <span className={styles.itemTable}>{record.kwhConsumido} Kwh</span>
            ),
        },
        {
            title: <span className={styles.headerTable}>CO2 Emitido</span>,
            dataIndex: 'co2Emitido',
            align: 'center',
            key: 'CO2 Emitido',
            render: (_, record) => (
                <span className={styles.itemTable}>{record.co2Emitido} Kg</span>
            ),
        },
        {
            title: <span className={styles.headerTable}>Ação</span>,
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <EditOutlined className={styles.editIcon} onClick={() => editar(record)} />
                    <DeleteOutlined className={styles.deleteIcon} onClick={() => excluir(record)} />
                </Space>
            ),
        },
    ];

    const onSearch: SearchProps['onSearch'] = (value) => {
        realizarBusca(value);
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        realizarBusca(value);
    };
    
    return (
        <div className={styles.main}>
            <Row style={{ height: '6.5vh' }}>
                <Col span={24} className={styles.header}>
                    <BackIcon className={styles.backIcon} onClick={() => navigate('/home')} />
                    <span>Emissões por energia</span>
                </Col>
            </Row>

            <div className={styles.container}>
                <Row>
                    <Col span={24}>
                        <Flex justify={'space-between'} vertical={false}>
                            <BtnPrincipal label='Novo' onClick={novo} size='middle' width={'16%'} />
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
                
                <Row style={{ marginTop: '26px' }}>
                    <Col span={24}>
                        <Table<EmissaoEnergiaDTO>
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
                                    : 'Nenhum dado disponível'
                            }}
                        />
                    </Col>
                </Row>

                <ModalEmissaoEnergia
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSave={handleSave}
                    editingItem={currentItem}
                    fatorEmissaoCO2={0.054} // Fator de emissão em kg CO2/kWh
                />
            </div>
        </div>
    );
}