import { Col, Form, FormProps, Input, Row, message, Typography, Alert, Modal } from 'antd';
import styles from './styles.module.scss';
import { Rule } from 'antd/es/form';
import { passwordValidationMessage } from '../../utils/stringUtils';
import userService from '../../services/usuario/usuarioService';
import BtnPrincipal from '../../components/geral/BtnPrincipal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo, useState } from 'react';

type FormValues = {
    senha: string;
    confirmar: string;
};

export default function RecuperarSenha() {
    const [form] = Form.useForm<FormValues>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [modal, contextHolderModal] = Modal.useModal();

    // Lê token e email da URL
    const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);
    const email = useMemo(() => searchParams.get('email') ?? '', [searchParams]);

    const linkInvalido = !token || !email;

    const validatePasswordRule: Rule = {
        validator: async (_rule, value) => {
            const msg = passwordValidationMessage(value);
            if (msg) return Promise.reject(new Error(msg));
            return Promise.resolve();
        },
    };

    const abrirModalSucesso = () => {
        let secondsToGo = 5;

        const instance = modal.success({
            title: 'Senha redefinida com sucesso',
            content: `Faça o login com a nova senha. ${secondsToGo}`,
            afterClose: () => {
                navigate('/login', { replace: true });
            }
        });

        const timer = setInterval(() => {
            secondsToGo -= 1;
            instance.update({
                content: `Faça o login com a nova senha. ${secondsToGo}`,
            });
        }, 1000);

        setTimeout(() => {
            clearInterval(timer);
            instance.destroy();
        }, secondsToGo * 1000);
    };

    const onFinish: FormProps<FormValues>['onFinish'] = async (values) => {
        try {
            setLoading(true);
            const response = await userService.resetPassword({
                email,
                token,
                novaSenha: values.senha,
                confirmarSenha: values.senha
            });
            if (response.success) {
                abrirModalSucesso();
            }
            else {
                messageApi.open({ type: 'error', content: 'Erro ao redefinir senha.\n' + response.message });
            }

        } catch (err: any) {
            const apiMsg =
                err?.response?.data?.Message ||
                'Erro ao processar redefinição de senha';

            messageApi.open({ type: 'error', content: apiMsg });
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed: FormProps<FormValues>['onFinishFailed'] = (errorInfo) => {
        messageApi.open({ type: 'error', content: 'Ocorreu um erro ao redefinir a senha\n' + errorInfo });
    };

    if (linkInvalido) {
        return (
            <div className={styles.main}>
                <div className={styles.container}>
                    <Row style={{ marginTop: 24, marginBottom: 48 }}>
                        <Col className={styles.header} span={24}>
                            <img src="/ecoLog_logo.png" alt="ecoLog" className={styles.logo} />
                        </Col>
                    </Row>

                    <Row justify="center">
                        <Col span={16}>
                            <Alert
                                message="Link inválido"
                                description="O link de redefinição está incompleto ou expirado. Solicite novamente a recuperação de senha."
                                type="error"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                            <BtnPrincipal label="Voltar ao login" size="middle" onClick={() => navigate('/login')} />
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.main}>
            <div className={styles.container}>
                {contextHolder}
                {contextHolderModal}
                <Row style={{ marginTop: 24, marginBottom: 48 }}>
                    <Col className={styles.header} span={24}>
                        <img src="/ecoLog_logo.png" alt="ecoLog" className={styles.logo} />
                    </Col>
                </Row>

                <Row style={{ display: 'flex', justifyContent: 'center' }}>
                    <Col span={16}>
                        <Form<FormValues>
                            form={form}
                            name="reset-password"
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                            layout="vertical"
                            style={{ gap: 24, display: 'flex', flexDirection: 'column' }}
                            disabled={loading}
                        >
                            <Form.Item<FormValues>
                                name="senha"
                                rules={[
                                    { required: true, message: 'Por favor, digite sua nova senha!' },
                                    validatePasswordRule,
                                ]}
                                hasFeedback
                            >
                                <Input.Password size="large" placeholder="Nova senha" variant="underlined" />
                            </Form.Item>

                            <Form.Item<FormValues>
                                name="confirmar"
                                dependencies={['senha']}
                                hasFeedback
                                rules={[
                                    { required: true, message: 'Confirme sua senha!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('senha') === value) return Promise.resolve();
                                            return Promise.reject(new Error('As senhas não coincidem!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password size="large" placeholder="Confirmar senha" variant="underlined" />
                            </Form.Item>

                            <Form.Item style={{ marginTop: 24 }}>
                                <BtnPrincipal label="Alterar Senha" htmlType="submit" size="middle" disabled={loading} />
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </div>
        </div>
    );
}
