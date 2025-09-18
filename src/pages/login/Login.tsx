import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { IoChevronBackSharp } from 'react-icons/io5';
import { Col, DatePicker, Flex, Form, Input, Modal, Row, Select, Typography, message, FormProps } from 'antd';
import type { Rule } from 'antd/es/form';
import BtnPrincipal from '../../components/geral/BtnPrincipal';
import BtnSecundario from '../../components/geral/BtnSecundario';
import Loading from '../../components/geral/Loading';
import { useAuth } from '../../context/AuthContext';
import estadoService from '../../services/estado/estadoService';
import userService from '../../services/usuario/usuarioService';
import { formatCpf, passwordValidationMessage } from '../../utils/stringUtils';
import type { UsuarioDTO } from '../../dto/usuario/UsuarioDTO';
import styles from './styles.module.scss';

const { Text } = Typography;

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const BackIcon = IoChevronBackSharp as unknown as SVGIcon;

export default function Login() {
    const navigate = useNavigate();
    const [opcao, setOpcao] = useState<number>(1);
    const [formUsuario] = Form.useForm();
    const [formRedefinirSenha] = Form.useForm();
    const [dadosUsuario, setDadosUsuario] = useState<Partial<UsuarioDTO>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [estados, setEstados] = useState<any[]>([]);
    const { syncAuth } = useAuth();

    const handleCpfChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const formatted = formatCpf(e.target.value)
        formUsuario.setFieldsValue({ cpf: formatted })
    }

    const validatePasswordRule: Rule = {
        validator: async (_rule, value) => {
            const msg = passwordValidationMessage(value);
            if (msg) return Promise.reject(new Error(msg));
            return Promise.resolve();
        },
    };

    async function login() {
        try {
            setLoading(true);
            const values = formUsuario.getFieldsValue();

            const response = await userService.login({
                email: values.email,
                senha: values.senha
            });

            if (response.success) {
                messageApi.open({ type: 'success', content: 'Login realizado com sucesso!' })
                await syncAuth();
                navigate('/home');
            } else {
                messageApi.open({ type: 'warning', content: response.message || 'Email ou senha inválidos' })
            }
        } catch (error: any) {
            messageApi.open({ type: 'error', content: error.message || 'Erro ao realizar login' })
        } finally {
            setLoading(false);
        }
    }

    async function cadastrar(values: any) {
        try {
            setLoading(true);
            const dadosCompletos = { ...dadosUsuario, ...values };

            const dataNascimento = dadosCompletos.dataNascimento
                ? dayjs(dadosCompletos.dataNascimento).format('DD/MM/YYYY')
                : '';

            const cpfLimpo = dadosCompletos.cpf ? dadosCompletos.cpf.replace(/\D/g, '') : '';

            const response = await userService.register({
                nome: dadosCompletos.nome,
                cpf: cpfLimpo,
                email: dadosCompletos.email,
                senha: dadosCompletos.senha,
                dataNascimento: dataNascimento,
                estadoId: dadosCompletos.estadoId
            });

            if (response.success) {
                messageApi.open({ type: 'success', content: 'Cadastro realizado com sucesso!' })
                await syncAuth();
                navigate('/home');
            } else {
                messageApi.open({ type: 'warning', content: response.message || 'Erro ao realizar cadastro' })
            }
        } catch (error: any) {
            messageApi.open({ type: 'error', content: error.message || 'Erro ao processar cadastro' })
        } finally {
            setLoading(false);
        }
    }

    const onFinishLogin: FormProps<UsuarioDTO>['onFinish'] = async (values) => {
        if (opcao == 2) {
            proximo();
        } else if (opcao == 3) {
            await cadastrar(values);
        } else {
            await login();
        }
    };

    const onFinishRedefinirSenha: FormProps<UsuarioDTO>['onFinish'] = async (values) => {
        try {
            setLoading(true);

            const response = await userService.forgotPassword(values.email);
            if (response.success) {
                messageApi.open({ type: 'success', content: 'Email de recuperação enviado! Verifique sua caixa de entrada.' })
                setIsModalOpen(false);
                formRedefinirSenha.resetFields();
            } else {
                messageApi.open({ type: 'error', content: response.message || 'Erro ao enviar email de recuperação' })
            }
        } catch (error: any) {
            messageApi.open({ type: 'error', content: error.message || 'Erro ao processar solicitação' })
        } finally {
            setLoading(false);
        }
    };

    function proximo() {
        if (opcao == 1) {
            formUsuario.resetFields();
        }
        const valores = formUsuario.getFieldsValue();
        setDadosUsuario(prev => ({ ...prev, ...valores }));
        setOpcao(opcao + 1);
    }

    function voltar() {
        if (opcao == 2) {
            formUsuario.resetFields();
        }
        setOpcao(opcao - 1);
    }

    const onFinishFailedLogin: FormProps<UsuarioDTO>['onFinishFailed'] = (errorInfo) => {
        messageApi.open({ type: 'error', content: 'Ocorreu um erro ao fazer  login\n' + errorInfo });
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        formRedefinirSenha.resetFields();
    };

    useEffect(() => {
        estadoService.getAllEstado().then(estados => {
            const estadosFormatados = estados.map(estado => ({
                label: estado.nome,
                value: estado.id
            }));
            setEstados(estadosFormatados);
        }).catch(error => {
            console.error('Erro ao carregar estados:', error);
            messageApi.open({ type: 'error', content: 'Erro ao carregar estados' });
        });
    }, []);


    return (
        <div className={styles.main} style={{
            backgroundImage: "url(/bgLogin.avif)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
        }}>
            <div className={styles.container}>
                {contextHolder}
                {loading && (<Loading />)}
                <div className={styles.header}>
                    {opcao > 1 && <BackIcon onClick={voltar} className={styles.backIcon} />}
                    <img src="/ecoLog_logo.png" alt="ecoLog" className={styles.logo} />
                </div>

                <div className={styles.content}>
                    <Form
                        form={formUsuario}
                        name="basic"
                        initialValues={{ remember: true }}
                        onFinish={onFinishLogin}
                        onFinishFailed={onFinishFailedLogin}
                        autoComplete="off"
                    >
                        {opcao == 1 && (
                            <>
                                <Row style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                                    <Col style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} span={15}>
                                        <Flex gap="middle" vertical style={{ gap: '26px' }}>
                                            <Form.Item<UsuarioDTO["email"]>
                                                name="email"
                                                rules={[
                                                    { required: true, message: 'Por favor, preencha seu email!' },
                                                    { type: 'email', message: 'Email inválido!' }
                                                ]}
                                                style={{ marginBottom: '0px' }}
                                            >
                                                <Input size="large" placeholder="Email@" variant="underlined" />
                                            </Form.Item>

                                            <Form.Item<UsuarioDTO["senha"]>
                                                name="senha"
                                                rules={[{ required: true, message: 'Por favor, preencha sua senha!' }]}
                                            >
                                                <Input.Password size="large" placeholder="Senha" variant="underlined" />
                                            </Form.Item>
                                        </Flex>

                                        <Flex gap="middle" vertical style={{ gap: '16px' }}>
                                            <Form.Item label={null} style={{ marginBottom: '0px' }}>
                                                <BtnPrincipal
                                                    label='Login'
                                                    htmlType="submit"
                                                    size='middle'
                                                    disabled={loading}
                                                />
                                            </Form.Item>

                                            <BtnSecundario label='Cadastrar' onClick={proximo} size='middle' disabled={loading} />
                                            <Text type="secondary" onClick={showModal} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                                Esqueceu a senha?
                                            </Text>
                                        </Flex>
                                    </Col>
                                </Row>
                            </>
                        )}

                        {opcao == 2 && (
                            <Row style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                                <Col style={{ display: 'flex', flexDirection: 'column', gap: '26px' }} span={15}>
                                    <Flex gap="middle" vertical style={{ gap: '26px' }}>
                                        <Form.Item<UsuarioDTO["nome"]>
                                            name="nome"
                                            rules={[
                                                { required: true, message: 'Por Favor, preencha o seu nome!' },
                                                { min: 3, message: 'O nome deve ter no mínimo 3 caracteres!' },
                                                { max: 80, message: 'O nome deve ter no máximo 80 caracteres!' }
                                            ]}
                                            style={{ marginBottom: '0px' }}
                                        >
                                            <Input size="large" placeholder="Nome Completo" variant="underlined" />
                                        </Form.Item>

                                        <Form.Item<UsuarioDTO["dataNascimento"]>
                                            name="dataNascimento"
                                            rules={[{ required: true, message: 'Por Favor, preencha sua data de nascimento!' }]}
                                            style={{ marginBottom: '0px' }}
                                        >
                                            <DatePicker
                                                format="DD/MM/YYYY"
                                                size='large'
                                                style={{ width: '100%' }}
                                                placeholder="Data de Nascimento"
                                                variant="underlined"
                                            />
                                        </Form.Item>

                                        <Form.Item<UsuarioDTO["cpf"]>
                                            name="cpf"
                                            rules={[
                                                { required: true, message: 'Por Favor, preencha seu CPF!' },
                                                { len: 14, message: 'CPF inválido!' }
                                            ]}
                                            style={{ marginBottom: '0px' }}
                                        >
                                            <Input
                                                size="large"
                                                onChange={handleCpfChange}
                                                placeholder="CPF"
                                                variant="underlined"
                                                maxLength={14}
                                            />
                                        </Form.Item>

                                        <Form.Item<UsuarioDTO["estadoId"]>
                                            name="estadoId"
                                            rules={[{ required: true, message: 'Por Favor, informe seu estado de residência!' }]}
                                            style={{ marginBottom: '0px' }}
                                        >
                                            <Select
                                                showSearch
                                                placeholder="Estado de Residência"
                                                variant="underlined"
                                                style={{ flex: 1 }}
                                                filterSort={(optionA, optionB) =>
                                                    (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                                }
                                                optionFilterProp="label"
                                                options={estados}
                                            />
                                        </Form.Item>
                                    </Flex>

                                    <Flex gap="middle" vertical style={{ gap: '16px' }}>
                                        <Form.Item label={null} style={{ marginBottom: '0px' }}>
                                            <BtnPrincipal
                                                label='Próximo'
                                                htmlType="submit"
                                                size='middle'
                                                disabled={loading}
                                            />
                                        </Form.Item>
                                    </Flex>
                                </Col>
                            </Row>
                        )}

                        {opcao == 3 && (
                            <Row style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                                <Col style={{ display: 'flex', flexDirection: 'column', gap: '26px' }} span={15}>
                                    <Flex gap="middle" vertical style={{ gap: '26px' }}>
                                        <Form.Item<UsuarioDTO["email"]>
                                            name="email"
                                            rules={[
                                                { required: true, message: 'Por favor, preencha seu email!' },
                                                { type: 'email', message: 'Email inválido!' }
                                            ]}
                                            style={{ marginBottom: '0px' }}
                                        >
                                            <Input size="large" placeholder="Email@" variant="underlined" />
                                        </Form.Item>

                                        <Form.Item<UsuarioDTO["senha"]>
                                            name="senha"
                                            rules={[
                                                { required: true, message: 'Por favor, preencha sua senha!' },
                                                validatePasswordRule
                                            ]}
                                            style={{ marginBottom: '0px' }}
                                        >
                                            <Input.Password size="large" placeholder="Senha" variant="underlined" />
                                        </Form.Item>
                                    </Flex>

                                    <Flex gap="middle" vertical style={{ gap: '16px' }}>
                                        <Form.Item label={null} style={{ marginBottom: '0px' }}>
                                            <BtnPrincipal
                                                label='Cadastrar'
                                                htmlType="submit"
                                                size='middle'
                                                disabled={loading}
                                            />
                                        </Form.Item>
                                    </Flex>
                                </Col>
                            </Row>
                        )}
                    </Form>
                </div>

                <Modal
                    title="Recuperar Senha"
                    closable={{ 'aria-label': 'Custom Close Button' }}
                    open={isModalOpen}
                    onCancel={handleCancel}
                    footer={[]}
                >
                    <Form onFinish={onFinishRedefinirSenha} form={formRedefinirSenha}>
                        <Form.Item<UsuarioDTO["email"]>
                            name="email"
                            rules={[
                                { required: true, message: 'Por favor, preencha seu email!' },
                                { type: 'email', message: 'Email inválido!' }
                            ]}
                            style={{ marginTop: '16px', marginBottom: '16px' }}
                        >
                            <Input size="large" placeholder="Email@" variant="underlined" />
                        </Form.Item>

                        <Flex vertical={false} justify='flex-end' gap='8px' style={{ paddingTop: '8px' }}>
                            <BtnSecundario label='Cancelar' onClick={handleCancel} size='middle' disabled={loading} />
                            <BtnPrincipal
                                label='Enviar'
                                htmlType="submit"
                                size='middle'
                                width='26%'
                                disabled={loading}
                            />
                        </Flex>
                    </Form>
                </Modal>
            </div>
        </div>
    )
}