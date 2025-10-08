import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBackSharp } from 'react-icons/io5';
import { Tooltip as AntdTooltip } from 'antd';
import {
    Col,
    message,
    Row,
    Select,
    Grid,
} from 'antd';
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
import BtnPrincipal from '../../components/geral/BtnPrincipal';
import Loading from '../../components/geral/Loading';
import Resumo from '../../components/resumoDashboard/Resumo';
import MinhasEmissoesService from '../../services/minhas_emissoes/MinhasEmissoesService';
import { ResumoDTO } from '../../dto/minhas_emissoes/ResumoDTO';
import styles from './styles.module.scss';
import { BsQuestionCircle } from 'react-icons/bs';

const { useBreakpoint } = Grid;
type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const BackIcon = IoChevronBackSharp as unknown as SVGIcon;
const IconInterrogacao = BsQuestionCircle as unknown as SVGIcon;

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

export const lineOptions = {
    responsive: true,
    plugins: {
        legend: { position: 'top' as const },
        title: { display: false, text: 'Emissões ao Longo do Tempo' },
    },
    scales: { y: { beginAtZero: true } },
};

export const doughnutOptions = {
    responsive: true,
    plugins: {
        legend: { position: 'top' as const },
        title: { display: false },
    },
    maintainAspectRatio: false,
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [loadingPizza, setLoadingPizza] = useState(false);
    const [loadingLinha, setLoadingLinha] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [isModalOpen, setIsModalOPen] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const screens = useBreakpoint();
    const isXs = !screens.sm;

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

    const currentYear = new Date().getFullYear().toString();
    const [anoLinha, setAnoLinha] = useState<string>(currentYear);
    const [anoPizza, setAnoPizza] = useState<string>(currentYear);
    const [mesPizza, setMesPizza] = useState<string | undefined>(undefined);
    const [resumoDTO, setResumoDTO] = useState<ResumoDTO>({
        combustivelMaisUtilizado: '',
        percentualReducao: 0,
        mediaTrimestre: 0,
        mediaEstado: 0,
        msgGemini: '',
    });

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

    const anosDisponiveis = useMemo(
        () =>
            Array.from({ length: 10 }, (_, i) => {
                const y = Number(currentYear) - i;
                return { value: y.toString(), label: y.toString() };
            }),
        [currentYear]
    );

    const fetchLinha = useCallback(
        async (ano: string) => {
            try {
                setLoadingLinha(true);
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
                    setLineData((prev: any) => ({
                        ...prev,
                        labels: [],
                        datasets: [{ ...prev.datasets[0], data: [] }],
                    }));
                }
            } catch (err: any) {
                messageApi.error(err?.message ?? 'Erro ao carregar totalizadores mensais');
            } finally {
                setLoadingLinha(false);
            }
        },
        [messageApi]
    );

    const fetchPizza = useCallback(
        async (ano: string, mes?: string) => {
            try {
                setLoadingPizza(true);
                const resp = await MinhasEmissoesService.getTotalPorCategoria(
                    Number(ano),
                    mes ? Number(mes) : 0
                );
                if (resp.success && resp.data) {
                    setDoughnutData({
                        labels: resp.data.labels,
                        datasets: [
                            {
                                label: 'Emissões por Categoria',
                                data: resp.data.data,
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.8)',
                                    'rgba(54, 162, 235, 0.8)',
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 0.8)',
                                    'rgba(54, 162, 235, 0.8)',
                                ],
                                borderWidth: 2,
                            },
                        ],
                    });
                } else {
                    setDoughnutData((prev: any) => ({
                        ...prev,
                        labels: [],
                        datasets: [{ ...prev.datasets[0], data: [] }],
                    }));
                }
            } catch (err: any) {
                messageApi.error(err?.message ?? 'Erro ao carregar totais por categoria');
            } finally {
                setLoadingPizza(false);
            }
        },
        [messageApi]
    );

    useEffect(() => { fetchLinha(anoLinha); }, [anoLinha, fetchLinha]);
    useEffect(() => { fetchPizza(anoPizza, mesPizza); }, [anoPizza, mesPizza, fetchPizza]);

    async function abrirModal() {
        try {
            setIsModalOPen(true);
            setLoadingModal(true);
            const response = await MinhasEmissoesService.getResumo();
            setResumoDTO(response.data as ResumoDTO);
        } catch {
            messageApi.error('Erro ao carregar resumo');
        } finally {
            setLoadingModal(false);
        }
    }

    function fecharModal() {
        setIsModalOPen(false);
    }

    return (
        <div className={styles.main}>
            {contextHolder}
            <div className={styles.container}>
                <div className={styles.header}>
                    <BackIcon onClick={() => navigate('/home')} className={styles.backIcon} />
                    <span>Minhas emissões</span>
                </div>

                <div className={styles.body}>
                    <Row
                        gutter={[16, 16]}
                        style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                    >
                        {/* {loading && <Loading />} */}

                        <Col xs={24} lg={9} style={{ height: isXs ? '80%' : '100%' }}>
                            <div className={styles.card}>
                                <div className={styles.containerFiltros}>
                                    <Row>
                                        <Col span={12}>
                                            <span className={styles.label}>Ano:</span>
                                            <Select
                                                className={styles.drpFiltro}
                                                defaultValue={anosDisponiveis[0].value}
                                                size="small"
                                                showSearch
                                                variant="outlined"
                                                style={{ flex: 1, width: '50%' }}
                                                filterSort={(a, b) => (b?.label ?? '').toLowerCase().localeCompare((a?.label ?? '').toLowerCase())}
                                                optionFilterProp="label"
                                                options={anosDisponiveis}
                                                onChange={setAnoPizza}
                                            />
                                        </Col>

                                        <Col span={11}>
                                            <span className={styles.label}>Mês:</span>
                                            <Select
                                                className={styles.drpFiltro}
                                                size="small"
                                                showSearch
                                                allowClear
                                                variant="outlined"
                                                style={{ flex: 1, width: '60%' }}
                                                filterSort={(a, b) => Number(a.value) - Number(b.value)}
                                                optionFilterProp="label"
                                                options={mesesDisponiveis}
                                                onChange={(v) => setMesPizza(v)}
                                            />
                                        </Col>

                                        <Col span={1} style={{ display: 'flex', alignItems: 'center' }}>
                                            <AntdTooltip title="Proporção das suas emissões de CO2 por categoria (Combustível x Energia) no ano escolhido. Use o filtro de mês para ver um mês específico." color={'#175E73'}>
                                                <IconInterrogacao style={{ color: '#aaaaaa9c', marginLeft: '4px' }} />
                                            </AntdTooltip>
                                        </Col>

                                    </Row>
                                </div>

                                <div className={styles.containerGrafico} style={{ height: '70%', marginBottom: 'auto', marginTop: 'auto' }}>
                                    {loadingPizza ? <Loading /> : <Doughnut options={doughnutOptions} data={doughnutData} />}
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} lg={13} style={{ height: isXs ? '80%' : '100%' }}>
                            <div className={styles.card}>
                                <div className={styles.containerFiltros}>
                                    <Row>
                                        <Col span={12}>
                                            <span className={styles.label}>Ano:</span>
                                            <Select
                                                className={styles.drpFiltro}
                                                defaultValue={anosDisponiveis[0].value}
                                                size="small"
                                                showSearch
                                                variant="outlined"
                                                style={{ flex: 1, width: '50%' }}
                                                filterSort={(a, b) => (b?.label ?? '').toLowerCase().localeCompare((a?.label ?? '').toLowerCase())}
                                                optionFilterProp="label"
                                                options={anosDisponiveis}
                                                onChange={setAnoLinha}
                                            />
                                        </Col>
                                        <Col span={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <AntdTooltip title="Evolução mensal das suas emissões de CO₂ ao longo do ano selecionado. Cada ponto representa o total do mês." color={'#175E73'}>
                                                <IconInterrogacao style={{ color: '#aaaaaa9c', marginLeft: '4px' }} />
                                            </AntdTooltip>
                                        </Col>
                                    </Row>
                                </div>

                                <div className={styles.containerGrafico} style={{ height: '100%' }}>
                                    {loadingLinha ? <Loading /> : <Line options={lineOptions} data={lineData} />}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                <div className={styles.footer}>
                    <BtnPrincipal onClick={abrirModal} label="Ver Resumo" size="middle" width={isXs ? '28%' : '12%'} />
                </div>
            </div>

            <Resumo resumoDTO={resumoDTO} isOpen={isModalOpen} loadingModal={loadingModal} onClose={fecharModal} />
        </div>
    );
}
