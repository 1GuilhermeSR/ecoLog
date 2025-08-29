import { IoChevronBackSharp } from 'react-icons/io5';
import styles from './styles.module.scss';
import { useNavigate } from 'react-router-dom';
import { Col, message, Row, Select } from 'antd';
import BtnPrincipal from '../../components/geral/BtnPrincipal';
import Loading from '../../components/geral/Loading';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Resumo from '../../components/resumoDashboard/Resumo';
import MinhasEmissoesService from '../../services/minhas_emissoes/MinhasEmissoesService';
import { ResumoDTO } from '../../dto/minhas_emissoes/ResumoDTO';

// Registrando os componentes necessários para gráfico de linha e doughnut
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// Configurações do gráfico de linha
export const lineOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: false,
            text: 'Emissões ao Longo do Tempo',
        },
    },
    scales: {
        y: {
            beginAtZero: true,
        },
    },
};

// Configurações do gráfico doughnut
export const doughnutOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: false,
        },
    },
    maintainAspectRatio: false,
};


type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const BackIcon = IoChevronBackSharp as unknown as SVGIcon;

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [isModalOpen, setIsModalOPen] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const mesesDisponiveis = [
        { value: '1', label: 'Janeiro' },
        { value: '2', label: 'Fevereiro' },
        { value: '3', label: 'Março' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Maio' },
        { value: '6', label: 'Junho' },
        { value: '7', label: 'Julho' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Setembro' },
        { value: '10', label: 'Outubro' },
        { value: '11', label: 'Novembro' },
        { value: '12', label: 'Dezembro' },
    ];
    // filtros
    const currentYear = new Date().getFullYear().toString();
    const [anoLinha, setAnoLinha] = useState<string>(currentYear);
    const [anoPizza, setAnoPizza] = useState<string>(currentYear);
    const [mesPizza, setMesPizza] = useState<string | undefined>(undefined);
    const [resumoDTO, setResumoDTO] = useState<ResumoDTO>(
        {
            combustivelMaisUtilizado: '',
            percentualReducao: 0,
            mediaTrimestre: 0,
            mediaEstado: 0,
            msgGemini: ''
        }
    );

    // estados dos gráficos
    const [lineData, setLineData] = useState<any>({
        labels: [],
        datasets: [
            {
                label: 'Emissões CO2 (kg)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
            },
        ],
    });

    const [doughnutData, setDoughnutData] = useState<any>({
        labels: [],
        datasets: [
            {
                label: 'Emissões por Categoria',
                data: [],
                backgroundColor: [] as string[],
                borderColor: [] as string[],
                borderWidth: 2,
            },
        ],
    });

    // listas fixas de opções
    const anosDisponiveis = useMemo(
        () =>
            Array.from({ length: 10 }, (_, i) => {
                const y = Number(currentYear) - i;
                return { value: y.toString(), label: y.toString() };
            }),
        [currentYear]
    );

    // chamadas de API
    const fetchLinha = useCallback(async (ano: string) => {
        try {
            setLoading(true);
            const resp = await MinhasEmissoesService.getTotalizadoresMensais(Number(ano));
            if (resp.success && resp.data) {
                setLineData({
                    labels: resp.data.labels,
                    datasets: [
                        {
                            label: 'Emissões CO2 (kg)',
                            data: resp.data.data,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1,
                        },
                    ],
                });
            } else {
                setLineData((prev: any) => ({ ...prev, labels: [], datasets: [{ ...prev.datasets[0], data: [] }] }));
            }
        } catch (err: any) {
            messageApi.error(err?.message ?? 'Erro ao carregar totalizadores mensais');
        }
        finally {
            setLoading(false);
        }
    }, [messageApi]);

    const fetchPizza = useCallback(async (ano: string, mes?: string) => {
        try {
            setLoading(true);
            const resp = await MinhasEmissoesService.getTotalPorCategoria(Number(ano), mes ? Number(mes) : 0);
            if (resp.success && resp.data) {
                setDoughnutData({
                    labels: resp.data.labels,
                    datasets: [
                        {
                            label: 'Emissões por Categoria',
                            data: resp.data.data,
                            backgroundColor: ['rgba(255, 99, 132, 0.8)',
                                'rgba(54, 162, 235, 0.8)'],
                            borderColor: ['rgba(255, 99, 132, 0.8)',
                                'rgba(54, 162, 235, 0.8)'],
                            borderWidth: 2,
                        },
                    ],
                });
            } else {
                setDoughnutData((prev: any) => ({ ...prev, labels: [], datasets: [{ ...prev.datasets[0], data: [] }] }));
            }
        } catch (err: any) {
            messageApi.error(err?.message ?? 'Erro ao carregar totais por categoria');
        }
        finally {
            setLoading(false);
        }
    }, [messageApi]);

    // carregar inicial
    useEffect(() => {
        fetchLinha(anoLinha);
    }, [anoLinha, fetchLinha]);

    useEffect(() => {
        fetchPizza(anoPizza, mesPizza);
    }, [anoPizza, mesPizza, fetchPizza]);

    async function abrirModal() {
        try {
            setIsModalOPen(true);
            setLoadingModal(true);
            const response = await MinhasEmissoesService.getResumo();
            setResumoDTO(response.data as ResumoDTO);
        } catch (error) {
            messageApi.error('Erro ao carregar resumo');
        }
        finally {
            setLoadingModal(false);
        }

    }
    function fecharModal() {
        setIsModalOPen(false);
    }

    return (
        <div className={styles.main}>
            {loading && (<Loading />)}
            {contextHolder}
            <div className={styles.container}>
                <div className={styles.header}>
                    <BackIcon onClick={() => { navigate('/home') }} className={styles.backIcon} />
                    <span>Minhas emissões</span>
                </div>

                <div className={styles.body}>
                    <Row style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Col span={9} style={{ height: '100%' }}>
                            <div className={styles.card}>
                                <div className={styles.containerFiltros}>
                                    <Row>
                                        <Col span={12}>
                                            <span className={styles.label}>Ano:</span>
                                            <Select
                                                className={styles.drpFiltro}
                                                defaultValue={anosDisponiveis[0].value}
                                                size='small'
                                                showSearch
                                                variant="outlined"
                                                style={{ flex: 1, width: '50%' }}
                                                filterSort={(optionA, optionB) =>
                                                    (optionB?.label ?? '').toLowerCase().localeCompare((optionA?.label ?? '').toLowerCase())
                                                }
                                                optionFilterProp="label"
                                                options={anosDisponiveis}
                                                onChange={setAnoPizza}
                                            />
                                        </Col>

                                        <Col span={12}>
                                            <span className={styles.label}>Mês:</span>
                                            <Select
                                                className={styles.drpFiltro}
                                                size='small'
                                                showSearch
                                                allowClear
                                                variant="outlined"
                                                style={{ flex: 1, width: '60%' }}
                                                filterSort={(optionA, optionB) =>
                                                    Number(optionA.value) - Number(optionB.value)
                                                }
                                                optionFilterProp="label"
                                                options={mesesDisponiveis}
                                                onChange={(v) => setMesPizza(v)}
                                            />
                                        </Col>
                                    </Row>
                                </div>

                                <div className={styles.containerGrafico} style={{ height: '70%', marginBottom: 'auto', marginTop: 'auto' }}>
                                    <Doughnut options={doughnutOptions} data={doughnutData} />
                                </div>
                            </div>
                        </Col>
                        <Col span={13} style={{ height: '100%' }}>
                            <div className={styles.card}>
                                <div className={styles.containerFiltros}>
                                    <Row>
                                        <Col span={12}>
                                            <span className={styles.label}>Ano:</span>
                                            <Select
                                                className={styles.drpFiltro}
                                                defaultValue={anosDisponiveis[0].value}
                                                size='small'
                                                showSearch
                                                variant="outlined"
                                                style={{ flex: 1, width: '50%' }}
                                                filterSort={(optionA, optionB) =>
                                                    (optionB?.label ?? '').toLowerCase().localeCompare((optionA?.label ?? '').toLowerCase())
                                                }
                                                optionFilterProp="label"
                                                options={anosDisponiveis}
                                                onChange={setAnoLinha}
                                            />
                                        </Col>
                                    </Row>
                                </div>

                                <div className={styles.containerGrafico} style={{ height: '100%' }}>
                                    <Line options={lineOptions} data={lineData} />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                <div className={styles.footer}>
                    <BtnPrincipal onClick={abrirModal} label='Ver Resumo' size='middle' width={'10%'} />
                </div>
            </div>

            <Resumo resumoDTO={resumoDTO} isOpen={isModalOpen} loadingModal={loadingModal} onClose={fecharModal} />
        </div>
    )
}