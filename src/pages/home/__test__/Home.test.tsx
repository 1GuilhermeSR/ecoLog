import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../../../tests/utils/test-utils';

jest.mock('../../../assets/dashboardIcon.svg', () => ({
    __esModule: true,
    ReactComponent: (props: any) => <svg data-testid="DashboardIcon" {...props} />,
    default: 'dashboardIcon.svg',
}));
jest.mock('../../../assets/energiaIcon.svg', () => ({
    __esModule: true,
    ReactComponent: (props: any) => <svg data-testid="EnergiaIcon" {...props} />,
    default: 'energiaIcon.svg',
}));
jest.mock('../../../assets/combustivelIcon.svg', () => ({
    __esModule: true,
    ReactComponent: (props: any) => <svg data-testid="CombustivelIcon" {...props} />,
    default: 'combustivelIcon.svg',
}));

import '../../../tests/mocks/router';

import Home from '../Home';

const { mockNavigate } = require('../../../tests/mocks/router');

describe('Home', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renderiza os três cards com os textos esperados', () => {
        renderWithRouter(<Home />, { route: '/home' });

        expect(screen.getByText('Minhas Emissões')).toBeInTheDocument();
        expect(screen.getByText('Calcular Emissão Por Energia')).toBeInTheDocument();
        expect(screen.getByText('Calcular Emissão Por Combustivel')).toBeInTheDocument();

        expect(screen.getByTestId('DashboardIcon')).toBeInTheDocument();
        expect(screen.getByTestId('EnergiaIcon')).toBeInTheDocument();
        expect(screen.getByTestId('CombustivelIcon')).toBeInTheDocument();
    });

    it('ao clicar em "Minhas Emissões" navega para /minhasEmissoes', () => {
        renderWithRouter(<Home />, { route: '/home' });

        fireEvent.click(screen.getByText('Minhas Emissões'));

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/minhasEmissoes');
    });

    it('ao clicar em "Calcular Emissão Por Energia" navega para /emissaoEnergia', () => {
        renderWithRouter(<Home />, { route: '/home' });

        fireEvent.click(screen.getByText('Calcular Emissão Por Energia'));

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/emissaoEnergia');
    });

    it('ao clicar em "Calcular Emissão Por Combustivel" navega para /emissaoCombustivel', () => {
        renderWithRouter(<Home />, { route: '/home' });

        fireEvent.click(screen.getByText('Calcular Emissão Por Combustivel'));

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/emissaoCombustivel');
    });
});
