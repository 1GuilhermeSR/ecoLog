import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../tests/utils/test-utils';
import AppLayout from '../AppLayout';

jest.mock('../../services/usuario/usuarioService', () => ({
    __esModule: true,
    default: {
        getCurrentUser: jest.fn(),
        logout: jest.fn(),
    },
}));
const userService = require('../../services/usuario/usuarioService').default;

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        useNavigate: jest.fn(),
    };
});
const mockedUseNavigate = require('react-router-dom').useNavigate as jest.Mock;

jest.mock('antd', () => {
    const real = jest.requireActual('antd');

    const Menu = ({ items, onClick }: any) => (
        <ul data-testid="perfil-menu">
            {items?.map((it: any) => (
                <li key={it.key}>
                    <button onClick={() => onClick?.({ key: it.key })}>{it.label}</button>
                </li>
            ))}
        </ul>
    );

    const Dropdown = ({ overlay, children }: any) => (
        <div data-testid="dropdown">
            <div>{children}</div>
            <div>{overlay}</div>
        </div>
    );

    return {
        ...real,
        Menu,
        Dropdown,
        message: {
            ...real.message,
            success: jest.fn(),
        },
    };
});
import { message } from 'antd';

describe('AppLayout', () => {
    let navigateSpy: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        navigateSpy = jest.fn();
        mockedUseNavigate.mockReturnValue(navigateSpy);
    });

    it('mostra o nome do usuário quando logado', async () => {
        userService.getCurrentUser.mockReturnValue({ nome: 'Guilherme' });

        renderWithRouter(<AppLayout />);

        expect(await screen.findByText('Guilherme')).toBeInTheDocument();
    });

    it('mostra "Usuário" quando não há usuário logado', async () => {
        userService.getCurrentUser.mockReturnValue(null);

        renderWithRouter(<AppLayout />);

        expect(await screen.findByText('Usuário')).toBeInTheDocument();
    });

    it('clicar no logo chama navigate("/home")', async () => {
        userService.getCurrentUser.mockReturnValue({ nome: 'Teste' });

        renderWithRouter(<AppLayout />);

        const logo = screen.getByAltText('Logo');
        fireEvent.click(logo);

        await waitFor(() => {
            expect(navigateSpy).toHaveBeenCalledWith('/home');
        });
    });

    it('menu "Meu perfil" chama navigate("/usuario")', async () => {
        userService.getCurrentUser.mockReturnValue({ nome: 'Teste' });

        renderWithRouter(<AppLayout />);

        const btn = screen.getByRole('button', { name: /Teste/ });
        fireEvent.click(btn);

        const meuPerfil = await screen.findByRole('button', { name: 'Meu perfil' });
        fireEvent.click(meuPerfil);

        await waitFor(() => {
            expect(navigateSpy).toHaveBeenCalledWith('/usuario');
        });
    });

    it('menu "Sair" faz logout, mostra mensagem e chama navigate("/login")', async () => {
        userService.getCurrentUser.mockReturnValue({ nome: 'Teste' });

        renderWithRouter(<AppLayout />);

        const btn = screen.getByRole('button', { name: /Teste/ });
        fireEvent.click(btn);

        const sair = await screen.findByRole('button', { name: 'Sair' });
        fireEvent.click(sair);

        await waitFor(() => {
            expect(userService.logout).toHaveBeenCalled();
            expect(message.success).toHaveBeenCalledWith('Logout realizado com sucesso!');
            expect(navigateSpy).toHaveBeenCalledWith('/login');
        });
    });
});
