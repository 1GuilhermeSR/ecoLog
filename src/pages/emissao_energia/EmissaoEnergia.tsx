import { Col, Flex, message, Popconfirm, Row, Space, Table, TableProps } from 'antd';
import styles from './styles.module.scss';
import { IoChevronBackSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import BtnPrincipal from '../../components/geral/BtnPrincipal';
import { Input } from 'antd';
import type { SearchProps } from 'antd/es/input';
import { EmissaoEnergiaDTO } from '../../dto/emissao_energia/EmissaoEnergiaDTO';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ModalEmissaoEnergia from '../../components/emissaoEnergia/ModalEmissaoEnergia';
import emissaoEnergiaService from '../../services/emissao_energia/emissaoEnergiaService';
import energiaService from '../../services/energia/energiaService';
import Loading from '../../components/geral/Loading';
import { EnergiaDTO } from '../../dto/energia/EnergiaDTO';
import { EmissaoEnergiaUpsertDTO } from '../../dto/emissao_energia/EmissaoEnergiaUpsertDTO';
import { sortInitialByDateDesc, upsertByIdMaintainDateDesc, removeById } from '../../utils/listOrder';
import { Grid } from 'antd';

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const BackIcon = IoChevronBackSharp as unknown as SVGIcon;

const { useBreakpoint } = Grid;

export default function EmissaoEnergia() {
    const navigate = useNavigate();
    const { Search } = Input;
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [emissoes, setEmissoes] = useState<EmissaoEnergiaDTO[]>([]);
    const [energia, setEnergia] = useState<EnergiaDTO | null>(null);
    const [termoBusca, setTermoBusca] = useState<string>('');
    const [currentItem, setCurrentItem] = useState<EmissaoEnergiaDTO | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    const screens = useBreakpoint();
    const pageSize = useMemo(() => {
        if (screens.xs) return 9;  // Celulares comuns
        return 7;
    }, [screens]);
    const [current, setCurrent] = useState(1);

    useEffect(() => setCurrent(1), [termoBusca, pageSize]);

    const fetchEmissoes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await emissaoEnergiaService.getEmissaoByUser();
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

    const fetchEnergia = useCallback(async () => {
        setLoading(true);
        try {
            const response = await energiaService.getLast();
            if (response) {
                setEnergia(response);
            }
        } catch (e) {
            console.error('Erro ao carregar energia:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmissoes();
        fetchEnergia();
    }, [fetchEmissoes, fetchEnergia]);

    const emissoesFiltradas = useMemo(() => {
        const termo = termoBusca.toLowerCase().trim();
        if (!termo) return emissoes;

        return emissoes.filter((emissao) => {
            const dataStr = emissao.data?.isValid?.() ? emissao.data.format('DD/MM/YYYY') : '';
            const matchData = dataStr.toLowerCase().includes(termo);

            const matchKwh = String(emissao.kwhConsumido ?? '')
                .toLowerCase()
                .includes(termo);

            const matchCo2 = String(emissao.co2Emitido ?? '')
                .toLowerCase()
                .includes(termo);

            const matchDataParcial = dataStr
                ? dataStr.split('/').some(p => p.toLowerCase().includes(termo))
                : false;

            const matchMesNome = emissao.data?.isValid?.()
                ? (emissao.data.format('MMMM YYYY').toLowerCase().includes(termo) ||
                    emissao.data.format('MMM YYYY').toLowerCase().includes(termo))
                : false;

            return matchData || matchKwh || matchCo2 || matchDataParcial || matchMesNome;
        });
    }, [emissoes, termoBusca]);

    function novo() {
        setCurrentItem(null);
        setIsModalOpen(true);
    }

    function editar(record: EmissaoEnergiaDTO) {
        setCurrentItem(record);
        setIsModalOpen(true);
    }

    async function excluir(record: EmissaoEnergiaDTO) {
        if (!record.id) return;
        setLoading(true);
        try {
            const resp = await emissaoEnergiaService.excluirEmissaoEnergia(record.id);
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
    }

    const handleModalClose = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = async (values: EmissaoEnergiaDTO) => {
        try {
            const isEditing = !!currentItem?.id;
            var sucesso = false;
            setLoading(true);

            // para edição: pega do registro; para criação: pega da energia atual
            const idEnergiaToSend = isEditing
                ? (currentItem?.idEnergia ?? energia?.id)
                : energia?.id;

            const fatorEmissaoToSend = isEditing
                ? (currentItem?.fatorEmissao ?? energia?.fatorEmissao)
                : energia?.fatorEmissao;

            if (!idEnergiaToSend || fatorEmissaoToSend == null) {
                console.error('Energia/fator de emissão não disponível para salvar.');
                return;
            }

            const upsert: EmissaoEnergiaUpsertDTO = {
                id: isEditing ? currentItem!.id : undefined,
                data: values.data.format('DD/MM/YYYY'),
                idEnergia: idEnergiaToSend,
                fatorEmissao: Number(fatorEmissaoToSend),
                kwhConsumido: Number(values.kwhConsumido),
                co2Emitido: Number(((values.co2Emitido ?? (values.kwhConsumido * fatorEmissaoToSend))).toFixed(4)),
            };

            if (isEditing) {
                const response = await emissaoEnergiaService.editarEmissaoEnergia(upsert);
                if (response.success) {
                    messageApi.open({ type: 'success', content: 'Emissão editada com sucesso!' });
                    sucesso = true;
                }
                else {
                    messageApi.open({ type: 'error', content: 'Erro ao editar emissão!\n' + response.message });
                }
            }
            else {
                const response = await emissaoEnergiaService.gravarEmissaoEnergia(upsert);
                if (response.success) {
                    messageApi.open({ type: 'success', content: 'Emissão gravada com sucesso!' });
                    sucesso = true;
                }
                else {
                    messageApi.open({ type: 'error', content: 'Erro ao gravar emissão!\n' + response.message });
                }
            }
            if (sucesso) {
                const rowForTable: EmissaoEnergiaDTO = {
                    id: upsert.id ?? (emissoes.reduce((m, e) => (e.id ?? 0) > m ? (e.id ?? 0) : m, 0) + 1),
                    data: dayjs(upsert.data, 'DD/MM/YYYY'),
                    idEnergia: upsert.idEnergia,
                    fatorEmissao: upsert.fatorEmissao,
                    kwhConsumido: upsert.kwhConsumido,
                    co2Emitido: upsert.co2Emitido!,
                    idEstado: currentItem?.idEstado,
                    idUsuario: currentItem?.idUsuario,
                };

                setEmissoes(prev => upsertByIdMaintainDateDesc(prev, rowForTable));

                setIsModalOpen(false);
                setCurrentItem(null);
            }
        } catch (error) {
            messageApi.open({ type: 'error', content: 'Erro ao salvar emissão!\n' + error });
        }
        finally {
            setLoading(false);
        }
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
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <EditOutlined className={styles.editIcon} onClick={() => editar(record)} />
                    <Popconfirm
                        title="Excluir emissão"
                        description="Tem certeza que deseja excluir esta emissão?"
                        okText="Sim"
                        cancelText="Não"
                        onConfirm={() => excluir(record)}
                    >
                        <DeleteOutlined className={styles.deleteIcon} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const onSearch: SearchProps['onSearch'] = (value) => {
        setTermoBusca(value);
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTermoBusca(e.target.value);
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
                {contextHolder}
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
                        {loading && (<Loading />)}
                        <Table<EmissaoEnergiaDTO>
                            rowKey="id"
                            columns={columns}
                            dataSource={emissoesFiltradas}
                            size="middle"
                            pagination={{
                                current,
                                onChange: (p) => setCurrent(p),
                                pageSize,
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
                    fatorEmissaoCO2={energia?.fatorEmissao}
                />
            </div>
        </div>
    );
}