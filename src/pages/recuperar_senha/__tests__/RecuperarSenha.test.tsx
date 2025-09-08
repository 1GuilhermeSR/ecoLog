import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderWithRouter } from '../../../tests/utils/test-utils';
import '../../../tests/mocks/router';
import '../../../tests/mocks/auth';
import '../../../tests/mocks/services';
import '../../../tests/mocks/antd-lite';
import RecuperarSenha from '../RecuperarSenha';
import { mockUserService } from '../../../tests/mocks/services';
import { mockNavigate } from '../../../tests/mocks/router';
import { Modal } from 'antd';

describe('RecuperarSenha page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('exibe alerta de link inválido quando faltam query params', () => {
        renderWithRouter(<RecuperarSenha />, { route: '/recuperar_senha' });

        expect(screen.getByText('Link inválido')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Voltar ao login' })).toBeInTheDocument();
    });

    it('redefine senha com sucesso e navega após countdown', async () => {
        jest.useFakeTimers();
        mockUserService.resetPassword.mockResolvedValue({ success: true });

        const useModalSpy = jest.spyOn(Modal, 'useModal').mockImplementation(() => {
            const instance: any = {
                update: jest.fn(),
                destroy: jest.fn(function (this: any) {
                    (this as any).__afterClose?.();
                }),
            };

            const api: any = {
                success: (opts: any) => {
                    (instance as any).__afterClose = opts?.afterClose;
                    return instance;
                },
            };

            return [api, <div key="modal-context" /> as any];
        });

        renderWithRouter(<RecuperarSenha />, {
            route: '/recuperar_senha?token=abc123&email=user%40eco.com',
        });

        fireEvent.change(screen.getByPlaceholderText('Nova senha'), { target: { value: 'Abc@12345' } });
        fireEvent.change(screen.getByPlaceholderText('Confirmar senha'), { target: { value: 'Abc@12345' } });
        fireEvent.click(screen.getByRole('button', { name: 'Alterar Senha' }));

        await waitFor(() =>
            expect(mockUserService.resetPassword).toHaveBeenCalledWith({
                email: 'user@eco.com',
                token: 'abc123',
                novaSenha: 'Abc@12345',
                confirmarSenha: 'Abc@12345',
            })
        );

        await act(async () => {
            jest.advanceTimersByTime(5000);
        });

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true }));

        useModalSpy.mockRestore();
        jest.useRealTimers();
    });

    it('valida senhas diferentes', async () => {
        renderWithRouter(<RecuperarSenha />, {
            route: '/recuperar_senha?token=abc123&email=user%40eco.com',
        });

        fireEvent.change(screen.getByPlaceholderText('Nova senha'), { target: { value: 'Abc@12345' } });
        fireEvent.change(screen.getByPlaceholderText('Confirmar senha'), { target: { value: 'outraSenha' } });
        fireEvent.click(screen.getByRole('button', { name: 'Alterar Senha' }));

        await waitFor(() => expect(mockUserService.resetPassword).not.toHaveBeenCalled());
    });
});
