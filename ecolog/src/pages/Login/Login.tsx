import { Col, Row } from 'antd';
import styles from './styles.module.scss';

export default function Login() {

    return (
        <div className={styles.main}>
            <div className={styles.container}>
                <Row>
                    <Col style={{display:'flex', justifyContent:'center'}} span={24}><img src="/ecoLog_logo.png" alt="ecoLog" style={{ width: '10vw'}} /></Col>
                </Row>
            </div>
        </div>
    )

}