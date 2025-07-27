import { Col, DatePicker, Flex, Form, Input, Row, Select } from 'antd';
import styles from './styles.module.scss';
import { IoChevronBackSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import BtnPrincipal from '../../components/geral/BtnPrincipal';
import { UsuarioDTO } from '../../dto/UsuarioDTO';
import BtnSecundario from '../../components/geral/BtnSecundario';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const BackIcon = IoChevronBackSharp as unknown as SVGIcon;

export default function Usuario() {
    const navigate = useNavigate();
    const [formUsuario] = Form.useForm();

    // useState para mockar os dados do usuário
    const [dadosUsuario, setDadosUsuario] = useState<UsuarioDTO>({
        id: 1,
        email: '1guilhermesr1@email.com',
        nome: 'Guilherme Saldanha Ribeiro',
        dataNascimento: '21/01/2004',
        cpf: '123.456.789-10',  
        estadoId: 1,
        senha:''
    });

    // Lista de estados para o dropdown
    const estados = [
        { value: 1, label: 'Goiás' },
        { value: 2, label: 'São Paulo' },
        { value: 3, label: 'Santa Catarina' },
    ];

    // useEffect para definir os valores iniciais do formulário
    useEffect(() => {
        formUsuario.setFieldsValue({
            email: dadosUsuario.email,
            nome: dadosUsuario.nome,
            dataNascimento: dayjs(dadosUsuario.dataNascimento, 'DD/MM/YYYY'),
            cpf: dadosUsuario.cpf,
            estadoId: dadosUsuario.estadoId
        });
    }, [dadosUsuario, formUsuario]);

    function voltar() {
        navigate('/home');
    }

    // Função para salvar as alterações (apenas estado pode ser alterado)
    function salvarAlteracoes(values: any) {
        const dadosAtualizados = {
            ...dadosUsuario,
            estadoId: values.estadoId
        };
        setDadosUsuario(dadosAtualizados);
        console.log('Estado atualizado:', dadosAtualizados);
        // Aqui você pode adicionar a lógica para enviar os dados para o backend
    }

    // Função para excluir conta
    function excluirConta() {
        console.log('Excluindo conta do usuário:', dadosUsuario.email);
        // Aqui você pode adicionar a lógica para excluir a conta
    }

    return (
        <div className={styles.main}>
            <div className={styles.container}>
                <Row style={{  height: '8%' }}>
                    <Col className={styles.header} span={24}>
                        <BackIcon onClick={voltar} className={styles.backIcon} />
                        <span>Dados Pessoais</span>
                    </Col>
                </Row>

                <Form
                    form={formUsuario}
                    name="basic"
                    initialValues={{ remember: true }}
                    onFinish={salvarAlteracoes}
                    autoComplete="off"
                    style={{height:'92%'}}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: '3rem' }}>
                        <Row justify="center">
                            <Col span={15}>
                                <Form.Item<UsuarioDTO["email"]>
                                    name="email"
                                    rules={[{ required: false, message: 'Por favor, preencha seu email corretamente!', type: 'email' }]}
                                    style={{ marginBottom: '0px' }}
                                >
                                    <Input size="large" placeholder="Email@" variant="underlined" disabled />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row justify="center">
                            <Col span={15}>
                                <Form.Item<UsuarioDTO["nome"]>
                                    name="nome"
                                    rules={[{ required: true, message: 'Por Favor, preencha o seu nome!' }]}
                                    style={{ marginBottom: '0px' }}
                                >
                                    <Input size="large" placeholder="Nome Completo" variant="underlined" disabled />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row justify="center">
                            <Col span={15}>
                                <Form.Item<UsuarioDTO["dataNascimento"]>
                                    name="dataNascimento"
                                    rules={[{ required: true, message: 'Por Favor, preencha sua data de nascimento!' }]}
                                    style={{ marginBottom: '0px' }}
                                >
                                    <DatePicker format="DD/MM/YYYY" size='large' style={{ width: '100%' }} placeholder="Data de Nascimento" variant="underlined" disabled />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row justify="center">
                            <Col span={15}>
                                <Form.Item<UsuarioDTO["cpf"]>
                                    name="cpf"
                                    rules={[{ required: true, message: 'Por Favor, preencha seu CPF!', len: 14 }]}
                                    style={{ marginBottom: '0px' }}
                                >
                                    <Input size="large" placeholder="CPF" variant="underlined" disabled />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row justify="center">
                            <Col span={15}>
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
                                        options={estados}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row justify="center">
                            <Col span={15}>
                                <Flex gap="middle" vertical={false} style={{ gap: '16px' }}>
                                    <BtnSecundario onClick={excluirConta} label='Excluir a conta' size='middle' />
                                    <BtnPrincipal onClick={() => formUsuario.submit()} label='Salvar Alterações' size='middle' />
                                </Flex>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </div>
        </div>
    )
}