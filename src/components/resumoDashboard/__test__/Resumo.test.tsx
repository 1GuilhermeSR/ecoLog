import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import '../../../tests/mocks/antd-lite';

import Resumo from '../Resumo';
import { ResumoDTO } from '../../../dto/minhas_emissoes/ResumoDTO';

const BASE_RESUMO: ResumoDTO = {
    combustivelMaisUtilizado: 'Gasolina',
    percentualReducao: 10.5,
    mediaTrimestre: 12.345,
    mediaEstado: 8.9,
    msgGemini: 'Parabéns! Continue reduzindo suas emissões.',
};

describe('Resumo (ResumoDashboard)', () => {
    it('quando loadingModal=true: mostra spinner e não renderiza os cards', () => {
        render(
            <Resumo
                isOpen
                resumoDTO={BASE_RESUMO}
                loadingModal={true}
                onClose={() => { }}
            />
        );

        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getAllByText(/resumo/i).length).toBeGreaterThan(0);

        // não há títulos de cards enquanto carrega
        expect(within(dialog).queryByText(/Média de emissão do seu estado/i)).toBeNull();
        expect(within(dialog).queryByText(/Média de emissão$/i)).toBeNull();
        expect(within(dialog).queryByText(/Combustivel mais utilizado/i)).toBeNull();
        expect(within(dialog).queryByText(/Seu percentual de redução/i)).toBeNull();

        // spinner: checa elemento com aria-busy="true"
        const busy = dialog.querySelector('[aria-busy="true"]');
        expect(busy).toBeTruthy();
    });

    it('quando loadingModal=false: renderiza os cards e valores formatados; percentual positivo é verde', () => {
        render(
            <Resumo
                isOpen
                resumoDTO={BASE_RESUMO}
                loadingModal={false}
                onClose={() => { }}
            />
        );

        const dialog = screen.getByRole('dialog');

        // títulos e valores podem aparecer em clones
        expect(within(dialog).getAllByText('Média de emissão do seu estado').length).toBeGreaterThan(0);
        expect(within(dialog).getAllByText('Média de emissão').length).toBeGreaterThan(0);
        expect(within(dialog).getAllByText('Combustivel mais utilizado').length).toBeGreaterThan(0);
        expect(within(dialog).getAllByText('Seu percentual de redução').length).toBeGreaterThan(0);

        expect(within(dialog).getAllByText('8.90kg de CO2').length).toBeGreaterThan(0);
        expect(within(dialog).getAllByText('12.35kg de CO2').length).toBeGreaterThan(0);
        expect(within(dialog).getAllByText('Gasolina').length).toBeGreaterThan(0);

        const percPos = within(dialog).getAllByText((txt) => txt.includes('10.50%'));
        expect(percPos.length).toBeGreaterThan(0);
        expect((percPos[0] as HTMLElement)).toHaveStyle({ color: '#5FC26E' });

        expect(within(dialog).getAllByText(BASE_RESUMO.msgGemini).length).toBeGreaterThan(0);
    });

    it('percentual negativo fica vermelho (#BF4A4A)', () => {
        const negativo: ResumoDTO = { ...BASE_RESUMO, percentualReducao: -3.7 };

        render(
            <Resumo
                isOpen
                resumoDTO={negativo}
                loadingModal={false}
                onClose={() => { }}
            />
        );

        const dialog = screen.getByRole('dialog');

        const percsNeg = within(dialog).getAllByText((txt) => txt.includes('-3.70%'));
        expect(percsNeg.length).toBeGreaterThan(0);
        expect((percsNeg[0] as HTMLElement)).toHaveStyle({ color: '#BF4A4A' });
    });
});
