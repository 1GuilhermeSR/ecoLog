
export const mockUserService = {
    login: jest.fn(),
    register: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
};

export const mockEstadoService = {
    getAllEstado: jest.fn(),
};


export const mockEmissaoEnergiaService = {
    getEmissaoByUser: jest.fn(),
    gravarEmissaoEnergia: jest.fn(),
    editarEmissaoEnergia: jest.fn(),
    excluirEmissaoEnergia: jest.fn(),
};

mockEstadoService.getAllEstado.mockResolvedValue([{ id: 1, nome: 'São Paulo' }]);

export const mockEnergiaService = {
    getLast: jest.fn(),
};

jest.mock('../../services/usuario/usuarioService', () => ({
    __esModule: true,
    default: mockUserService,
}));

jest.mock('../../services/estado/estadoService', () => ({
    __esModule: true,
    default: mockEstadoService,
}));

jest.mock('../../services/emissao_energia/emissaoEnergiaService', () => ({
    __esModule: true,
    default: mockEmissaoEnergiaService,
}));

jest.mock('../../services/energia/energiaService', () => ({
    __esModule: true,
    default: mockEnergiaService,
}));


jest.mock('../../utils/stringUtils', () => {
    const actual = jest.requireActual('../../utils/stringUtils');
    return {
        ...actual,
        passwordValidationMessage: (_s: string) => '',
    };
});
