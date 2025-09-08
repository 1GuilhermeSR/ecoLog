import EstadoService from '../estadoService';

jest.mock('../../api', () => ({
    __esModule: true,
    default: { get: jest.fn() },
}));

const api = require('../../api').default as { get: jest.Mock };

describe('EstadoService.getAllEstado', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('retorna a lista quando a API responde com sucesso', async () => {
        const estados = [
            { id: 1, nome: 'São Paulo' },
            { id: 2, nome: 'Rio de Janeiro' },
        ];

        api.get.mockResolvedValueOnce({
            data: { data: estados },
        });

        const result = await EstadoService.getAllEstado();

        expect(api.get).toHaveBeenCalledWith('/estado/getAll');

        expect(result).toEqual(estados);
    });

    it('retorna [] quando a API lança erro', async () => {
        api.get.mockRejectedValueOnce(new Error('falhou'));

        const result = await EstadoService.getAllEstado();

        expect(api.get).toHaveBeenCalledWith('/estado/getAll');
        expect(result).toEqual([]);
    });
});
