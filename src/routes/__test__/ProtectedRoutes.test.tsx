import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../context/AuthContext', () => {
    const useAuth = jest.fn();
    return { __esModule: true, useAuth };
});

jest.mock('../../services/api', () => {
    const tokenManager = { hasToken: jest.fn() };
    return { __esModule: true, tokenManager };
});

jest.mock('../../components/geral/Loading', () => ({
    __esModule: true,
    default: () => <div data-testid="loading">Loading...</div>,
}));

import ProtectedRoute from '../ProtectedRoutes';
import { useAuth } from '../../context/AuthContext';
import { tokenManager } from '../../services/api';

describe('ProtectedRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function renderWithRoutes(ui: React.ReactElement) {
        return render(
            <MemoryRouter initialEntries={['/home']}>
                <Routes>
                    <Route
                        path="/home"
                        element={<ProtectedRoute>{ui}</ProtectedRoute>}
                    />
                    <Route path="/login" element={<div>LoginPage</div>} />
                </Routes>
            </MemoryRouter>
        );
    }

    it('quando loading=true e token existe: renderiza children (não mostra loading)', () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: null,
            loading: true,
            isAuthenticated: false,
            syncAuth: jest.fn(),
        });
        (tokenManager.hasToken as jest.Mock).mockReturnValue(true);

        renderWithRoutes(<div>Privado</div>);

        expect(screen.getByText('Privado')).toBeInTheDocument();
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.queryByText('LoginPage')).not.toBeInTheDocument();
    });

    it('quando loading=true e NÃO há token: mostra Loading', () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: null,
            loading: true,
            isAuthenticated: false,
            syncAuth: jest.fn(),
        });
        (tokenManager.hasToken as jest.Mock).mockReturnValue(false);

        renderWithRoutes(<div>Privado</div>);

        expect(screen.getByTestId('loading')).toBeInTheDocument();
        expect(screen.queryByText('Privado')).not.toBeInTheDocument();
    });

    it('quando loading=false e não autenticado: redireciona para /login', () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: null,
            loading: false,
            isAuthenticated: false,
            syncAuth: jest.fn(),
        });
        (tokenManager.hasToken as jest.Mock).mockReturnValue(false);

        renderWithRoutes(<div>Privado</div>);

        expect(screen.getByText('LoginPage')).toBeInTheDocument();
        expect(screen.queryByText('Privado')).not.toBeInTheDocument();
    });

    it('quando autenticado: renderiza children', () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, nome: 'Alice' },
            loading: false,
            isAuthenticated: true,
            syncAuth: jest.fn(),
        });
        (tokenManager.hasToken as jest.Mock).mockReturnValue(true);

        renderWithRoutes(<div>Privado</div>);

        expect(screen.getByText('Privado')).toBeInTheDocument();
        expect(screen.queryByText('LoginPage')).not.toBeInTheDocument();
    });
});
