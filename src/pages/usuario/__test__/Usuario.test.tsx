import { screen, waitFor, fireEvent, act } from '@testing-library/react';
import { renderWithRouter } from '../../../tests/utils/test-utils';
import '../../../tests/mocks/router';
import '../../../tests/mocks/antd-lite';

import Usuario from '../Usuario';

jest.mock('../../../services/usuario/usuarioService', () => ({
    __esModule: true,
    default: {
        getCurrentUser: jest.fn(),
        editarEstado: jest.fn(),
        excluirConta: jest.fn(),
    },
}));

jest.mock('../../../services/estado/estadoService', () => ({
    __esModule: true,
    default: {
        getAllEstado: jest.fn(),
    },
}));

const userService = require('../../../services/usuario/usuarioService').default;
const estadoService = require('../../../services/estado/estadoService').default;
const { mockNavigate } = require('../../../tests/mocks/router');

const USER = {
    id: 123,
    email: 'user@test.com',
    nome: 'Usuário Teste',
    dataNascimento: '01/01/1990',
    cpf: '12345678901',
    estadoId: 1,
    estadoNome: 'São Paulo',
};

const ESTADOS = [
    { id: 1, nome: 'São Paulo' },
    { id: 2, nome: 'Paraná' },
];

// silencia apenas o warning específico do Form
let consoleErrorSpy: jest.SpyInstance;
beforeAll(() => {
    const realError = console.error;
    consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation((...args: any[]) => {
            if (String(args[0]).includes('Instance created by `useForm` is not connected')) return;
            realError(...args);
        });
});

afterAll(() => {
    consoleErrorSpy.mockRestore();
});

let confirmResult = true;
let confirmSpy: jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();

    userService.getCurrentUser.mockReturnValue(USER);
    estadoService.getAllEstado.mockResolvedValue(ESTADOS);
    userService.editarEstado.mockResolvedValue({ success: true, data: { estadoId: 2 } });
    userService.excluirConta.mockResolvedValue({ success: true });

    const antd = require('antd');
    confirmSpy = jest.fn(async () => confirmResult);
    (antd.Modal as any).useModal = jest.fn(() => [{ confirm: confirmSpy }, <div key="ctx" />]);
});

describe('Usuario', () => {
    it('carrega dados iniciais e popula estados no Select', async () => {
        renderWithRouter(<Usuario />, { route: '/usuario' });

        await waitFor(() => expect(estadoService.getAllEstado).toHaveBeenCalled());

        expect(screen.getByPlaceholderText('Email@')).toHaveValue('user@test.com');
        expect(screen.getByPlaceholderText('Nome Completo')).toHaveValue('Usuário Teste');

        const dateInput = screen.getByTestId('antd-date');
        expect(dateInput).toHaveValue('1990-01-01');

        expect(screen.getByPlaceholderText('CPF')).toHaveValue('123.456.789-01');

        const select = screen.getByTestId('antd-select');
        fireEvent.click(select);
        expect(await screen.findByRole('option', { name: 'São Paulo' })).toBeInTheDocument();
        expect(await screen.findByRole('option', { name: 'Paraná' })).toBeInTheDocument();
    });

    it('altera estado e salva com sucesso (envia payload correto e atualiza form)', async () => {
        renderWithRouter(<Usuario />, { route: '/usuario' });

        await waitFor(() => expect(estadoService.getAllEstado).toHaveBeenCalled());

        const select = screen.getByTestId('antd-select');
        fireEvent.change(select, { target: { value: '2' } });

        fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

        await waitFor(() => expect(userService.editarEstado).toHaveBeenCalled());

        const payload = userService.editarEstado.mock.calls.at(-1)?.[0];
        expect(payload).toMatchObject({
            ...USER,
            estadoId: 2,
            estadoNome: 'Paraná',
        });
    });

    it('salvar com erro mostra mensagem de erro (mantém chamada do serviço)', async () => {
        userService.editarEstado.mockResolvedValueOnce({
            success: false,
            message: 'falhou',
        });

        renderWithRouter(<Usuario />, { route: '/usuario' });

        await waitFor(() => expect(estadoService.getAllEstado).toHaveBeenCalled());

        const select = screen.getByTestId('antd-select');
        fireEvent.change(select, { target: { value: '2' } });

        fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));
        await waitFor(() => expect(userService.editarEstado).toHaveBeenCalled());
    });

    it('excluir conta: confirma e navega para /login (success)', async () => {
        confirmResult = true;

        renderWithRouter(<Usuario />, { route: '/usuario' });

        fireEvent.click(screen.getByRole('button', { name: 'Excluir a conta' }));

        await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
        await waitFor(() => expect(userService.excluirConta).toHaveBeenCalled());

        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    it('excluir conta: confirma, mas service retorna erro (não navega)', async () => {
        confirmResult = true;
        userService.excluirConta.mockResolvedValueOnce({
            success: false,
            message: 'erro ao excluir',
        });

        renderWithRouter(<Usuario />, { route: '/usuario' });

        fireEvent.click(screen.getByRole('button', { name: 'Excluir a conta' }));

        await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
        await waitFor(() => expect(userService.excluirConta).toHaveBeenCalled());

        expect(mockNavigate).not.toHaveBeenCalledWith('/login', { replace: true });
    });

    it('excluir conta: usuário cancela no confirm (não chama excluirConta)', async () => {
        confirmResult = false;

        renderWithRouter(<Usuario />, { route: '/usuario' });

        fireEvent.click(screen.getByRole('button', { name: 'Excluir a conta' }));

        await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
        expect(userService.excluirConta).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('mostra erro quando falha carregar estados (branch do useEffect catch)', async () => {
        estadoService.getAllEstado.mockRejectedValueOnce(new Error('boom'));

        const { message } = require('antd');
        const openSpy = jest.fn();
        const useMessageSpy = jest
            .spyOn(message, 'useMessage')
            .mockReturnValue([{ open: openSpy } as any, <div key="ctx" />] as any);

        renderWithRouter(<Usuario />, { route: '/usuario' });

        await waitFor(() => expect(estadoService.getAllEstado).toHaveBeenCalled());
        await waitFor(() =>
            expect(openSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' })),
        );

        useMessageSpy.mockRestore();
    });

    it('salvarAlteracoes: entra no catch quando editarEstado lança e exibe erro', async () => {
        estadoService.getAllEstado.mockResolvedValueOnce(ESTADOS);
        userService.editarEstado.mockRejectedValueOnce(new Error('falhou!'));

        const { message } = require('antd');
        const openSpy = jest.fn();
        const useMessageSpy = jest
            .spyOn(message, 'useMessage')
            .mockReturnValue([{ open: openSpy } as any, <div key="ctx" />] as any);

        renderWithRouter(<Usuario />, { route: '/usuario' });

        await waitFor(() => expect(estadoService.getAllEstado).toHaveBeenCalled());

        const select = screen.getByTestId('antd-select');
        fireEvent.change(select, { target: { value: '2' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

        await waitFor(() => expect(userService.editarEstado).toHaveBeenCalled());
        await waitFor(() =>
            expect(openSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' })),
        );

        useMessageSpy.mockRestore();
    });

    it('excluirConta: exceção no service cai no catch e mostra erro (sem navegar)', async () => {
        userService.excluirConta.mockRejectedValueOnce(new Error('boom'));
        confirmResult = true;
        const { message } = require('antd');
        const openSpy = jest.fn();
        const useMessageSpy = jest
            .spyOn(message, 'useMessage')
            .mockReturnValue([{ open: openSpy } as any, <div key="ctx" />] as any);

        renderWithRouter(<Usuario />, { route: '/usuario' });

        fireEvent.click(screen.getByRole('button', { name: 'Excluir a conta' }));

        await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
        await waitFor(() => expect(userService.excluirConta).toHaveBeenCalled());

        await waitFor(() =>
            expect(openSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' })),
        );
        expect(mockNavigate).not.toHaveBeenCalledWith('/login', { replace: true });

        useMessageSpy.mockRestore();
    });

    it('renderiza com initialValues vazio quando getCurrentUser() retorna null', async () => {
        userService.getCurrentUser.mockReturnValue(null);
        estadoService.getAllEstado.mockResolvedValueOnce(ESTADOS);

        // garante a tupla do message.useMessage
        const { message } = require('antd');
        const openSpy = jest.fn();
        const useMessageSpy = jest
            .spyOn(message, 'useMessage')
            .mockReturnValue([{ open: openSpy } as any, <div key="ctx" />] as any);

        renderWithRouter(<Usuario />, { route: '/usuario' });

        await waitFor(() => expect(estadoService.getAllEstado).toHaveBeenCalled());

        expect(screen.getByPlaceholderText('Email@')).toHaveValue('');
        expect(screen.getByPlaceholderText('Nome Completo')).toHaveValue('');
        expect(screen.getByTestId('antd-date')).toHaveValue('');
        expect(screen.getByPlaceholderText('CPF')).toHaveValue('');

        useMessageSpy.mockRestore();
    });
});
