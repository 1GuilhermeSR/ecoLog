import React from 'react';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import '../../../tests/mocks/antd-lite';

jest.mock('../../../services/combustivel/combustivelService', () => ({
    __esModule: true,
    default: {
        getAll: jest.fn(),
    },
}));

const combustivelService = require('../../../services/combustivel/combustivelService').default;

import ModalEmissaoCombustivel from '../ModalEmissaoCombustivel';

const COMBUSTIVEIS = [
    { id: 1, nome: 'Gasolina', fatorEmissao: 2.3 },
    { id: 2, nome: 'Etanol', fatorEmissao: 1.5 },
];

describe('ModalEmissaoCombustivel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        combustivelService.getAll.mockResolvedValue(COMBUSTIVEIS);
    });

    const setup = (props?: Partial<React.ComponentProps<typeof ModalEmissaoCombustivel>>) => {
        const onClose = jest.fn();
        const onSave = jest.fn();

        render(
            <ModalEmissaoCombustivel
                isOpen
                onClose={onClose}
                onSave={onSave}
                {...props}
            />
        );

        const dialog = screen.getByRole('dialog');
        const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
        const getCO2El = () => dialog.querySelector('.cardCO2 .valor') as HTMLElement;

        return { dialog, onClose, onSave, getCO2El, norm };
    };

    it('carrega combustíveis, preenche campos e recalcula CO₂ (litros * fator) exibindo 2 casas', async () => {
        const { dialog, getCO2El, norm } = setup();

        await waitFor(async () => {
            expect(await within(dialog).findByRole('option', { name: 'Gasolina' })).toBeInTheDocument();
        });

        expect(norm(getCO2El().textContent || '')).toBe('0.00 Kg');

        const date = within(dialog).getByTestId('antd-date');
        fireEvent.change(date, { target: { value: '2024-03-10' } });

        const [mediaKmInput, kmInput] = within(dialog).getAllByRole('spinbutton');
        fireEvent.change(mediaKmInput, { target: { value: '10' } });   
        fireEvent.change(kmInput, { target: { value: '100' } });       

        const select = within(dialog).getByTestId('antd-select');
        fireEvent.change(select, { target: { value: '1' } });

        await waitFor(() => {
            expect(norm(getCO2El().textContent || '')).toBe('23.00 Kg');
        });
    });

    it('com editingItem: preenche valores e, após carregar combustíveis, recalcula CO₂ com o fator do item', async () => {
        const editingItem = {
            id: 9,
            data: '2024-02-01',
            kmPercorrido: 180,
            mediaKm: 12,
            co2Emitido: 1,
            idCombustivel: 1,
            fatorEmissao: 2.3,
            nomeCombustivel: 'Gasolina',
        } as any;

        const { dialog, getCO2El, norm } = setup({ editingItem });

        await waitFor(async () => {
            expect(await within(dialog).findByRole('option', { name: 'Gasolina' })).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(norm(getCO2El().textContent || '')).toBe('34.50 Kg');
        });
    });

    it('Salvar: envia payload com co2Emitido calculado, fatorEmissao e nomeCombustivel; depois reseta para 0.00 Kg', async () => {
        const { dialog, onSave, getCO2El, norm } = setup();

        await waitFor(async () => {
            expect(await within(dialog).findByRole('option', { name: 'Gasolina' })).toBeInTheDocument();
        });

        const date = within(dialog).getByTestId('antd-date');
        fireEvent.change(date, { target: { value: '2024-04-01' } });

        const [mediaKmInput, kmInput] = within(dialog).getAllByRole('spinbutton');
        fireEvent.change(mediaKmInput, { target: { value: '8' } }); 
        fireEvent.change(kmInput, { target: { value: '92' } });        
        const select = within(dialog).getByTestId('antd-select');
        fireEvent.change(select, { target: { value: '1' } }); // Gasolina

        await waitFor(() => {
            expect(norm(getCO2El().textContent || '')).toBe('26.45 Kg');
        });

        fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));

        await waitFor(() => expect(onSave).toHaveBeenCalled());

        const payload = onSave.mock.calls.at(-1)?.[0];
        expect(payload?.kmPercorrido).toBe(92);
        expect(payload?.mediaKm).toBe(8);
        expect(payload?.idCombustivel).toBe(1);
        expect(payload?.co2Emitido).toBeCloseTo(26.45, 2);
        expect(payload?.fatorEmissao).toBe(2.3);
        expect(payload?.nomeCombustivel).toBe('Gasolina');

        await waitFor(() => {
            expect(norm(getCO2El().textContent || '')).toBe('0.00 Kg');
        });
    });

    it('Cancelar: reseta e chama onClose', async () => {
        const { dialog, onClose, getCO2El, norm } = setup();

        await waitFor(async () => {
            expect(await within(dialog).findByRole('option', { name: 'Gasolina' })).toBeInTheDocument();
        });

        const [mediaKmInput, kmInput] = within(dialog).getAllByRole('spinbutton');
        fireEvent.change(mediaKmInput, { target: { value: '10' } });
        fireEvent.change(kmInput, { target: { value: '100' } });

        const select = within(dialog).getByTestId('antd-select');
        fireEvent.change(select, { target: { value: '1' } });

        await waitFor(() => {
            expect(norm(getCO2El().textContent || '')).toBe('23.00 Kg');
        });

        fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
        expect(onClose).toHaveBeenCalled();

        await waitFor(() => {
            expect(norm(getCO2El().textContent || '')).toBe('0.00 Kg');
        });
    });

    it('chama combustivelService.getAll ao abrir', async () => {
        setup();
        await waitFor(() => expect(combustivelService.getAll).toHaveBeenCalled());
    });
});
