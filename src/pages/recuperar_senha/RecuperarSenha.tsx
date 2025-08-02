import { Col, Form, FormProps, Input, Row } from 'antd';
import styles from './styles.module.scss';
import { UsuarioDTO } from '../../dto/UsuarioDTO';
import BtnPrincipal from '../../components/geral/BtnPrincipal';


export default function RecuperarSenha() {
    const [formSenha] = Form.useForm();

    const onFinishLogin: FormProps<UsuarioDTO>['onFinish'] = (values) => {

        console.log('Success:', values);

    };


    const onFinishFailedLogin: FormProps<UsuarioDTO>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className={styles.main}>
            <div className={styles.container}>
                <Row style={{ marginTop: '24px', marginBottom: '48px' }}>
                    <Col className={styles.header} span={24}>
                        <img src="/ecoLog_logo.png" alt="ecoLog" className={styles.logo} />
                    </Col>
                </Row>

                <Row style={{ display: 'flex', justifyContent: 'center' }}>
                    <Col span={16}>

                        <Form
                            form={formSenha}
                            name="basic"
                            initialValues={{ remember: true }}
                            onFinish={onFinishLogin}
                            onFinishFailed={onFinishFailedLogin}
                            autoComplete="off"
                            layout="vertical"
                            style={{gap:'24px', display:'flex', flexDirection:'column'}}
                        >

                            <Form.Item<UsuarioDTO["senha"]>
                                name="senha"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por favor, digite sua nova senha!',
                                    },
                                ]}
                                hasFeedback
                            >
                                <Input.Password size="large" placeholder="Nova senha" variant="underlined"/>
                            </Form.Item>

                            <Form.Item
                                name="confirmar"                                
                                dependencies={['senha']}
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Confirme sua senha!',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('senha') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('As senhas não coincidem!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password size="large" placeholder="Confirmar senha" variant="underlined"/>
                            </Form.Item>

                            <Form.Item label={null} style={{ marginTop: '24px' }}>
                                <BtnPrincipal label='Alterar Senha' htmlType='submit' size='middle' />
                            </Form.Item>
                        </Form>

                    </Col>
                </Row>
            </div>
        </div>
    )
}