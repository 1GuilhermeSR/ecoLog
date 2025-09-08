import { normalizeDate, formatDate } from '../dateUtils';
import dayjs from '../dayjs';

describe('normalizeDate', () => {
    it('retorna null para valores vazios', () => {
        expect(normalizeDate(undefined)).toBeNull();
        expect(normalizeDate(null as unknown as string)).toBeNull();
        expect(normalizeDate('' as unknown as string)).toBeNull();
        expect(normalizeDate(0 as unknown as string)).toBeNull(); 
    });

    it('converte Date para Dayjs', () => {
        const d = new Date(2024, 0, 10); 
        const dj = normalizeDate(d);
        expect(dj).not.toBeNull();
        expect(dj!.isValid()).toBe(true);
        expect(dj!.format('DD/MM/YYYY')).toBe('10/01/2024');
    });

    it('mantém a mesma data quando recebe um Dayjs', () => {
        const src = dayjs('2024-01-15');
        const dj = normalizeDate(src)!; 
        expect(dj.isValid()).toBe(true);
        expect(dj.format('YYYY-MM-DD')).toBe('2024-01-15');
    });

    it('interpreta string DateOnly "YYYY-MM-DD"', () => {
        const dj = normalizeDate('2024-06-30')!;
        expect(dj.isValid()).toBe(true);
        expect(dj.format('DD/MM/YYYY')).toBe('30/06/2024');
    });

    it('interpreta string datetime local (sem Z)', () => {
        const dj = normalizeDate('2024-03-05T12:34:56')!;
        expect(dj.isValid()).toBe(true);
        expect(dj.format('DD/MM/YYYY')).toBe('05/03/2024');
    });

    it('aceita timestamp numérico via fallback do dayjs', () => {
        const ts = new Date(2024, 4, 20).getTime(); // 20/05/2024
        const dj = normalizeDate(ts as unknown as object)!;
        expect(dj.isValid()).toBe(true);
        expect(dj.format('DD/MM/YYYY')).toBe('20/05/2024');
    });
});

describe('formatDate', () => {
    it('formata corretamente com default "DD/MM/YYYY"', () => {
        expect(formatDate('2024-12-01')).toBe('01/12/2024');
        expect(formatDate(new Date(2024, 1, 1))).toBe('01/02/2024');
    });

    it('permite customizar o formato', () => {
        expect(formatDate('2024-07-09', 'YYYY')).toBe('2024');
        expect(formatDate(dayjs('2024-07-09'), 'MM-YYYY')).toBe('07-2024');
    });

    it('retorna string vazia para entradas inválidas', () => {
        expect(formatDate('not-a-date')).toBe('');
        expect(formatDate({} as any)).toBe('');
    });

    it('retorna string vazia para nulos/indefinidos', () => {
        expect(formatDate(undefined)).toBe('');
        expect(formatDate(null as any)).toBe('');
    });
});
