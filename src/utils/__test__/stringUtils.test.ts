import { formatCpf, passwordValidationMessage, isValidCpf, cpfValidationMessage } from '../stringUtils';

describe('formatCpf', () => {
    it.each([
        ['12345678901', '123.456.789-01'],
        ['123.456-789 01', '123.456.789-01'],
        ['12345678901234', '123.456.789-01'],
        ['00000000000', '000.000.000-00'],
    ])('formata "%s" como "%s"', (raw, expected) => {
        expect(formatCpf(raw)).toBe(expected);
    });

    it.each([
        ['', ''],
        ['1', '1'],
        ['12', '12'],
        ['123', '123'],
        ['1234', '123.4'],
        ['12345', '123.45'],
        ['123456', '123.456'],
        ['1234567', '123.456.7'],
        ['12345678', '123.456.78'],
        ['123456789', '123.456.789'],
        ['1234567890', '123.456.789-0'],
        ['12345678901', '123.456.789-01'],
    ])('formata progressivamente "%s" -> "%s"', (raw, expected) => {
        expect(formatCpf(raw)).toBe(expected);
    });
});

describe('isValidCpf', () => {
    it.each([
        // válidos (sem máscara)
        '52998224725',
        '11144477735',
        '16899535009',
        '93541134780',
        '12345678909',
        // válidos (com máscara)
        '529.982.247-25',
        '111.444.777-35',
        '168.995.350-09',
        '935.411.347-80',
    ])('retorna true para CPF válido: %s', (cpf) => {
        expect(isValidCpf(cpf)).toBe(true);
    });

    it.each([
        // dígitos repetidos
        '00000000000',
        '11111111111',
        '222.222.222-22',
        // DV inválido (altera o último dígito de um válido)
        '52998224724',
        '11144477734',
        '93541134781',
        // tamanhos inválidos
        '',
        '1234567890',       // 10 dígitos
        '123456789012',     // 12 dígitos
        // com letras/símbolos que viram vazio ou não batem 11 dígitos
        'abc.def.ghi-jk',
    ])('retorna false para CPF inválido: %s', (cpf) => {
        expect(isValidCpf(cpf as string)).toBe(false);
    });

    it('aceita strings com ruído que ainda formam um CPF válido', () => {
        expect(isValidCpf('  529-982*247..25 ')).toBe(true);
    });
});

describe('cpfValidationMessage', () => {
    it('pede preenchimento quando vazio/undefined', () => {
        expect(cpfValidationMessage()).toBe('Por Favor, preencha seu CPF!');
        expect(cpfValidationMessage('')).toBe('Por Favor, preencha seu CPF!');
    });

    it('retorna erro para tamanho inválido ou dígitos repetidos', () => {
        expect(cpfValidationMessage('123')).toBe('CPF inválido!');
        expect(cpfValidationMessage('000.000.000-00')).toBe('CPF inválido!');
    });

    it('retorna erro para DV inválido', () => {
        expect(cpfValidationMessage('529.982.247-24')).toBe('CPF inválido!');
    });

    it('retorna vazio quando o CPF é válido (com e sem máscara)', () => {
        expect(cpfValidationMessage('52998224725')).toBe('');
        expect(cpfValidationMessage('529.982.247-25')).toBe('');
    });

    it('trata strings com espaços/ruído', () => {
        expect(cpfValidationMessage('  935.411-347..80')).toBe('');
    });

    it('retorna erro quando há caracteres mas nenhum dígito útil', () => {
        expect(cpfValidationMessage('   abc   ')).toBe('CPF inválido!');
    });
});

describe('passwordValidationMessage', () => {
    it('exige valor', () => {
        expect(passwordValidationMessage()).toBe('Por favor, preencha sua senha!');
        expect(passwordValidationMessage('')).toBe('Por favor, preencha sua senha!');
    });

    it('valida tamanho mínimo', () => {
        expect(passwordValidationMessage('A1a')).toBe('A senha deve ter no mínimo 6 caracteres!');
    });

    it('exige letra minúscula', () => {
        expect(passwordValidationMessage('ABC123')).toBe('A senha precisa de pelo menos uma letra minúscula.');
    });

    it('exige letra maiúscula', () => {
        expect(passwordValidationMessage('abc123')).toBe('A senha precisa de pelo menos uma letra MAIÚSCULA.');
    });

    it('exige número', () => {
        expect(passwordValidationMessage('Abcdef')).toBe('A senha precisa de pelo menos um número.');
    });

    it('retorna vazio quando a senha é válida', () => {
        expect(passwordValidationMessage('Abc123')).toBe('');
        expect(passwordValidationMessage('Aa1aaa')).toBe('');
    });
});
