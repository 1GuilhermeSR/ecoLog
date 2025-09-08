import dayjs from '../dayjs';

describe('dayjs wrapper (config)', () => {
    it('usa locale pt-br', () => {
        expect(dayjs.locale()).toBe('pt-br');
    });

    it('parseia datas com customParseFormat (DD/MM/YYYY) em modo estrito', () => {
        const ok = dayjs('10/03/2024', 'DD/MM/YYYY', true);   
        const bad = dayjs('31/02/2024', 'DD/MM/YYYY', true);  

        expect(ok.isValid()).toBe(true);
        expect(bad.isValid()).toBe(false);
    });

    it('formata nomes em pt-br (dia e mês)', () => {
        const d = dayjs('2024-03-10'); 
        expect(d.format('dddd')).toBe('domingo');
        expect(d.format('MMMM')).toBe('março');
    });
});
