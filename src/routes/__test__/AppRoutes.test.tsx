import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../ProtectedRoutes', () => ({
    __esModule: true,
    default: ({ children }: any) => <>{children}</>,
}));

jest.mock('../../context/AuthContext', () => ({
    __esModule: true,
    AuthProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock('../../layout/AppLayout', () => ({
    __esModule: true,
    default: () => {
        const { Outlet } = require('react-router-dom');
        return (
            <div data-testid="layout">
                <Outlet />
            </div>
        );
    },
}));

jest.mock('../../pages/login/Login', () => ({
    __esModule: true,
    default: () => <div>Login Page</div>,
}));
jest.mock('../../pages/recuperar_senha/RecuperarSenha', () => ({
    __esModule: true,
    default: () => <div>RecuperarSenha Page</div>,
}));
jest.mock('../../pages/home/Home', () => ({
    __esModule: true,
    default: () => <div>Home Page</div>,
}));
jest.mock('../../pages/minhas_emissoes/Dashboard', () => ({
    __esModule: true,
    default: () => <div>Dashboard Page</div>,
}));
jest.mock('../../pages/emissao_energia/EmissaoEnergia', () => ({
    __esModule: true,
    default: () => <div>EmissaoEnergia Page</div>,
}));
jest.mock('../../pages/emissao_combustivel/EmissaoCombustivel', () => ({
    __esModule: true,
    default: () => <div>EmissaoCombustivel Page</div>,
}));
jest.mock('../../pages/usuario/Usuario', () => ({
    __esModule: true,
    default: () => <div>Usuario Page</div>,
}));

import AppRoutes from '../AppRoutes';

describe('AppRoutes (mapeamento de rotas e redirects)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderAt = (path: string) => {
        window.history.pushState({}, '', path);
        return render(<AppRoutes />);
    };

    it('rota pública /login', async () => {
        renderAt('/login');
        expect(await screen.findByText('Login Page')).toBeInTheDocument();
    });

    it('rota pública /recuperarSenha', async () => {
        renderAt('/recuperarSenha');
        expect(await screen.findByText('RecuperarSenha Page')).toBeInTheDocument();
    });

    it('redirect "*" → /login', async () => {
        renderAt('/rota-inexistente');
        expect(await screen.findByText('Login Page')).toBeInTheDocument();
    });

    it('rotas protegidas: /home', async () => {
        renderAt('/home');
        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(await screen.findByText('Home Page')).toBeInTheDocument();
    });

    it('rotas protegidas: /minhasEmissoes', async () => {
        renderAt('/minhasEmissoes');
        expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
    });

    it('rotas protegidas: /emissaoEnergia', async () => {
        renderAt('/emissaoEnergia');
        expect(await screen.findByText('EmissaoEnergia Page')).toBeInTheDocument();
    });

    it('rotas protegidas: /emissaoCombustivel', async () => {
        renderAt('/emissaoCombustivel');
        expect(await screen.findByText('EmissaoCombustivel Page')).toBeInTheDocument();
    });

    it('rotas protegidas: /usuario', async () => {
        renderAt('/usuario');
        expect(await screen.findByText('Usuario Page')).toBeInTheDocument();
    });

    it('redirect "/" → /home', async () => {
        renderAt('/');
        expect(await screen.findByText('Home Page')).toBeInTheDocument();
    });
});
