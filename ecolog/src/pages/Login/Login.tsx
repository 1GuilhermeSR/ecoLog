import { Col, DatePicker, Flex, Form, FormProps, Input, Modal, Row, Select, Typography } from 'antd';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import BtnPrincipal from '../../components/BtnPrincipal';
import BtnSecundario from '../../components/BtnSecundario';
import { LoginDTO } from '../../dto/LoginDTO';
import { UsuarioDTO } from '../../dto/UsuarioDTO';
import { IoChevronBackSharp } from "react-icons/io5";

const { Text, Link } = Typography;

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const BackIcon = IoChevronBackSharp as unknown as SVGIcon;

export default function Login() {
    const [opcao, setOpcao] = useState<number>(1);
    const [formUsuario] = Form.useForm();
    const [formRedefinirSenha] = Form.useForm();
    const [dadosUsuario, setDadosUsuario] = useState<Partial<UsuarioDTO>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    function formatCpf(value: string): string {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        let formatted = digits.replace(/^(\d{3})(\d)/, '$1.$2');
        formatted = formatted.replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2');
        formatted = formatted.replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, '$1-$2');

        return formatted;
    }

    const handleCpfChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const formatted = formatCpf(e.target.value);
        formUsuario.setFieldsValue({ cpf: formatted });
    };

    function usuarioJaTemCadastro() {
        return opcao == 1 ? true : false;
    }

    function login() {

    }

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



    const onFinishLogin: FormProps<UsuarioDTO>['onFinish'] = (values) => {
        if (opcao == 2) {
            proximo();
        } else if (opcao == 3) {
            const dadosCompletos = { ...dadosUsuario, ...values };
            console.log('Dados completos do usuário:', dadosCompletos);
        } else {
            Login();
            console.log('Success:', values);
        }
    };

    const onFinishRedefinirSenha: FormProps<UsuarioDTO>['onFinish'] = (values) => {
        console.log('Success:', values);
    };


    const onFinishFailedLogin: FormProps<UsuarioDTO>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        formRedefinirSenha.resetFields();
    };

    return (
        <div className={styles.main}>
            <div className={styles.container}>
                <Row style={{ marginTop: '24px', marginBottom: '48px' }}>
                    <Col className={styles.header} span={24}>
                        {opcao > 1 && <BackIcon onClick={voltar} className={styles.backIcon} />}
                        <img src="/ecoLog_logo.png" alt="ecoLog" className={styles.logo} />
                    </Col>
                </Row>

                <Form
                    form={formUsuario}
                    name="basic"
                    initialValues={{ remember: true }}
                    onFinish={onFinishLogin}
                    onFinishFailed={onFinishFailedLogin}
                    autoComplete="off"
                >
                    {
                        opcao == 1 && (
                            <>
                                <Row style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                                    <Col style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} span={15}>

                                        <Flex gap="middle" vertical style={{ gap: '26px' }}>
                                            <Form.Item<UsuarioDTO["email"]>
                                                name="email"
                                                rules={[{ required: usuarioJaTemCadastro(), message: 'Por favor, preencha seu email corretamente!', type: 'email' }]}
                                                style={{ marginBottom: '0px' }}
                                            >
                                                <Input size="large" placeholder="Email@" variant="underlined" />
                                            </Form.Item>

                                            <Form.Item<UsuarioDTO["senha"]>
                                                name="senha"
                                                rules={[{ required: usuarioJaTemCadastro(), message: 'Por favor, preencha sua senha!' }]}
                                            >
                                                <Input.Password size="large" placeholder="Senha" variant="underlined" />
                                            </Form.Item>

                                        </Flex>

                                        <Flex gap="middle" vertical style={{ gap: '16px' }}>
                                            <Form.Item label={null} style={{ marginBottom: '0px' }}>
                                                <BtnPrincipal label='Login' onClick={login} size='middle' />
                                            </Form.Item>

                                            <BtnSecundario label='Cadastrar' onClick={proximo} size='middle' />
                                            <Text type="secondary" onClick={showModal} style={{ cursor: 'pointer', userSelect: 'none', }}>Esqueceu a senha?</Text>
                                        </Flex>

                                    </Col>
                                </Row>
                            </>
                        )
                    }

                    {
                        opcao == 2 && (
                            <Row style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                                <Col style={{ display: 'flex', flexDirection: 'column', gap: '26px' }} span={15}>

                                    <Flex gap="middle" vertical style={{ gap: '26px' }}>
                                        <Form.Item<UsuarioDTO["nome"]>
                                            name="nome"
                                            rules={[{ required: !usuarioJaTemCadastro(), message: 'Por Favor, preencha o seu nome!' }]}
                                            style={{ marginBottom: '0px' }}
                                        >
                                            <Input size="large" placeholder="Nome Completo" variant="underlined" />
                                        </Form.Item>

                                        <Form.Item<UsuarioDTO["dataNascimento"]>
                                            name="dataNascimento"
                                            rules={[{ required: !usuarioJaTemCadastro(), message: 'Por Favor, preencha sua data de nascimento!' }]}
                                            style={{ marginBottom: '0px' }}
                                        >
                                            <DatePicker format="DD/MM/YYYY" size='large' style={{ width: '100%' }} placeholder="Data de Nascimento" variant="underlined" />
                                        </Form.Item>

                                        <Form.Item<UsuarioDTO["cpf"]>
                                            name="cpf"
                                            rules={[{ required: !usuarioJaTemCadastro(), message: 'Por Favor, preencha seu CPF!', len:14 }]}
                                            style={{ marginBottom: '0px' }}
                                        >
                                            <Input size="large" onChange={handleCpfChange} placeholder="CPF" variant="underlined" />
                                        </Form.Item>

                                        <Form.Item<UsuarioDTO["estadoId"]>
                                            name="estadoId"
                                            rules={[{ required: true, message: 'Por Favor, informe seu estado de residencia!' }]}
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
                                                options={[
                                                    { value: '1', label: 'Goiás' },
                                                    { value: '2', label: 'São Paulo' },
                                                    { value: '3', label: 'Santa Catarina' },
                                                ]}
                                            />
                                        </Form.Item>

                                    </Flex>

                                    <Flex gap="middle" vertical style={{ gap: '16px' }}>
                                        <Form.Item label={null} style={{ marginBottom: '0px' }}>
                                            <BtnPrincipal onClick={() => { }} label='Próximo' size='middle' />
                                        </Form.Item>
                                    </Flex>

                                </Col>
                            </Row>
                        )
                    }

                    {
                        opcao == 3 && (
                            <Row style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                                <Col style={{ display: 'flex', flexDirection: 'column', gap: '26px' }} span={15}>

                                    <Flex gap="middle" vertical style={{ gap: '26px' }}>
                                        <Form.Item<UsuarioDTO["email"]>
                                            name="email"
                                            rules={[{ required: !usuarioJaTemCadastro(), message: 'Por favor, preencha seu email corretamente!', type: 'email' }]}
                                            style={{ marginBottom: '0px' }}
                                        >
                                            <Input size="large" placeholder="Email@" variant="underlined" />
                                        </Form.Item>

                                        <Form.Item<UsuarioDTO["senha"]>
                                            name="senha"
                                            rules={[{ required: !usuarioJaTemCadastro(), message: 'Por favor, preencha sua senha!' }]}
                                            style={{ marginBottom: '0px' }}
                                        >
                                            <Input.Password size="large" placeholder="Senha" variant="underlined" />
                                        </Form.Item>

                                    </Flex>

                                    <Flex gap="middle" vertical style={{ gap: '16px' }}>
                                        <Form.Item label={null} style={{ marginBottom: '0px' }}>
                                            <BtnPrincipal label='Cadastrar' size='middle' />
                                        </Form.Item>
                                    </Flex>

                                </Col>
                            </Row>
                        )
                    }

                </Form>

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
                            rules={[{ required: true, message: 'Por favor, preencha seu email corretamente!', type: 'email' }]}
                            style={{ marginTop: '16px', marginBottom: '16px' }}
                        >
                            <Input size="large" placeholder="Email@" variant="underlined" />
                        </Form.Item>

                        <Flex vertical={false} justify='flex-end' gap='8px' style={{ paddingTop: '8px' }}>
                            <BtnSecundario label='Cancelar' onClick={handleCancel} size='middle' />
                            <BtnPrincipal label='Enviar' size='middle' width='26%' />
                        </Flex>
                    </Form>
                </Modal>

            </div>
        </div>
    )
}