import { Carousel, Col, Flex, Modal, Row, Tooltip } from "antd";
import styles from './styles.module.scss';
import { GiBrazil } from "react-icons/gi";
import { SlGraph } from "react-icons/sl";
import { BsFuelPump } from "react-icons/bs";
import { TbPlusMinus } from "react-icons/tb";
import { BsQuestionCircle } from "react-icons/bs";

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const IconBrasil = GiBrazil as unknown as SVGIcon;
const IconGraph = SlGraph as unknown as SVGIcon;
const IconCombustivel = BsFuelPump as unknown as SVGIcon;
const IconMedia = TbPlusMinus as unknown as SVGIcon;
const IconInterrogacao = BsQuestionCircle as unknown as SVGIcon;

interface ResumoDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

const contentStyle: React.CSSProperties = {
    margin: 0,
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
};

export default function Resumo({
    isOpen,
    onClose
}: ResumoDashboardProps) {

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
            width={'40vw'}
        >
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
                                            <span className={styles.valor}>87kg de CO2</span>
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
                                            <span className={styles.valor}>87kg de CO2</span>
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
                                            <span className={styles.valor}>Etanol</span>
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
                                            <span className={styles.valor}>3%</span>
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
                                Ótimo ver que você está monitorando suas emissões! Nos últimos 3 meses, você emitiu 80kg de CO2.
                                O etanol é uma ótima escolha, pois emite menos CO2. Para reduzir ainda mais suas emissões,
                                tente otimizar o consumo elétrico com aparelhos mais eficientes ou explore fontes renováveis.
                                Juntos podemos diminuir ainda mais essas emissões!
                            </span>
                        </div>
                    </Col>
                </Row>

            </div>
        </Modal>

    )
}