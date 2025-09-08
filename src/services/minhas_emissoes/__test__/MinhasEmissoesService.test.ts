import MinhasEmissoesService from '../MinhasEmissoesService';

jest.mock('../../api', () => ({
    __esModule: true,
    default: { get: jest.fn() },
}));

const api = require('../../api').default as { get: jest.Mock };

describe('MinhasEmissoesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTotalizadoresMensais', () => {
        it('chama o endpoint com o ano e retorna o payload quando sucesso', async () => {
            const mockPayload = { success: true, data: { labels: ['Jan', 'Fev'], data: [10, 20] } };
            api.get.mockResolvedValueOnce({ data: mockPayload });

            const result = await MinhasEmissoesService.getTotalizadoresMensais(2024);

            expect(api.get).toHaveBeenCalledWith('/minhasEmissoes/totalizadoresMensais', {
                params: { ano: 2024 },
            });
            expect(result).toEqual(mockPayload);
        });

        it('lança erro formatado quando a API rejeita (checa message e error)', async () => {
            const boom = new Error('boom');
            api.get.mockRejectedValueOnce(boom);

            await expect(
                MinhasEmissoesService.getTotalizadoresMensais(2024)
            ).rejects.toMatchObject({
                success: false,
                message: 'Erro ao carregar totalizadores mensais\n',
                error: boom,
            });

            expect(api.get).toHaveBeenCalledWith('/minhasEmissoes/totalizadoresMensais', {
                params: { ano: 2024 },
            });
        });

        it('getTotalizadoresMensais: chamadas consecutivas não cacheiam e passam o ano correto', async () => {
            const p1 = { success: true, data: { labels: ['Jan'], data: [1] } };
            const p2 = { success: true, data: { labels: ['Fev'], data: [2] } };

            api.get
                .mockResolvedValueOnce({ data: p1 })
                .mockResolvedValueOnce({ data: p2 }); 

            const r1 = await MinhasEmissoesService.getTotalizadoresMensais(2026);
            const r2 = await MinhasEmissoesService.getTotalizadoresMensais(2027);

            expect(api.get).toHaveBeenNthCalledWith(1, '/minhasEmissoes/totalizadoresMensais', {
                params: { ano: 2026 },
            });
            expect(api.get).toHaveBeenNthCalledWith(2, '/minhasEmissoes/totalizadoresMensais', {
                params: { ano: 2027 },
            });

            expect(r1).toEqual(p1);
            expect(r2).toEqual(p2);
        });
    });

    describe('getTotalPorCategoria', () => {
        it('chama o endpoint com ano e mes informados e retorna o payload quando sucesso', async () => {
            const mockPayload = { success: true, data: { labels: ['Energia', 'Combustível'], data: [12, 8] } };
            api.get.mockResolvedValueOnce({ data: mockPayload });

            const result = await MinhasEmissoesService.getTotalPorCategoria(2023, 5);

            expect(api.get).toHaveBeenCalledWith('/minhasEmissoes/totalPorCategoria', {
                params: { ano: 2023, mes: 5 },
            });
            expect(result).toEqual(mockPayload);
        });

        it('quando mes é undefined, envia mes=0 e retorna payload', async () => {
            const mockPayload = { success: true, data: { labels: ['Energia'], data: [42] } };
            api.get.mockResolvedValueOnce({ data: mockPayload });

            const result = await MinhasEmissoesService.getTotalPorCategoria(2022);

            expect(api.get).toHaveBeenCalledWith('/minhasEmissoes/totalPorCategoria', {
                params: { ano: 2022, mes: 0 },
            });
            expect(result).toEqual(mockPayload);
        });

        it('quando mes=null, também envia mes=0', async () => {
            const mockPayload = { success: true, data: { labels: [], data: [] } };
            api.get.mockResolvedValueOnce({ data: mockPayload });

            // @ts-expect-error simulando chamada com null
            const result = await MinhasEmissoesService.getTotalPorCategoria(2025, null);

            expect(api.get).toHaveBeenCalledWith('/minhasEmissoes/totalPorCategoria', {
                params: { ano: 2025, mes: 0 },
            });
            expect(result).toEqual(mockPayload);
        });

        it('quando mes=0 explicitamente, mantém mes=0', async () => {
            const mockPayload = { success: true, data: { labels: ['Jan'], data: [1] } };
            api.get.mockResolvedValueOnce({ data: mockPayload });

            const result = await MinhasEmissoesService.getTotalPorCategoria(2030, 0);

            expect(api.get).toHaveBeenCalledWith('/minhasEmissoes/totalPorCategoria', {
                params: { ano: 2030, mes: 0 },
            });
            expect(result).toEqual(mockPayload);
        });

        it('lança erro formatado quando a API rejeita (checa message e error)', async () => {
            const falha = new Error('falha');
            api.get.mockRejectedValueOnce(falha);

            await expect(
                MinhasEmissoesService.getTotalPorCategoria(2021, 12)
            ).rejects.toMatchObject({
                success: false,
                message: 'Erro ao carregar totais por categoria\n',
                error: falha,
            });

            expect(api.get).toHaveBeenCalledWith('/minhasEmissoes/totalPorCategoria', {
                params: { ano: 2021, mes: 12 },
            });
        });
    });

    describe('getResumo', () => {
        it('retorna o payload quando sucesso', async () => {
            const mockPayload = {
                success: true,
                data: {
                    combustivelMaisUtilizado: 'Gasolina',
                    percentualReducao: 3.5,
                    mediaTrimestre: 12.34,
                    mediaEstado: 10.0,
                    msgGemini: 'Mensagem teste',
                },
            };
            api.get.mockResolvedValueOnce({ data: mockPayload });

            const result = await MinhasEmissoesService.getResumo();

            expect(api.get).toHaveBeenCalledWith('/minhasEmissoes/resumo');
            expect(result).toEqual(mockPayload);
        });

        it('repassa payload mesmo com success=false', async () => {
            const mockPayload = {
                success: false,
                message: 'qualquer',
                data: null,
            };
            api.get.mockResolvedValueOnce({ data: mockPayload });

            const result = await MinhasEmissoesService.getResumo();

            expect(api.get).toHaveBeenCalledWith('/minhasEmissoes/resumo');
            expect(result).toEqual(mockPayload);
        });

        it('lança erro formatado quando a API rejeita (checa message e error)', async () => {
            const nope = new Error('nope');
            api.get.mockRejectedValueOnce(nope);

            await expect(MinhasEmissoesService.getResumo()).rejects.toMatchObject({
                success: false,
                message: 'Erro ao carregar resumo\n',
                error: nope,
            });

            expect(api.get).toHaveBeenCalledWith('/minhasEmissoes/resumo');
        });
    });
});
