import { screen, waitFor, fireEvent, within } from '@testing-library/react';
import { renderWithRouter } from '../../../tests/utils/test-utils';
import '../../../tests/mocks/router';
import '../../../tests/mocks/auth';
import '../../../tests/mocks/services';
import '../../../tests/mocks/antd-lite';
import Login from '../Login';
import { mockUserService, mockEstadoService } from '../../../tests/mocks/services';
import { mockNavigate } from '../../../tests/mocks/router';
import * as antd from 'antd';

describe('Login page', () => {
    let useMessageSpy: jest.SpyInstance;
    let messageOpenSpy: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockEstadoService.getAllEstado.mockResolvedValue([{ id: 1, nome: 'São Paulo' }]);

        messageOpenSpy = jest.fn();
        useMessageSpy = jest
            .spyOn(antd.message, 'useMessage')
            .mockReturnValue([{ open: messageOpenSpy } as any, <div key="ctx" />] as any);
    });

    afterEach(() => {
        useMessageSpy?.mockRestore();
    });

    it('faz login com sucesso (opção 1)', async () => {
        mockUserService.login.mockResolvedValue({ success: true });

        renderWithRouter(<Login />, { route: '/login' });

        fireEvent.change(screen.getByPlaceholderText('Email@'), { target: { value: 'user@eco.com' } });
        fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });

        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(mockUserService.login).toHaveBeenCalledWith({ email: 'user@eco.com', senha: '123456' });
            expect(mockNavigate).toHaveBeenCalledWith('/home');
        });
    });

    it('fluxo de cadastro: passo 2 -> passo 3 -> register com transformação de dados', async () => {
        mockUserService.register.mockResolvedValue({ success: true });

        renderWithRouter(<Login />, { route: '/login' });

        fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

        await waitFor(() => expect(mockEstadoService.getAllEstado).toHaveBeenCalled());

        fireEvent.change(screen.getByPlaceholderText('Nome Completo'), { target: { value: 'Fulano de Tal' } });
        fireEvent.change(screen.getByLabelText('Data de Nascimento'), { target: { value: '2020-01-01' } }); 
        fireEvent.change(screen.getByPlaceholderText('CPF'), { target: { value: '870.344.640-90' } });

        const select = screen.getByTestId('antd-select');
        fireEvent.change(select, { target: { value: '1' } });

        fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));

        const emailStep3 = await screen.findByPlaceholderText('Email@');
        fireEvent.change(emailStep3, { target: { value: 'user@eco.com' } });
        fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'Abc@12345' } });

        fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

        await waitFor(() => {
            expect(mockUserService.register).toHaveBeenCalledWith({
                nome: 'Fulano de Tal',
                cpf: '87034464090',
                email: 'user@eco.com',
                senha: 'Abc@12345',
                dataNascimento: '01/01/2020',
                estadoId: 1,
            });
            expect(mockNavigate).toHaveBeenCalledWith('/home');
        });
    });

    it('esqueci a senha: abre modal e envia email', async () => {
        mockUserService.forgotPassword.mockResolvedValue({ success: true });

        renderWithRouter(<Login />, { route: '/login' });

        fireEvent.click(screen.getByText('Esqueceu a senha?'));

        const dialog = await screen.findByRole('dialog');
        const modal = within(dialog);

        fireEvent.change(modal.getByPlaceholderText('Email@'), { target: { value: 'user@eco.com' } });
        fireEvent.click(modal.getByRole('button', { name: 'Enviar' }));

        await waitFor(() => {
            expect(mockUserService.forgotPassword).toHaveBeenCalledWith('user@eco.com');
        });
    });

    it('exibe aviso quando o login falha (credenciais inválidas) e não navega', async () => {
        mockUserService.login.mockResolvedValue({
            success: false,
            message: 'Credenciais inválidas',
        });

        renderWithRouter(<Login />, { route: '/login' });

        fireEvent.change(screen.getByPlaceholderText('Email@'), { target: { value: 'wrong@eco.com' } });
        fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'senha-errada' } });
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(mockUserService.login).toHaveBeenCalledWith({ email: 'wrong@eco.com', senha: 'senha-errada' });
            expect(messageOpenSpy).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'warning', content: 'Credenciais inválidas' })
            );
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('exibe aviso quando o cadastro falha e não navega', async () => {
        mockUserService.register.mockResolvedValue({
            success: false,
            message: 'Erro de cadastro',
        });

        renderWithRouter(<Login />, { route: '/login' });

        fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

        await waitFor(() => expect(mockEstadoService.getAllEstado).toHaveBeenCalled());

        fireEvent.change(screen.getByPlaceholderText('Nome Completo'), { target: { value: 'Fulano de Tal' } });
        fireEvent.change(screen.getByLabelText('Data de Nascimento'), { target: { value: '2020-01-01' } });
        fireEvent.change(screen.getByPlaceholderText('CPF'), { target: { value: '870.344.640-90' } });
        fireEvent.change(screen.getByTestId('antd-select'), { target: { value: '1' } });

        fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));

        const emailStep3 = await screen.findByPlaceholderText('Email@');
        fireEvent.change(emailStep3, { target: { value: 'user@eco.com' } });
        fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'Abc@12345' } });

        fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

        await waitFor(() => {
            expect(mockUserService.register).toHaveBeenCalled();
            expect(messageOpenSpy).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'warning', content: 'Erro de cadastro' })
            );
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('login: exceção (catch) exibe erro e não navega', async () => {
        mockUserService.login.mockRejectedValueOnce(new Error('kaboom'));

        renderWithRouter(<Login />, { route: '/login' });

        fireEvent.change(screen.getByPlaceholderText('Email@'), { target: { value: 'user@eco.com' } });
        fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(mockUserService.login).toHaveBeenCalled();
            expect(antd.message.useMessage).toHaveBeenCalled();
            expect((messageOpenSpy as jest.Mock)).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'error' })
            );
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('cadastro: exceção (catch) exibe erro e não navega', async () => {
        mockUserService.register.mockRejectedValueOnce(new Error('boom'));

        renderWithRouter(<Login />, { route: '/login' });

        fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
        await waitFor(() => expect(mockEstadoService.getAllEstado).toHaveBeenCalled());

        fireEvent.change(screen.getByPlaceholderText('Nome Completo'), { target: { value: 'Fulano' } });
        fireEvent.change(screen.getByLabelText('Data de Nascimento'), { target: { value: '2020-02-02' } });
        fireEvent.change(screen.getByPlaceholderText('CPF'), { target: { value: '870.344.640-90' } });
        fireEvent.change(screen.getByTestId('antd-select'), { target: { value: '1' } });

        fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));

        const emailStep3 = await screen.findByPlaceholderText('Email@');
        fireEvent.change(emailStep3, { target: { value: 'user@eco.com' } });
        fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'Abc@12345' } });

        fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

        await waitFor(() => {
            expect(mockUserService.register).toHaveBeenCalled();
            expect(messageOpenSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('esqueci a senha: success=false exibe erro (branch do else)', async () => {
        mockUserService.forgotPassword.mockResolvedValueOnce({ success: false, message: 'Falhou :(' });

        renderWithRouter(<Login />, { route: '/login' });

        fireEvent.click(screen.getByText('Esqueceu a senha?'));

        const dialog = await screen.findByRole('dialog');
        const modal = within(dialog);

        fireEvent.change(modal.getByPlaceholderText('Email@'), { target: { value: 'user@eco.com' } });
        fireEvent.click(modal.getByRole('button', { name: 'Enviar' }));

        await waitFor(() => {
            expect(mockUserService.forgotPassword).toHaveBeenCalledWith('user@eco.com');
            expect(messageOpenSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
        });
    });

    it('esqueci a senha: exceção (catch) exibe erro e mantém modal aberto', async () => {
        mockUserService.forgotPassword.mockRejectedValueOnce(new Error('err'));

        renderWithRouter(<Login />, { route: '/login' });

        fireEvent.click(screen.getByText('Esqueceu a senha?'));

        const dialog = await screen.findByRole('dialog');
        const modal = within(dialog);

        fireEvent.change(modal.getByPlaceholderText('Email@'), { target: { value: 'user@eco.com' } });
        fireEvent.click(modal.getByRole('button', { name: 'Enviar' }));

        await waitFor(() => {
            expect(messageOpenSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });

    it('onFinishFailed: submit inválido dispara mensagem de erro', async () => {
        renderWithRouter(<Login />, { route: '/login' });

        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() =>
            expect(messageOpenSpy).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'error' })
            )
        );
        expect(mockUserService.login).not.toHaveBeenCalled();
    });

    it('CPF é formatado ao digitar (handleCpfChange)', async () => {
        renderWithRouter(<Login />, { route: '/login' });

        fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
        await waitFor(() => expect(mockEstadoService.getAllEstado).toHaveBeenCalled());

        const cpfInput = screen.getByPlaceholderText('CPF');
        fireEvent.change(cpfInput, { target: { value: '87034464090' } });
        expect(cpfInput).toHaveValue('870.344.640-90'); 
    });

    it('useEffect: falha ao carregar estados dispara toast de erro', async () => {
        mockEstadoService.getAllEstado.mockRejectedValueOnce(new Error('load fail'));

        renderWithRouter(<Login />, { route: '/login' });

        await waitFor(() => {
            expect(mockEstadoService.getAllEstado).toHaveBeenCalled();
            expect(messageOpenSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
        });
    });

    it('voltar: no passo 2 limpa os campos do passo 1 ao retornar', async () => {
        const { container } = renderWithRouter(<Login />, { route: '/login' });

        fireEvent.change(screen.getByPlaceholderText('Email@'), { target: { value: 'a@b.com' } });
        fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123' } });

        fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
        await waitFor(() => expect(mockEstadoService.getAllEstado).toHaveBeenCalled());

        const back = container.querySelector('.backIcon') as HTMLElement;
        expect(back).toBeInTheDocument();
        fireEvent.click(back);

        expect(screen.getByPlaceholderText('Email@')).toHaveValue('');
        expect(screen.getByPlaceholderText('Senha')).toHaveValue('');
    });

    it('modal de recuperação: Cancelar fecha e limpa campo', async () => {
        renderWithRouter(<Login />, { route: '/login' });

        fireEvent.click(screen.getByText('Esqueceu a senha?'));

        const dialog = await screen.findByRole('dialog');
        const modal = within(dialog);

        fireEvent.change(modal.getByPlaceholderText('Email@'), { target: { value: 'user@eco.com' } });
        fireEvent.click(modal.getByRole('button', { name: 'Cancelar' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

        fireEvent.click(screen.getByText('Esqueceu a senha?'));
        const dialog2 = await screen.findByRole('dialog');
        const modal2 = within(dialog2);
        expect(modal2.getByPlaceholderText('Email@')).toHaveValue('');
    });
});
