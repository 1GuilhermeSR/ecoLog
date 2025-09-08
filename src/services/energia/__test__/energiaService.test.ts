import EnergiaService from '../energiaService';

jest.mock('../../api', () => ({
    __esModule: true,
    default: { get: jest.fn() },
}));

const api = require('../../api').default as { get: jest.Mock };

describe('EnergiaService.getLast', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('retorna o último registro quando a API responde com sucesso', async () => {
        const payload = {
            id: 42,
            nome: 'Energia Elétrica',
            fatorEmissao: 0.054,
        } as any; 

        api.get.mockResolvedValueOnce({
            data: { data: payload },
        });

        const result = await EnergiaService.getLast();

        expect(api.get).toHaveBeenCalledWith('/energia/getLast');

        expect(result).toEqual(payload);
    });

    it('retorna null quando a API lança erro', async () => {
        api.get.mockRejectedValueOnce(new Error('boom'));

        const result = await EnergiaService.getLast();

        expect(api.get).toHaveBeenCalledWith('/energia/getLast');
        expect(result).toBeNull();
    });
});
