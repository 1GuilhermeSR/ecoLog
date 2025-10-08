import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../../../tests/utils/test-utils';

import '../../../tests/mocks/router';
import '../../../tests/mocks/antd-lite';

import Dashboard from '../Dashboard';

jest.mock('chart.js', () => ({
    Chart: { register: jest.fn() },
    CategoryScale: jest.fn(),
    LinearScale: jest.fn(),
    PointElement: jest.fn(),
    LineElement: jest.fn(),
    ArcElement: jest.fn(),
    Title: jest.fn(),
    Tooltip: jest.fn(),
    Legend: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
    __esModule: true,
    Line: ({ data }: any) => (
        <div
            data-testid="line-chart"
            data-points={JSON.stringify(data?.datasets?.[0]?.data ?? [])}
        >
            line
        </div>
    ),
    Doughnut: ({ data }: any) => (
        <div
            data-testid="doughnut-chart"
            data-points={JSON.stringify(data?.datasets?.[0]?.data ?? [])}
        >
            doughnut
        </div>
    ),
}));

jest.mock('../../../components/geral/Loading', () => ({
    __esModule: true,
    default: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock('../../../components/geral/BtnPrincipal', () => ({
    __esModule: true,
    default: ({ label, onClick }: { label: string; onClick?: () => void }) => (
        <button onClick={onClick}>{label}</button>
    ),
}));

jest.mock('../../../components/resumoDashboard/Resumo', () => ({
    __esModule: true,
    default: (props: any) => (
        <div data-testid="resumo-mock">
            {props.isOpen ? 'Resumo Aberto' : 'Resumo Fechado'}
        </div>
    ),
}));

jest.mock('../../../services/minhas_emissoes/MinhasEmissoesService', () => ({
    __esModule: true,
    default: {
        getTotalizadoresMensais: jest.fn(),
        getTotalPorCategoria: jest.fn(),
        getResumo: jest.fn(),
    },
}));
const svc = require('../../../services/minhas_emissoes/MinhasEmissoesService').default;

const currentYear = new Date().getFullYear();

const defer = <T,>() => {
    let resolve!: (v: T) => void;
    const promise = new Promise<T>((res) => (resolve = res));
    return { promise, resolve };
};

beforeEach(() => {
    jest.clearAllMocks();

    svc.getTotalizadoresMensais.mockResolvedValue({
        success: true,
        data: { labels: ['Jan', 'Fev'], data: [10, 20] },
    });

    svc.getTotalPorCategoria.mockResolvedValue({
        success: true,
        data: { labels: ['Energia', 'Combustível'], data: [30, 70] },
    });

    svc.getResumo.mockResolvedValue({
        success: true,
        data: {
            combustivelMaisUtilizado: 'Gasolina',
            percentualReducao: 5,
            mediaTrimestre: 12,
            mediaEstado: 10,
            msgGemini: '',
        },
    });
});

describe('Dashboard', () => {
    it('realiza as chamadas iniciais (linha e pizza) com o ano corrente', async () => {
        renderWithRouter(<Dashboard />, { route: '/minhasEmissoes' });

        expect(await screen.findByTestId('doughnut-chart')).toBeInTheDocument();
        expect(await screen.findByTestId('line-chart')).toBeInTheDocument();

        await waitFor(() => {
            expect(svc.getTotalizadoresMensais).toHaveBeenCalledWith(currentYear);
            expect(svc.getTotalPorCategoria).toHaveBeenCalledWith(currentYear, 0);
        });
    });

    it('altera filtros e refaz chamadas com valores selecionados', async () => {
        renderWithRouter(<Dashboard />, { route: '/minhasEmissoes' });

        await waitFor(() => {
            expect(svc.getTotalizadoresMensais).toHaveBeenCalled();
            expect(svc.getTotalPorCategoria).toHaveBeenCalled();
        });

        const selects = await screen.findAllByRole('combobox');
        const selectAnoPizza = selects[0];
        const selectMesPizza = selects[1];
        const selectAnoLinha = selects[2];

        const anoAnterior = (currentYear - 1).toString();
        fireEvent.change(selectAnoPizza, { target: { value: anoAnterior } });
        await waitFor(() => {
            const last = svc.getTotalPorCategoria.mock.calls.at(-1);
            expect(last).toEqual([Number(anoAnterior), 0]);
        });

        fireEvent.change(selectMesPizza, { target: { value: '3' } });
        await waitFor(() => {
            const last = svc.getTotalPorCategoria.mock.calls.at(-1);
            expect(last).toEqual([Number(anoAnterior), 3]);
        });

        const anoLinhaNovo = (currentYear - 2).toString();
        fireEvent.change(selectAnoLinha, { target: { value: anoLinhaNovo } });
        await waitFor(() => {
            const last = svc.getTotalizadoresMensais.mock.calls.at(-1);
            expect(last).toEqual([Number(anoLinhaNovo)]);
        });
    });

    it('abre o resumo ao clicar em "Ver Resumo" e busca dados', async () => {
        renderWithRouter(<Dashboard />, { route: '/minhasEmissoes' });

        const btn = await screen.findByRole('button', { name: 'Ver Resumo' });
        fireEvent.click(btn);

        await waitFor(() => expect(svc.getResumo).toHaveBeenCalled());
        expect(await screen.findByTestId('resumo-mock')).toHaveTextContent('Resumo Aberto');
    });


    it('limpa datasets quando API retorna success=false ou data ausente', async () => {
        svc.getTotalizadoresMensais.mockResolvedValueOnce({ success: false });

        svc.getTotalPorCategoria.mockResolvedValueOnce({ success: true, data: null });

        renderWithRouter(<Dashboard />, { route: '/minhasEmissoes' });

        const doughnut = await screen.findByTestId('doughnut-chart');
        const line = await screen.findByTestId('line-chart');

        expect(doughnut).toHaveAttribute('data-points', '[]');
        expect(line).toHaveAttribute('data-points', '[]');
    });

    it('exibe message.error quando getTotalizadoresMensais rejeita (caminho de erro)', async () => {
        const { message } = require('antd');
        const errMock = jest.fn();
        jest
            .spyOn(message, 'useMessage')
            .mockReturnValue([{ error: errMock } as any, <div key="ctx" />] as any);

        svc.getTotalizadoresMensais.mockRejectedValueOnce(new Error('falhou!'));
        svc.getTotalPorCategoria.mockResolvedValueOnce({
            success: true,
            data: { labels: ['A'], data: [1] },
        });

        renderWithRouter(<Dashboard />, { route: '/minhasEmissoes' });

        await waitFor(() => expect(errMock).toHaveBeenCalled());
    });
});
