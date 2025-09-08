import dayjs from 'dayjs';
import { screen, waitFor, fireEvent, within } from '@testing-library/react';
import { renderWithRouter } from '../../../tests/utils/test-utils';
import * as antd from 'antd';

const { mockNavigate } = require('../../../tests/mocks/router');

import '../../../tests/mocks/router';
import '../../../tests/mocks/antd-lite';

import EmissaoCombustivel from '../EmissaoCombustivel';

jest.mock('../../../services/combustivel/combustivelService', () => ({
    __esModule: true,
    default: { getAll: jest.fn() },
}));

jest.mock('../../../services/emissao_combustivel/emissaoCombustivelService', () => ({
    __esModule: true,
    default: {
        getEmissaoByUser: jest.fn(),
        gravarEmissaoCombustivel: jest.fn(),
        editarEmissaoCombustivel: jest.fn(),
        excluirEmissaoCombustivel: jest.fn(),
    },
}));

const combustivelService = require('../../../services/combustivel/combustivelService').default;
const emissaoService = require('../../../services/emissao_combustivel/emissaoCombustivelService').default;

const SAMPLE = [
    {
        id: 1,
        data: dayjs('2024-01-15'),
        kmPercorrido: 100,
        mediaKm: 10,
        co2Emitido: 23,
        idCombustivel: 1,
        fatorEmissao: 2.3,
        nomeCombustivel: 'Gasolina',
    },
    {
        id: 2,
        data: dayjs('2024-02-01'),
        kmPercorrido: 50,
        mediaKm: 12.5,
        co2Emitido: 9.2,
        idCombustivel: 1,
        fatorEmissao: 2.3,
        nomeCombustivel: 'Gasolina',
    },
    {
        id: 3,
        data: dayjs('2024-03-05'),
        kmPercorrido: 200,
        mediaKm: 20,
        co2Emitido: 23,
        idCombustivel: 2,
        fatorEmissao: 2.3,
        nomeCombustivel: 'Etanol',
    },
];

const COMBUSTIVEIS = [
    { id: 1, nome: 'Gasolina', fatorEmissao: 2.3 },
    { id: 2, nome: 'Etanol', fatorEmissao: 1.5 },
];

const realError = console.error;
let consoleErrorSpy: jest.SpyInstance;

beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
        if (String(args[0]).includes('Instance created by `useForm` is not connected')) return;
        realError(...args);
    });
});

afterAll(() => {
    consoleErrorSpy.mockRestore();
});

beforeEach(() => {
    jest.clearAllMocks();
    combustivelService.getAll.mockResolvedValue(COMBUSTIVEIS);
    emissaoService.getEmissaoByUser.mockResolvedValue({ success: true, data: SAMPLE });
    emissaoService.editarEmissaoCombustivel.mockResolvedValue({ success: true });
    emissaoService.gravarEmissaoCombustivel.mockResolvedValue({ success: true });
    emissaoService.excluirEmissaoCombustivel.mockResolvedValue({ success: true });
    combustivelService.getAll.mockResolvedValue([
        { id: 1, nome: 'Gasolina', fatorEmissao: 2.3 },
        { id: 2, nome: 'Etanol', fatorEmissao: 2.3 },
    ]);
});

// util: retorna a <tr> da data informada
const getRowByDate = (dateStr: string) => {
    const cell = screen.getByText(dateStr);
    const row = cell.closest('tr');
    if (!row) throw new Error(`Linha para data ${dateStr} não encontrada`);
    return row;
};

describe('EmissaoCombustivel', () => {
    let useMessageSpy: jest.SpyInstance;
    let messageOpenSpy: jest.Mock;

    beforeEach(() => {
        messageOpenSpy = jest.fn();
        useMessageSpy = jest
            .spyOn(antd.message, 'useMessage')
            .mockReturnValue([{ open: messageOpenSpy } as any, <div key="ctx" />] as any);
    });

    afterEach(() => {
        useMessageSpy?.mockRestore();
    });

    it('carrega lista e permite buscar', async () => {
        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });

        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());
        await waitFor(() =>
            expect(screen.queryByText('Nenhum dado disponível')).not.toBeInTheDocument()
        );

        expect(screen.getByText((t) => t.includes('de 3 registros'))).toBeInTheDocument();

        const search = screen.getByPlaceholderText('Buscar');
        fireEvent.change(search, { target: { value: '02/2024' } });

        await waitFor(() => {
            expect(screen.getByText('01/02/2024')).toBeInTheDocument();
            expect(screen.queryByText('15/01/2024')).toBeNull();
            expect(screen.queryByText('05/03/2024')).toBeNull();
        });
    });

    it('edita uma emissão existente (editar -> Salvar atualiza a linha e envia payload com data)', async () => {
        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });

        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const [editIcon] = await screen.findAllByLabelText('edit');
        fireEvent.click(editIcon);

        const dialog = await screen.findByRole('dialog');

        const dateInput = within(dialog).getByTestId('antd-date');
        fireEvent.change(dateInput, { target: { value: '2024-03-10' } }); 

        const spins = within(dialog).getAllByRole('spinbutton'); 
        fireEvent.change(spins[1], { target: { value: '180' } }); 

        // salva
        fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));

        await waitFor(() => expect(emissaoService.editarEmissaoCombustivel).toHaveBeenCalled());

        const lastCall = emissaoService.editarEmissaoCombustivel.mock.calls.at(-1)?.[0];
        expect(lastCall).toMatchObject({
            id: 3,              
            kmPercorrido: 180,  
        });
        expect(lastCall?.data).toBe('05/03/2024');

        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

        expect(screen.getByText('180 km')).toBeInTheDocument();
    });

    it('exclui uma emissão com sucesso (ícone lixeira)', async () => {
        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });

        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const deleteIcons = await screen.findAllByLabelText('delete');

        fireEvent.click(deleteIcons[1]);

        await waitFor(() =>
            expect(emissaoService.excluirEmissaoCombustivel).toHaveBeenCalledWith(2)
        );

        await waitFor(() => expect(screen.queryByText('01/02/2024')).toBeNull());
    });

    it('edição com erro: não atualiza a linha e modal fecha', async () => {
        emissaoService.editarEmissaoCombustivel.mockResolvedValueOnce({
            success: false,
            message: 'erro ao editar',
        });

        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const [editIcon] = await screen.findAllByLabelText('edit');
        fireEvent.click(editIcon);

        const dialog = await screen.findByRole('dialog');

        const dateInput = within(dialog).getByTestId('antd-date');
        fireEvent.change(dateInput, { target: { value: '2024-03-10' } });

        const spins = within(dialog).getAllByRole('spinbutton');
        fireEvent.change(spins[0], { target: { value: '30' } }); 
        fireEvent.change(spins[1], { target: { value: '999' } }); 

        fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));
        await waitFor(() => expect(emissaoService.editarEmissaoCombustivel).toHaveBeenCalled());

        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

        const marRow = getRowByDate('05/03/2024');
        expect(within(marRow).getByText('200 km')).toBeInTheDocument();
        expect(screen.queryByText('999 km')).toBeNull();
    });

    it('criação com sucesso (Novo -> preencher -> Salvar) adiciona linha corretamente', async () => {
        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });

        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        fireEvent.click(screen.getByRole('button', { name: 'Novo' }));
        const dialog = await screen.findByRole('dialog');

        await waitFor(() => expect(combustivelService.getAll).toHaveBeenCalled());

        const dateInput = within(dialog).getByTestId('antd-date');
        fireEvent.change(dateInput, { target: { value: '2024-04-01' } });

        // média e km
        const spins = within(dialog).getAllByRole('spinbutton');
        fireEvent.change(spins[0], { target: { value: '10' } });  
        fireEvent.change(spins[1], { target: { value: '100' } }); 

        const select = within(dialog).getByTestId('antd-select');
        fireEvent.change(select, { target: { value: '1' } });

        fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));
        await waitFor(() => expect(emissaoService.gravarEmissaoCombustivel).toHaveBeenCalled());

        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

        const row = getRowByDate('01/04/2024');
        expect(within(row).getByText('100 km')).toBeInTheDocument();
        expect(within(row).getByText('10 km/l')).toBeInTheDocument();
        expect(within(row).getByText('23.00 kg')).toBeInTheDocument();
    });

    it('criação com erro: não adiciona linha e modal fecha', async () => {
        emissaoService.gravarEmissaoCombustivel.mockResolvedValueOnce({
            success: false,
            message: 'erro ao gravar',
        });

        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        fireEvent.click(screen.getByRole('button', { name: 'Novo' }));
        const dialog = await screen.findByRole('dialog');

        await waitFor(() => expect(combustivelService.getAll).toHaveBeenCalled());

        const dateInput = within(dialog).getByTestId('antd-date');
        fireEvent.change(dateInput, { target: { value: '2024-04-01' } });

        const spins = within(dialog).getAllByRole('spinbutton');
        fireEvent.change(spins[0], { target: { value: '10' } });
        fireEvent.change(spins[1], { target: { value: '100' } });

        const select = within(dialog).getByTestId('antd-select');
        fireEvent.change(select, { target: { value: '1' } });

        fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));
        await waitFor(() => expect(emissaoService.gravarEmissaoCombustivel).toHaveBeenCalled());

        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

        expect(screen.queryByText('01/04/2024')).toBeNull();
    });

    it('recalcula CO₂ no modal conforme inputs e combustível', async () => {
        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });

        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        fireEvent.click(screen.getByRole('button', { name: 'Novo' }));
        const dialog = await screen.findByRole('dialog');

        await waitFor(async () => {
            expect(await within(dialog).findByRole('option', { name: 'Gasolina' })).toBeInTheDocument();
        });

        const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
        const getCO2El = () => dialog.querySelector('.cardCO2 .valor') as HTMLElement;

        expect(norm(getCO2El().textContent || '')).toBe('0.00 Kg');

        const spins = within(dialog).getAllByRole('spinbutton'); 
        fireEvent.change(spins[0], { target: { value: '10' } });  
        fireEvent.change(spins[1], { target: { value: '100' } });  

        const select = within(dialog).getByTestId('antd-select');
        fireEvent.change(select, { target: { value: '1' } });

        await waitFor(() => {
            expect(norm(getCO2El().textContent || '')).toBe('23.00 Kg');
        });
    });

    it('fetchEmissoes: API retorna success=false ou data não-array → tabela vazia', async () => {
        emissaoService.getEmissaoByUser.mockResolvedValueOnce({ success: true, data: {} });

        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });

        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());
        expect(await screen.findByText('Nenhum dado disponível')).toBeInTheDocument();
    });

    it('fetchEmissoes: API rejeita (catch) → tabela vazia', async () => {
        const errSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        emissaoService.getEmissaoByUser.mockRejectedValueOnce(new Error('oops'));

        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });

        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());
        expect(await screen.findByText('Nenhum dado disponível')).toBeInTheDocument();

        errSpy.mockRestore();
    });

    it('busca por nome do combustível (matchComb) filtra corretamente', async () => {
        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const search = screen.getByPlaceholderText('Buscar');
        fireEvent.change(search, { target: { value: 'gasolina' } });

        await waitFor(() => {
            expect(screen.queryByText('05/03/2024')).toBeNull(); 
            expect(screen.getByText('15/01/2024')).toBeInTheDocument();
            expect(screen.getByText('01/02/2024')).toBeInTheDocument();
        });
    });

    it('busca por mês por extenso (matchMesNome) usando o mesmo locale do app', async () => {
        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const search = screen.getByPlaceholderText('Buscar');

        const monthQuery = dayjs('2024-03-01').format('MMM YYYY').toLowerCase();
        fireEvent.change(search, { target: { value: monthQuery } });

        await waitFor(() => {
            expect(screen.getByText('05/03/2024')).toBeInTheDocument(); // março
            expect(screen.queryByText('15/01/2024')).toBeNull();
            expect(screen.queryByText('01/02/2024')).toBeNull();
        });
    });

    it('excluir: resposta success=false mostra erro e não remove a linha', async () => {
        emissaoService.excluirEmissaoCombustivel.mockResolvedValueOnce({
            success: false,
            message: 'Não foi possível excluir',
        });

        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const deleteIcons = await screen.findAllByLabelText('delete');
        fireEvent.click(deleteIcons[1]); // id:2

        await waitFor(() => expect(emissaoService.excluirEmissaoCombustivel).toHaveBeenCalledWith(2));
        await waitFor(() =>
            expect(messageOpenSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
        );
        expect(screen.getByText('01/02/2024')).toBeInTheDocument(); // linha permanece
    });

    it('excluir: exceção no service (catch) mostra erro', async () => {
        emissaoService.excluirEmissaoCombustivel.mockRejectedValueOnce(new Error('boom'));

        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const deleteIcons = await screen.findAllByLabelText('delete');
        fireEvent.click(deleteIcons[1]);

        await waitFor(() => expect(emissaoService.excluirEmissaoCombustivel).toHaveBeenCalledWith(2));
        await waitFor(() =>
            expect(messageOpenSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
        );
    });

    it('ícone de voltar navega para /home', async () => {
        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });

        const back = document.querySelector('.backIcon') as HTMLElement; // classe do SVG do ícone
        expect(back).toBeInTheDocument();

        fireEvent.click(back);
        expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    it('mensagem "Nenhum resultado encontrado" quando há termo e filtro zera a lista', async () => {
        renderWithRouter(<EmissaoCombustivel />, { route: '/combustivel' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const search = screen.getByPlaceholderText('Buscar');
        fireEvent.change(search, { target: { value: 'termo-que-nao-existe' } });

        await waitFor(() =>
            expect(
                screen.getByText('Nenhum resultado encontrado para "termo-que-nao-existe"')
            ).toBeInTheDocument()
        );
    });
});
