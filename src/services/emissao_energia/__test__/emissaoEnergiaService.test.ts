import EmissaoEnergiaService from '../emissaoEnergiaService';

jest.mock('../../api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    },
}));

const api = require('../../api').default as {
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
    delete: jest.Mock;
};

describe('EmissaoEnergiaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getEmissaoByUser', () => {
        it('transforma "data" em Dayjs válido quando payload é array', async () => {
            const payload = {
                success: true,
                data: [
                    { id: 1, data: '2024-01-15', kwhConsumido: 100, co2Emitido: 5.4 },
                    { id: 2, data: '2024-02-01', kwhConsumido: 50, co2Emitido: 2.7 },
                ],
            };
            api.get.mockResolvedValueOnce({ data: payload });

            const result = await EmissaoEnergiaService.getEmissaoByUser();

            expect(api.get).toHaveBeenCalledWith('/emissaoEnergia/getEmissaoByUser');
            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(2);

            const d0 = (result.data as any[])[0].data;
            const d1 = (result.data as any[])[1].data;

            expect(typeof d0).toBe('object');
            expect(typeof d1).toBe('object');
            expect(d0?.isValid?.()).toBe(true);
            expect(d1?.isValid?.()).toBe(true);

            expect((result.data as any[])[0]).toMatchObject({ id: 1, kwhConsumido: 100, co2Emitido: 5.4 });
            expect((result.data as any[])[1]).toMatchObject({ id: 2, kwhConsumido: 50, co2Emitido: 2.7 });
        });

        it('retorna payload sem mapear quando "data" não é array', async () => {
            const payload = { success: true, data: { id: 9, data: '2024-03-10' } };
            api.get.mockResolvedValueOnce({ data: payload });

            const result = await EmissaoEnergiaService.getEmissaoByUser();

            expect(api.get).toHaveBeenCalledWith('/emissaoEnergia/getEmissaoByUser');
            expect(result).toEqual(payload);
        });

        it('lança erro padronizado quando a API falha', async () => {
            api.get.mockRejectedValueOnce(new Error('boom'));

            await expect(EmissaoEnergiaService.getEmissaoByUser()).rejects.toMatchObject({
                success: false,
                message: 'Erro ao buscar emissões de energia\n',
            });
            expect(api.get).toHaveBeenCalledWith('/emissaoEnergia/getEmissaoByUser');
        });
    });

    describe('gravarEmissaoEnergia', () => {
        it('POST correto e retorno do payload', async () => {
            const values = { id: 0, data: '10/03/2024', kwhConsumido: 123.4 } as any;
            const payload = { success: true, data: { id: 101 } };
            api.post.mockResolvedValueOnce({ data: payload });

            const result = await EmissaoEnergiaService.gravarEmissaoEnergia(values);

            expect(api.post).toHaveBeenCalledWith('/emissaoEnergia/criarEmissao', values);
            expect(result).toEqual(payload);
        });

        it('erro padronizado quando falha', async () => {
            api.post.mockRejectedValueOnce(new Error('fail'));

            await expect(
                EmissaoEnergiaService.gravarEmissaoEnergia({} as any)
            ).rejects.toMatchObject({
                success: false,
                message: 'Erro ao gravar emissão de energia\n',
            });
            expect(api.post).toHaveBeenCalled();
        });
    });

    describe('editarEmissaoEnergia', () => {
        it('PUT correto e retorno do payload', async () => {
            const values = { id: 5, data: '05/03/2024', kwhConsumido: 88.8 } as any;
            const payload = { success: true };
            api.put.mockResolvedValueOnce({ data: payload });

            const result = await EmissaoEnergiaService.editarEmissaoEnergia(values);

            expect(api.put).toHaveBeenCalledWith('/emissaoEnergia/editarEmissao', values);
            expect(result).toEqual(payload);
        });

        it('erro padronizado quando falha', async () => {
            api.put.mockRejectedValueOnce(new Error('nope'));

            await expect(
                EmissaoEnergiaService.editarEmissaoEnergia({} as any)
            ).rejects.toMatchObject({
                success: false,
                message: 'Erro ao editar emissão de energia\n',
            });
            expect(api.put).toHaveBeenCalled();
        });
    });

    describe('excluirEmissaoEnergia', () => {
        it('DELETE com params e retorno do payload', async () => {
            const payload = { success: true };
            api.delete.mockResolvedValueOnce({ data: payload });

            const result = await EmissaoEnergiaService.excluirEmissaoEnergia(42);

            expect(api.delete).toHaveBeenCalledWith('/emissaoEnergia/excluirEmissao', {
                params: { id: 42 },
            });
            expect(result).toEqual(payload);
        });

        it('erro padronizado quando falha', async () => {
            api.delete.mockRejectedValueOnce(new Error('rip'));

            await expect(EmissaoEnergiaService.excluirEmissaoEnergia(1)).rejects.toMatchObject({
                success: false,
                message: 'Erro ao excluir emissão de energia\n',
            });
            expect(api.delete).toHaveBeenCalled();
        });
    });
});
