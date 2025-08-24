import { Col, DatePicker, Flex, Form, Input, message, Modal, Row, Select } from 'antd';
import styles from './styles.module.scss';
import { IoChevronBackSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import BtnPrincipal from '../../components/geral/BtnPrincipal';
import { UsuarioDTO } from '../../dto/usuario/UsuarioDTO';
import BtnSecundario from '../../components/geral/BtnSecundario';
import { useState, useEffect, useMemo, createContext } from 'react';
import userService from '../../services/usuario/usuarioService';
import dayjs from 'dayjs';
import estadoService from '../../services/estado/estadoService';
import Loading from '../../components/geral/Loading';

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const BackIcon = IoChevronBackSharp as unknown as SVGIcon;

const ReachableContext = createContext<string | null>(null);
const UnreachableContext = createContext<string | null>(null);
const config = {
    title: 'Deletar usuario?',
    content: (
        <>
            <ReachableContext.Consumer>{(name) => `Essa ação é irreversível!`}</ReachableContext.Consumer>
            <br />
            <UnreachableContext.Consumer>{(name) => `Todas as suas emissões serão apagadas no processo!`}</UnreachableContext.Consumer>
        </>
    ),
};

export default function Usuario() {
    const navigate = useNavigate();
    const [formUsuario] = Form.useForm();
    const dados = userService.getCurrentUser();
    const [estados, setEstados] = useState<any[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [modal, contextHolderModal] = Modal.useModal();
    const [loading, setLoading] = useState(false);


    const initialValues = useMemo(() => {
        if (!dados) return {};

        return {
            email: dados.email ?? '',
            nome: dados.nome ?? '',
            dataNascimento: dayjs(dados.dataNascimento, 'DD/MM/YYYY'),
            cpf: (dados.cpf ?? '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
            estadoId: dados.estadoId ?? undefined,
        };
    }, [dados]);

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

    function voltar() {
        navigate('/home');
    }

    async function salvarAlteracoes(values: UsuarioDTO) {

        try {
            setLoading(true);
            const selecionado = estados.find(e => e.value === values.estadoId);
            const payload = {
                ...dados,
                estadoId: selecionado.value!,
                estadoNome: selecionado.label ?? ''
            };

            const response = await userService.editarEstado(payload);

            if (response.success) {
                messageApi.open({ type: 'success', content: 'Estado atualizado com sucesso!' });
                formUsuario.setFieldsValue({
                    estadoId: response.data.estadoId
                });
            } else {
                messageApi.open({ type: 'error', content: response.message });
            }

        } catch (error: any) {
            messageApi.open({ type: 'error', content: error.message || 'Erro ao atualizar estado' });
        } finally {
            setLoading(false);
        }

    }

    async function excluirConta() {
        try {
            setLoading(true);
            const response = await userService.excluirConta();            
            if (response.success) {
                messageApi.open({ type: 'success', content: 'Conta excluída com sucesso!' });
                navigate('/login', { replace: true });
            } else {
                messageApi.open({ type: 'error', content: response.message || 'Erro ao excluir conta' });
            }
        } catch (error: any) {
            messageApi.open({ type: 'error', content: error.message || 'Erro ao excluir conta' });
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className={styles.main}>
            <div className={styles.container}>
                {contextHolder}
                {contextHolderModal}
                {loading && (<Loading />)}
                <Row style={{ height: '8%' }}>
                    <Col className={styles.header} span={24}>
                        <BackIcon onClick={voltar} className={styles.backIcon} />
                        <span>Dados Pessoais</span>
                    </Col>
                </Row>

                <Form
                    key={dados?.id ?? 'blank'}
                    form={formUsuario}
                    name="basic"
                    initialValues={initialValues}
                    onFinish={salvarAlteracoes}
                    autoComplete="off"
                    style={{ height: '92%' }}
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
                                    <BtnSecundario onClick={async () => {
                                        const confirmed = await modal.confirm(config);
                                        if (confirmed)
                                            excluirConta();
                                    }} label='Excluir a conta' size='middle' />
                                    <BtnPrincipal onClick={() => formUsuario.submit()} htmlType='button' label='Salvar Alterações' size='middle' />
                                </Flex>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </div>
        </div>
    )
}