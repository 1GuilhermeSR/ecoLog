import { IoChevronBackSharp } from 'react-icons/io5';
import styles from './styles.module.scss';
import { useNavigate } from 'react-router-dom';
import { Col, Flex, Row, Select } from 'antd';
import BtnPrincipal from '../../components/geral/BtnPrincipal';
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
import { useState } from 'react';
import Resumo from '../../components/resumoDashboard/Resumo';

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

// Dados do gráfico de linha
const labels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const lineData = {
    labels: labels,
    datasets: [
        {
            label: 'Emissões CO2 (kg)',
            data: [65, 59, 80, 81, 56, 55, 40, 59, 80, 81, 56, 55],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
        },
    ],
};

// Dados do gráfico doughnut
export const doughnutData = {
    labels: ['Energia', 'Combustível'],
    datasets: [
        {
            label: 'Emissões por Categoria',
            data: [320, 180], // Valores de emissão em kg
            backgroundColor: [
                'rgba(54, 162, 235, 0.8)', // Azul para Energia
                'rgba(255, 99, 132, 0.8)', // Vermelho para Combustível
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 2,
        },
    ],
};

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const BackIcon = IoChevronBackSharp as unknown as SVGIcon;

export default function Dashboard() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOPen] = useState(false);
    const anosDisponiveis = [
        { value: '2025', label: '2025' },
        { value: '2024', label: '2024' },
        { value: '2023', label: '2023' },
        { value: '2022', label: '2022' },
        { value: '2021', label: '2021' },
        { value: '2020', label: '2020' },
        { value: '2019', label: '2019' },
        { value: '2018', label: '2018' },
        { value: '2017', label: '2017' },
        { value: '2016', label: '2016' },
    ];
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

    function abrirModal() {
        setIsModalOPen(true);
    }
    function fecharModal() {
        setIsModalOPen(false);
    }

    return (
        <div className={styles.main}>
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

            <Resumo isOpen={isModalOpen} onClose={fecharModal}/>
        </div>
    )
}