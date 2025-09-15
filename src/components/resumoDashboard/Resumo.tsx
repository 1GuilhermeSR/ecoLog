import { Carousel, Col, Modal, Row, Spin, Tooltip } from "antd";
import styles from './styles.module.scss';
import { GiBrazil } from "react-icons/gi";
import { SlGraph } from "react-icons/sl";
import { BsFuelPump } from "react-icons/bs";
import { TbPlusMinus } from "react-icons/tb";
import { BsQuestionCircle } from "react-icons/bs";
import { ResumoDTO } from "../../dto/minhas_emissoes/ResumoDTO";
import { LoadingOutlined } from "@ant-design/icons";
import { Grid } from 'antd';
type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const IconBrasil = GiBrazil as unknown as SVGIcon;
const IconGraph = SlGraph as unknown as SVGIcon;
const IconCombustivel = BsFuelPump as unknown as SVGIcon;
const IconMedia = TbPlusMinus as unknown as SVGIcon;
const IconInterrogacao = BsQuestionCircle as unknown as SVGIcon;

const { useBreakpoint } = Grid;
interface ResumoDashboardProps {
    isOpen: boolean;
    resumoDTO: ResumoDTO;
    loadingModal: boolean;
    onClose: () => void;
}

export default function Resumo({
    isOpen,
    resumoDTO,
    loadingModal,
    onClose
}: ResumoDashboardProps) {
    const screens = useBreakpoint();
    const isXs = !screens.sm;

    return (

        <Modal
            title={
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderBottom: '1px solid #8d8d8d6c',
                    color: '#8D8D8D',
                    paddingBottom: '8px',
                    marginBottom: '16px',
                    gap: '4px',
                    fontSize: '1.1em'
                }}>
                    <span>Resumo </span>
                    <Tooltip title="Todos os calculos são feitos com base nos útimos três meses" color={'#175E73'} key={'#175E73'}>
                        <IconInterrogacao style={{ color: '#8d8d8d85' }} />
                    </Tooltip>
                </div>
            }
            closable={{ 'aria-label': 'Custom Close Button' }}
            destroyOnHidden
            open={isOpen}
            onCancel={onClose}
            footer={[]}
            width={isXs ? '90vw' : '40vw'}
        >
            {loadingModal ?
                (<div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.49)'
                }}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                </div>)
                :
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Row>
                        <Col span={24}>
                            <Carousel autoplay={{ dotDuration: true }} autoplaySpeed={5000} arrows infinite={true}>
                                <div>
                                    <div className={styles.cardCarousel}>
                                        <div className={styles.container}>
                                            <IconBrasil />
                                            <div className={styles.box}>
                                                <span className={styles.titulo}>Média de emissão do seu estado</span>
                                                <span className={styles.valor}>{resumoDTO?.mediaEstado.toFixed(2)}kg de CO2</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className={styles.cardCarousel}>
                                        <div className={styles.container}>
                                            <IconMedia />
                                            <div className={styles.box}>
                                                <span className={styles.titulo}>Média de emissão</span>
                                                <span className={styles.valor}>{resumoDTO?.mediaTrimestre.toFixed(2)}kg de CO2</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className={styles.cardCarousel}>
                                        <div className={styles.container}>
                                            <IconCombustivel />
                                            <div className={styles.box}>
                                                <span className={styles.titulo}>Combustivel mais utilizado</span>
                                                <span className={styles.valor}>{resumoDTO?.combustivelMaisUtilizado}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className={styles.cardCarousel}>
                                        <div className={styles.container}>
                                            <IconGraph />
                                            <div className={styles.box}>
                                                <span className={styles.titulo}>Seu percentual de redução</span>
                                                <span style={{ color: resumoDTO?.percentualReducao < 0 ? '#BF4A4A' : '#5FC26E' }} className={styles.valor}>{resumoDTO?.percentualReducao.toFixed(2)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Carousel>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24} style={{ color: '#5D5D5D' }}>
                            Mensagem:
                            <div className={styles.cardMensagem}>
                                <span>
                                    {resumoDTO?.msgGemini}
                                </span>
                            </div>
                        </Col>
                    </Row>

                </div>
            }

        </Modal>

    )
}