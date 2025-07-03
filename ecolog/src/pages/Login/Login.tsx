import { Col, Flex, Input, Row, Typography } from 'antd';
import styles from './styles.module.scss';
import { useState } from 'react';
import BtnPrincipal from '../../components/BtnPrincipal';
import BtnSecundario from '../../components/BtnSecundario';
const { Text, Link } = Typography;
export default function Login() {

    const [opcao, setOpcao] = useState<Number>(1);


    function login() {
        console.log("Login")
    }

    function cadastrar() {
        console.log("Cadastro")
    }

    function esqueceuSenha() {
        console.log("Esqueceu senha")
    }

    return (
        <div className={styles.main}>
            <div className={styles.container}>
                <Row style={{ marginTop: '24px', marginBottom: '48px' }}>
                    <Col style={{ display: 'flex', justifyContent: 'center' }} span={24}><img src="/ecoLog_logo.png" alt="ecoLog" style={{ width: '10vw' }} /></Col>
                </Row>

                {
                    opcao == 1 && (
                        <>
                            <Row style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                                <Col style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} span={14}>

                                    <Flex gap="middle" vertical style={{ gap: '26px' }}>
                                        <Input size="large" placeholder="Email@" variant="underlined" />
                                        <Input.Password size="large" placeholder="Senha" variant="underlined" />
                                    </Flex>

                                    <Flex gap="middle" vertical style={{ gap: '14px' }}>
                                        <BtnPrincipal label='Login' onClick={login} size='middle' />
                                        <BtnSecundario label='Cadastrar' onClick={cadastrar} size='middle' />
                                        <Text type="secondary" onClick={esqueceuSenha} style={{cursor:'pointer', userSelect: 'none',}}>Esqueceu a senha?</Text>
                                    </Flex>

                                </Col>
                            </Row>


                        </>

                    )
                }
            </div>
        </div>
    )

}