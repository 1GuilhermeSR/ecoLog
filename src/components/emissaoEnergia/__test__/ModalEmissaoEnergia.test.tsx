import React from 'react';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import '../../../tests/mocks/antd-lite';

import ModalEmissaoEnergia from '../ModalEmissaoEnergia';

describe('ModalEmissaoEnergia', () => {
    const setup = (props?: Partial<React.ComponentProps<typeof ModalEmissaoEnergia>>) => {
        const onClose = jest.fn();
        const onSave = jest.fn();

        render(
            <ModalEmissaoEnergia
                isOpen
                onClose={onClose}
                onSave={onSave}
                {...props}
            />
        );

        const dialog = screen.getByRole('dialog');
        const getCO2El = () => dialog.querySelector('.cardCO2 .valor') as HTMLElement;

        return { dialog, onClose, onSave, getCO2El };
    };

    it('abre o modal e calcula CO₂ ao digitar kWh (fator default 0.054)', async () => {
        const { dialog, getCO2El } = setup();

        // estado inicial
        expect(getCO2El().textContent?.replace(/\s+/g, ' ').trim()).toBe('0.000 Kg');

        // preenche data (mock do DatePicker usa input type="date" = YYYY-MM-DD)
        const date = within(dialog).getByTestId('antd-date');
        fireEvent.change(date, { target: { value: '2024-01-01' } });

        const kwh = within(dialog).getByRole('spinbutton');
        fireEvent.change(kwh, { target: { value: '100' } });

        await waitFor(() =>
            expect(getCO2El().textContent?.replace(/\s+/g, ' ').trim()).toBe('5.400 Kg')
        );
    });

    it('quando recebe editingItem, carrega valores e mostra CO₂ inicial daquele item', () => {
        const editingItem = {
            data: '2024-03-05',
            kwhConsumido: 123.4,
            co2Emitido: 6.66,
        } as any;

        const { getCO2El } = setup({ editingItem });

        expect(getCO2El().textContent?.replace(/\s+/g, ' ').trim()).toBe('6.660 Kg');
    });

    it('Salvar: envia payload com co2Emitido calculado e reseta o estado para 0.000 Kg', async () => {
        const { dialog, onSave, getCO2El } = setup();

        const date = within(dialog).getByTestId('antd-date');
        fireEvent.change(date, { target: { value: '2024-02-10' } });

        const kwh = within(dialog).getByRole('spinbutton');
        fireEvent.change(kwh, { target: { value: '50' } }); // 50 * 0.054 = 2.700

        fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));

        await waitFor(() => expect(onSave).toHaveBeenCalled());

        const last = onSave.mock.calls.at(-1)?.[0];
        expect(last?.kwhConsumido).toBe(50);
        expect(last?.co2Emitido).toBeCloseTo(2.7, 5);

        await waitFor(() =>
            expect(getCO2El().textContent?.replace(/\s+/g, ' ').trim()).toBe('0.000 Kg')
        );
    });

    it('Cancelar: reseta o estado e chama onClose', async () => {
        const { dialog, onClose, getCO2El } = setup();

        const date = within(dialog).getByTestId('antd-date');
        fireEvent.change(date, { target: { value: '2024-02-10' } });

        const kwh = within(dialog).getByRole('spinbutton');
        fireEvent.change(kwh, { target: { value: '20' } }); 

        fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

        expect(onClose).toHaveBeenCalled();

        await waitFor(() =>
            expect(getCO2El().textContent?.replace(/\s+/g, ' ').trim()).toBe('0.000 Kg')
        );
    });
});
