import dayjs from 'dayjs';
import { screen, waitFor, fireEvent, within } from '@testing-library/react';
import { renderWithRouter } from '../../../tests/utils/test-utils';
import * as antd from 'antd';
import '../../../tests/mocks/router';
import '../../../tests/mocks/antd-lite';

import EmissaoEnergia from '../EmissaoEnergia';

jest.mock('../../../services/energia/energiaService', () => ({
    __esModule: true,
    default: {
        getLast: jest.fn(),
    },
}));

jest.mock('../../../services/emissao_energia/emissaoEnergiaService', () => ({
    __esModule: true,
    default: {
        getEmissaoByUser: jest.fn(),
        gravarEmissaoEnergia: jest.fn(),
        editarEmissaoEnergia: jest.fn(),
        excluirEmissaoEnergia: jest.fn(),
    },
}));

const energiaService = require('../../../services/energia/energiaService').default;
const emissaoService = require('../../../services/emissao_energia/emissaoEnergiaService').default;
const { mockNavigate } = require('../../../tests/mocks/router');

const SAMPLE = [
    { id: 1, data: dayjs('2024-01-01'), kwhConsumido: 10, co2Emitido: 0.54, idEnergia: 1, fatorEmissao: 0.054 },
    { id: 2, data: dayjs('2024-02-01'), kwhConsumido: 50, co2Emitido: 2.7, idEnergia: 1, fatorEmissao: 0.054 },
    { id: 3, data: dayjs('2024-03-01'), kwhConsumido: 20, co2Emitido: 1.08, idEnergia: 1, fatorEmissao: 0.054 },
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
    energiaService.getLast.mockResolvedValue({ id: 1, fatorEmissao: 0.054 });
    emissaoService.getEmissaoByUser.mockResolvedValue({ success: true, data: SAMPLE });
    emissaoService.editarEmissaoEnergia.mockResolvedValue({ success: true });
    emissaoService.gravarEmissaoEnergia.mockResolvedValue({ success: true });
    emissaoService.excluirEmissaoEnergia.mockResolvedValue({ success: true });
});

describe('EmissaoEnergia (CRUD & branches)', () => {
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

    it('carrega lista e permite buscar por data parcial (02/2024)', async () => {
        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });

        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());
        await waitFor(() =>
            expect(screen.queryByText('Nenhum dado disponível')).not.toBeInTheDocument()
        );

        expect(screen.getByText((t) => t.includes('de 3 registros'))).toBeInTheDocument();

        const search = screen.getByPlaceholderText('Buscar');
        fireEvent.change(search, { target: { value: '02/2024' } });

        await waitFor(() => {
            expect(screen.getByText('01/02/2024')).toBeInTheDocument();
            expect(screen.queryByText('01/01/2024')).toBeNull();
            expect(screen.queryByText('01/03/2024')).toBeNull();
        });
    });

    it('busca por mês por extenso (MMM YYYY) conforme locale do app', async () => {
        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const search = screen.getByPlaceholderText('Buscar');
        const q = dayjs('2024-03-01').format('MMM YYYY').toLowerCase();
        fireEvent.change(search, { target: { value: q } });

        await waitFor(() => {
            expect(screen.getByText('01/03/2024')).toBeInTheDocument();
            expect(screen.queryByText('01/01/2024')).toBeNull();
            expect(screen.queryByText('01/02/2024')).toBeNull();
        });
    });

    it('busca por kWh consumido (campo numérico) filtra corretamente', async () => {
        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const search = screen.getByPlaceholderText('Buscar');
        fireEvent.change(search, { target: { value: '50' } });

        await waitFor(() => {
            expect(screen.getByText('01/02/2024')).toBeInTheDocument();
            expect(screen.queryByText('01/01/2024')).toBeNull();
            expect(screen.queryByText('01/03/2024')).toBeNull();
        });
    });

    it('busca por CO₂ emitido (campo numérico) filtra corretamente', async () => {
        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const search = screen.getByPlaceholderText('Buscar');
        fireEvent.change(search, { target: { value: '1.08' } });

        await waitFor(() => {
            expect(screen.getByText('01/03/2024')).toBeInTheDocument();
            expect(screen.queryByText('01/01/2024')).toBeNull();
            expect(screen.queryByText('01/02/2024')).toBeNull();
        });
    });

    it('limpa a busca (valor vazio) e volta a mostrar todas as linhas', async () => {
        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const search = screen.getByPlaceholderText('Buscar');
        fireEvent.change(search, { target: { value: '02/2024' } });
        await waitFor(() => expect(screen.getByText('01/02/2024')).toBeInTheDocument());

        fireEvent.change(search, { target: { value: '' } });

        await waitFor(() => {
            expect(screen.getByText('01/01/2024')).toBeInTheDocument();
            expect(screen.getByText('01/02/2024')).toBeInTheDocument();
            expect(screen.getByText('01/03/2024')).toBeInTheDocument();
        });
    });

    it('edita uma emissão existente (ícone editar -> Salvar atualiza linha)', async () => {
        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });

        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const [editIcon] = await screen.findAllByLabelText('edit');
        fireEvent.click(editIcon);

        const dialog = await screen.findByRole('dialog');

        const dateInput = within(dialog).getByTestId('antd-date');
        fireEvent.change(dateInput, { target: { value: '2024-02-10' } });

        const kwhInput = within(dialog).getByRole('spinbutton');
        fireEvent.change(kwhInput, { target: { value: '70' } });

        fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));
        await waitFor(() => expect(emissaoService.editarEmissaoEnergia).toHaveBeenCalled());

        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(screen.getByText('70 Kwh')).toBeInTheDocument();
    });

    it('edição usa idEnergia/fator do registro (não do getLast) quando em modo edição', async () => {
        energiaService.getLast.mockResolvedValueOnce({ id: 999, fatorEmissao: 9.99 });

        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const editIcons = await screen.findAllByLabelText('edit');
        fireEvent.click(editIcons[0]);

        const dialog = await screen.findByRole('dialog');
        const kwhInput = within(dialog).getByRole('spinbutton');
        fireEvent.change(kwhInput, { target: { value: '25' } });

        fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));
        await waitFor(() => expect(emissaoService.editarEmissaoEnergia).toHaveBeenCalled());

        const lastCall = emissaoService.editarEmissaoEnergia.mock.calls.at(-1)?.[0];
        expect(lastCall).toMatchObject({
            idEnergia: 1,
            fatorEmissao: 0.054,
        });
    });

    it('edição com erro não atualiza a linha (permanece valor antigo)', async () => {
        emissaoService.editarEmissaoEnergia.mockResolvedValueOnce({
            success: false,
            message: 'erro ao editar',
        });

        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const [editIcon] = await screen.findAllByLabelText('edit');
        fireEvent.click(editIcon);

        const dialog = await screen.findByRole('dialog');
        const kwhInput = within(dialog).getByRole('spinbutton');
        fireEvent.change(kwhInput, { target: { value: '80' } });

        fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));
        await waitFor(() => expect(emissaoService.editarEmissaoEnergia).toHaveBeenCalled());

        expect(screen.getByRole('dialog')).toBeInTheDocument();

        expect(screen.getByText('20 Kwh')).toBeInTheDocument();
        expect(screen.queryByText('80 Kwh')).toBeNull();
    });

    it('criação de emissão com sucesso (Novo -> Salvar) adiciona linha', async () => {

        (emissaoService.gravarEmissaoEnergia as jest.Mock).mockResolvedValue({
            success: true,
            data: { id: 1 }
        });
        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        fireEvent.click(screen.getByRole('button', { name: 'Novo' }));
        const dialog = await screen.findByRole('dialog');

        const dateInput = within(dialog).getByTestId('antd-date');
        fireEvent.change(dateInput, { target: { value: '2024-04-01' } });

        const kwhInput = within(dialog).getByRole('spinbutton');
        fireEvent.change(kwhInput, { target: { value: '30' } });

        fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));
        await waitFor(() => expect(emissaoService.gravarEmissaoEnergia).toHaveBeenCalled());

        await waitFor(() => {
            //expect(screen.getByText('01/04/2024')).toBeInTheDocument();
            expect(screen.getByText('30 Kwh')).toBeInTheDocument();
        });
    });

    it('criação com erro (service retorna success:false) não adiciona linha (modal permanece)', async () => {
        emissaoService.gravarEmissaoEnergia.mockResolvedValueOnce({
            success: false,
            message: 'erro ao gravar',
        });

        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        fireEvent.click(screen.getByRole('button', { name: 'Novo' }));
        const dialog = await screen.findByRole('dialog');

        const dateInput = within(dialog).getByTestId('antd-date');
        fireEvent.change(dateInput, { target: { value: '2024-04-01' } });

        const kwhInput = within(dialog).getByRole('spinbutton');
        fireEvent.change(kwhInput, { target: { value: '30' } });

        fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));
        await waitFor(() => expect(emissaoService.gravarEmissaoEnergia).toHaveBeenCalled());

        expect(screen.getByRole('dialog')).toBeInTheDocument();

        expect(screen.queryByText('01/04/2024')).toBeNull();
        expect(screen.queryByText('30 Kwh')).toBeNull();
    });

    it('exclui uma emissão com sucesso (Popconfirm "Sim")', async () => {
        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });

        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const deleteIcons = await screen.findAllByLabelText('delete');
        fireEvent.click(deleteIcons[1]);

        const confirmBtn = await screen.findByRole('button', { name: 'Sim' });
        fireEvent.click(confirmBtn);

        await waitFor(() => expect(emissaoService.excluirEmissaoEnergia).toHaveBeenCalledWith(2));
        await waitFor(() => expect(screen.queryByText('01/02/2024')).toBeNull());
    });

    it('exclusão com erro (success:false) mantém a linha e mostra mensagem de erro', async () => {
        emissaoService.excluirEmissaoEnergia.mockResolvedValueOnce({
            success: false,
            message: 'falha na exclusão',
        });

        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const deleteIcons = await screen.findAllByLabelText('delete');
        fireEvent.click(deleteIcons[1]);

        const confirmBtn = await screen.findByRole('button', { name: 'Sim' });
        fireEvent.click(confirmBtn);

        await waitFor(() => expect(emissaoService.excluirEmissaoEnergia).toHaveBeenCalled());
        await waitFor(() =>
            expect(messageOpenSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
        );
        expect(screen.getByText('01/02/2024')).toBeInTheDocument();
    });

    it('exclusão com exceção (catch) mostra mensagem de erro', async () => {
        emissaoService.excluirEmissaoEnergia.mockRejectedValueOnce(new Error('boom'));

        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const deleteIcons = await screen.findAllByLabelText('delete');
        fireEvent.click(deleteIcons[1]);

        const confirmBtn = await screen.findByRole('button', { name: 'Sim' });
        fireEvent.click(confirmBtn);

        await waitFor(() => expect(emissaoService.excluirEmissaoEnergia).toHaveBeenCalledWith(2));
        await waitFor(() =>
            expect(messageOpenSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
        );
    });

    it('cancela exclusão no Popconfirm ("Não") e não chama o service', async () => {
        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        const deleteIcons = await screen.findAllByLabelText('delete');
        fireEvent.click(deleteIcons[1]);

        const cancelBtn = await screen.findByRole('button', { name: 'Não' });
        fireEvent.click(cancelBtn);

        expect(emissaoService.excluirEmissaoEnergia).not.toHaveBeenCalled();
    });

    it('fetchEmissoes: API retorna success=true porém data não-array → tabela vazia', async () => {
        emissaoService.getEmissaoByUser.mockResolvedValueOnce({ success: true, data: {} });

        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });

        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());
        expect(await screen.findByText('Nenhum dado disponível')).toBeInTheDocument();
    });

    it('fetchEmissoes: API rejeita (catch) → tabela vazia', async () => {
        const errSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        emissaoService.getEmissaoByUser.mockRejectedValueOnce(new Error('oops'));

        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });

        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());
        expect(await screen.findByText('Nenhum dado disponível')).toBeInTheDocument();

        errSpy.mockRestore();
    });

    it('fetchEnergia: rejeita/getLast falha → criar emissão aciona early return (sem chamar service)', async () => {
        energiaService.getLast.mockRejectedValueOnce(new Error('fail'));

        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });
        await waitFor(() => expect(emissaoService.getEmissaoByUser).toHaveBeenCalled());

        fireEvent.click(screen.getByRole('button', { name: 'Novo' }));
        const dialog = await screen.findByRole('dialog');

        const dateInput = within(dialog).getByTestId('antd-date');
        fireEvent.change(dateInput, { target: { value: '2024-04-01' } });

        const kwhInput = within(dialog).getByRole('spinbutton');
        fireEvent.change(kwhInput, { target: { value: '30' } });

        fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));

        // early return: nenhum service chamado
        expect(emissaoService.gravarEmissaoEnergia).not.toHaveBeenCalled();
        expect(emissaoService.editarEmissaoEnergia).not.toHaveBeenCalled();

        // modal permanece aberto (não houve sucesso)
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('ícone de voltar navega para /home', async () => {
        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });

        const back = document.querySelector('.backIcon') as HTMLElement;
        expect(back).toBeInTheDocument();

        fireEvent.click(back);
        expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    it('mensagem "Nenhum resultado encontrado" ao filtrar para zero resultados', async () => {
        renderWithRouter(<EmissaoEnergia />, { route: '/energia' });
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
