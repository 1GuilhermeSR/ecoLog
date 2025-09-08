import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../services/usuario/usuarioService', () => ({
    __esModule: true,
    default: {
        getCurrentUser: jest.fn(),
        isAuthenticated: jest.fn(),
        validateToken: jest.fn(),
        refreshToken: jest.fn(),
        logout: jest.fn(),
    },
}));

import userService from '../../services/usuario/usuarioService';
import { AuthProvider, useAuth } from '../AuthContext';

type MockedUserService = jest.Mocked<typeof userService>;

const Probe = () => {
    const { user, loading, isAuthenticated, syncAuth } = useAuth();
    return (
        <div>
            <div data-testid="loading">{String(loading)}</div>
            <div data-testid="isAuth">{String(isAuthenticated)}</div>
            <div data-testid="user">{user ? user.nome : 'null'}</div>
            <button onClick={syncAuth}>sync</button>
        </div>
    );
};

const renderWithProvider = () =>
    render(
        <AuthProvider>
            <Probe />
        </AuthProvider>
    );

beforeEach(() => {
    jest.clearAllMocks();
});

describe('AuthProvider / AuthContext', () => {
    it('storedUser + token válido → seta user e finaliza loading=false', async () => {
        (userService.getCurrentUser as MockedUserService['getCurrentUser']).mockReturnValue({ id: 1, nome: 'Alice' } as any);
        (userService.isAuthenticated as MockedUserService['isAuthenticated']).mockReturnValue(true);
        (userService.validateToken as MockedUserService['validateToken']).mockResolvedValue(true);

        renderWithProvider();

        expect(screen.getByTestId('loading')).toHaveTextContent('true');

        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
        expect(screen.getByTestId('user')).toHaveTextContent('Alice');
        expect(screen.getByTestId('isAuth')).toHaveTextContent('true');

        expect(userService.refreshToken).not.toHaveBeenCalled();
        expect(userService.logout).not.toHaveBeenCalled();
    });

    it('storedUser + token inválido → tenta refresh: sucesso mantém user', async () => {
        (userService.getCurrentUser as any).mockReturnValue({ id: 2, nome: 'Bob' });
        (userService.isAuthenticated as any).mockReturnValue(true);
        (userService.validateToken as any).mockResolvedValue(false);
        (userService.refreshToken as any).mockResolvedValue(true);

        renderWithProvider();

        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
        expect(screen.getByTestId('user')).toHaveTextContent('Bob');
        expect(screen.getByTestId('isAuth')).toHaveTextContent('true');

        expect(userService.refreshToken).toHaveBeenCalled();
        expect(userService.logout).not.toHaveBeenCalled();
    });

    it('storedUser + token inválido → refresh falha: faz logout e user=null', async () => {
        (userService.getCurrentUser as any).mockReturnValue({ id: 3, nome: 'Carol' });
        (userService.isAuthenticated as any).mockReturnValue(true);
        (userService.validateToken as any).mockResolvedValue(false);
        (userService.refreshToken as any).mockResolvedValue(false);

        renderWithProvider();

        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
        expect(userService.logout).toHaveBeenCalled();
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuth')).toHaveTextContent('false');
    });

    it('storedUser + sem token → tenta refresh: sucesso mantém user', async () => {
        (userService.getCurrentUser as any).mockReturnValue({ id: 4, nome: 'Dora' });
        (userService.isAuthenticated as any).mockReturnValue(false);
        (userService.refreshToken as any).mockResolvedValue(true);

        renderWithProvider();

        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
        expect(screen.getByTestId('user')).toHaveTextContent('Dora');
        expect(screen.getByTestId('isAuth')).toHaveTextContent('true');

        expect(userService.validateToken).not.toHaveBeenCalled();
        expect(userService.logout).not.toHaveBeenCalled();
    });

    it('storedUser + sem token → refresh falha: faz logout e user=null', async () => {
        (userService.getCurrentUser as any).mockReturnValue({ id: 5, nome: 'Erin' });
        (userService.isAuthenticated as any).mockReturnValue(false);
        (userService.refreshToken as any).mockResolvedValue(false);

        renderWithProvider();

        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
        expect(userService.logout).toHaveBeenCalled();
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuth')).toHaveTextContent('false');
    });

    it('sem storedUser → user=null, loading=false', async () => {
        (userService.getCurrentUser as any).mockReturnValue(null);

        renderWithProvider();

        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuth')).toHaveTextContent('false');

        expect(userService.validateToken).not.toHaveBeenCalled();
        expect(userService.refreshToken).not.toHaveBeenCalled();
        expect(userService.logout).not.toHaveBeenCalled();
    });

    it('erro inesperado no checkAuth → captura erro, zera user e loading=false', async () => {
        const errSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        (userService.getCurrentUser as any).mockImplementation(() => { throw new Error('boom'); });

        renderWithProvider();

        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuth')).toHaveTextContent('false');

        errSpy.mockRestore();
    });

    it('syncAuth dispara novo checkAuth e atualiza estado', async () => {
        (userService.getCurrentUser as any).mockReturnValueOnce(null);

        renderWithProvider();
        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
        expect(screen.getByTestId('user')).toHaveTextContent('null');

        (userService.getCurrentUser as any).mockReturnValueOnce({ id: 7, nome: 'Zoe' });
        (userService.isAuthenticated as any).mockReturnValueOnce(false);
        (userService.refreshToken as any).mockResolvedValueOnce(true);

        fireEvent.click(screen.getByText('sync'));

        expect(screen.getByTestId('loading')).toHaveTextContent('true');

        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
        expect(screen.getByTestId('user')).toHaveTextContent('Zoe');
        expect(screen.getByTestId('isAuth')).toHaveTextContent('true');
    });
});
