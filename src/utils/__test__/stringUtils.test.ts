import { formatCpf, passwordValidationMessage } from '../stringUtils';

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
