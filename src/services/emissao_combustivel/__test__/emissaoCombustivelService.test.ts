import EmissaoCombustivelService from '../emissaoCombustivelService';

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

describe('EmissaoCombustivelService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getEmissaoByUser', () => {
        it('transforma "data" em objeto Dayjs válido quando payload é array', async () => {
            const payload = {
                success: true,
                data: [
                    { id: 1, data: '2024-01-15', kmPercorrido: 100 },
                    { id: 2, data: '2024-02-01', kmPercorrido: 50 },
                ],
            };
            api.get.mockResolvedValueOnce({ data: payload });

            const result = await EmissaoCombustivelService.getEmissaoByUser();

            expect(api.get).toHaveBeenCalledWith('/emissaoCombustivel/getEmissaoByUser');
            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(2);

            const d0 = (result.data as any[])[0].data;
            const d1 = (result.data as any[])[1].data;

            expect(typeof d0).toBe('object');
            expect(typeof d1).toBe('object');
            expect(d0?.isValid?.()).toBe(true);
            expect(d1?.isValid?.()).toBe(true);

            expect((result.data as any[])[0]).toMatchObject({ id: 1, kmPercorrido: 100 });
            expect((result.data as any[])[1]).toMatchObject({ id: 2, kmPercorrido: 50 });
        });

        it('retorna payload sem mapear quando "data" não é array', async () => {
            const payload = { success: true, data: { id: 99, data: '2024-03-10' } };
            api.get.mockResolvedValueOnce({ data: payload });

            const result = await EmissaoCombustivelService.getEmissaoByUser();

            expect(api.get).toHaveBeenCalledWith('/emissaoCombustivel/getEmissaoByUser');
            expect(result).toEqual(payload);
        });

        it('rejeita com objeto de erro padronizado quando a API falha', async () => {
            api.get.mockRejectedValueOnce(new Error('boom'));

            await expect(EmissaoCombustivelService.getEmissaoByUser()).rejects.toMatchObject({
                success: false,
                message: 'Erro ao buscar emissões de combustíveis\n',
            });
            expect(api.get).toHaveBeenCalledWith('/emissaoCombustivel/getEmissaoByUser');
        });
    });

    describe('gravarEmissaoCombustivel', () => {
        it('POST correto e retorno do payload', async () => {
            const values = { id: 0, data: '10/03/2024', kmPercorrido: 100 } as any;
            const payload = { success: true, data: { id: 123 } };
            api.post.mockResolvedValueOnce({ data: payload });

            const result = await EmissaoCombustivelService.gravarEmissaoCombustivel(values);

            expect(api.post).toHaveBeenCalledWith('/emissaoCombustivel/criarEmissao', values);
            expect(result).toEqual(payload);
        });

        it('erro padronizado quando falha', async () => {
            api.post.mockRejectedValueOnce(new Error('fail'));

            await expect(
                EmissaoCombustivelService.gravarEmissaoCombustivel({} as any)
            ).rejects.toMatchObject({
                success: false,
                message: 'Erro ao gravar emissão de combustíveis\n',
            });
            expect(api.post).toHaveBeenCalled();
        });
    });

    describe('editarEmissaoCombustivel', () => {
        it('PUT correto e retorno do payload', async () => {
            const values = { id: 5, data: '05/03/2024', kmPercorrido: 180 } as any;
            const payload = { success: true };
            api.put.mockResolvedValueOnce({ data: payload });

            const result = await EmissaoCombustivelService.editarEmissaoCombustivel(values);

            expect(api.put).toHaveBeenCalledWith('/emissaoCombustivel/editarEmissao', values);
            expect(result).toEqual(payload);
        });

        it('erro padronizado quando falha', async () => {
            api.put.mockRejectedValueOnce(new Error('nope'));

            await expect(
                EmissaoCombustivelService.editarEmissaoCombustivel({} as any)
            ).rejects.toMatchObject({
                success: false,
                message: 'Erro ao editar emissão de combustíveis\n',
            });
            expect(api.put).toHaveBeenCalled();
        });
    });

    describe('excluirEmissaoCombustivel', () => {
        it('DELETE com params e retorno do payload', async () => {
            const payload = { success: true };
            api.delete.mockResolvedValueOnce({ data: payload });

            const result = await EmissaoCombustivelService.excluirEmissaoCombustivel(42);

            expect(api.delete).toHaveBeenCalledWith('/emissaoCombustivel/excluirEmissao', {
                params: { id: 42 },
            });
            expect(result).toEqual(payload);
        });

        it('erro padronizado quando falha', async () => {
            api.delete.mockRejectedValueOnce(new Error('rip'));

            await expect(
                EmissaoCombustivelService.excluirEmissaoCombustivel(1)
            ).rejects.toMatchObject({
                success: false,
                message: 'Erro ao excluir emissão de combustíveis\n',
            });
            expect(api.delete).toHaveBeenCalled();
        });
    });
});
