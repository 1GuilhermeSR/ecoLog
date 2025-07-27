import styles from './styles.module.scss';
import { ReactComponent as DashboardIcon } from '../../assets/dashboardIcon.svg';
import { ReactComponent as EnergiaIcon } from '../../assets/energiaIcon.svg';
import { ReactComponent as CombustivelIcon } from '../../assets/combustivelIcon.svg';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
    
    return (
        <div className={styles.main}>

            <div className={styles.card}>
                <div className={styles.containerIcon}>
                    <DashboardIcon className={styles.icone} />
                </div>

                <div className={styles.containerTexto}>
                    <span>Minhas Emissões</span>
                </div>
            </div>

            <div className={styles.card} onClick={() => {(navigate('/emissaoEnergia'))}}>
                <div className={styles.containerIcon}>
                    <EnergiaIcon className={styles.icone} />
                </div>

                <div className={styles.containerTexto}>
                    <span>Calcular Emissão Por Energia</span>
                </div>
            </div>

            <div className={styles.card} onClick={() => {(navigate('/emissaoCombustivel'))}}>
                <div className={styles.containerIcon}>
                    <CombustivelIcon className={styles.icone} />
                </div>

                <div className={styles.containerTexto}>
                    <span>Calcular Emissão Por Combustivel</span>
                </div>
            </div>

        </div>
    )
}