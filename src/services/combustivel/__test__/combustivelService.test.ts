import CombustivelService from '../combustivelService';

jest.mock('../../api', () => ({
    __esModule: true,
    default: { get: jest.fn() },
}));
const api = require('../../api').default as { get: jest.Mock };

describe('CombustivelService.getAll', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('retorna a lista de combustíveis quando a API responde sucesso', async () => {
        const payload = [
            { id: 1, nome: 'Gasolina', fatorEmissao: 2.3 },
            { id: 2, nome: 'Etanol', fatorEmissao: 1.5 },
        ];

        api.get.mockResolvedValueOnce({
            data: { data: payload },
        });

        const result = await CombustivelService.getAll();

        expect(api.get).toHaveBeenCalledWith('/combustivel/getAll');

        expect(result).toEqual(payload);
    });

    it('retorna null quando a API lança erro', async () => {
        api.get.mockRejectedValueOnce(new Error('network down'));

        const result = await CombustivelService.getAll();

        expect(api.get).toHaveBeenCalledWith('/combustivel/getAll');
        expect(result).toBeNull();
    });
});
