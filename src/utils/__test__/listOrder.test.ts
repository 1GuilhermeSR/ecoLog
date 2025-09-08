import dayjs from '../dayjs';
import {
    sortInitialByDateDesc,
    insertByDateDesc,
    upsertByIdMaintainDateDesc,
    removeById,
} from '../listOrder';

type Item = { id: number | string; data?: any; label?: string };

const d = (s: string) => s; 

describe('listOrder utils', () => {
    const baseUnsorted: Item[] = [
        { id: 2, data: d('2024-02-01') },     
        { id: 3, data: d('2024-03-05') },   
        { id: 1, data: d('2024-01-15') },     
        { id: 4, data: 'not-a-date' },        
    ];

    it('sortInitialByDateDesc — ordena por data DESC e empurra inválidas para o fim', () => {
        const res = sortInitialByDateDesc(baseUnsorted);
        expect(res.map(x => x.id)).toEqual([3, 2, 1, 4]);
    });

    it('sortInitialByDateDesc — aceita Date/Dayjs/string (mistos)', () => {
        const mixed: Item[] = [
            { id: 'A', data: new Date(2024, 5, 1) },     
            { id: 'B', data: dayjs('2024-04-10') },   
            { id: 'C', data: '2024-05-15' },             
        ];
        const res = sortInitialByDateDesc(mixed);
        expect(res.map(x => x.id)).toEqual(['A', 'C', 'B']); 
    });

    describe('insertByDateDesc', () => {
        const baseSorted: Item[] = [
            { id: 3, data: d('2024-03-05') },
            { id: 2, data: d('2024-02-01') },
            { id: 1, data: d('2024-01-15') },
        ];

        it('insere no meio mantendo DESC', () => {
            const inserted = { id: 9, data: d('2024-02-10') }; 
            const res = insertByDateDesc(baseSorted, inserted);
            expect(res.map(x => x.id)).toEqual([3, 9, 2, 1]);
        });

        it('insere no início quando data é a mais recente', () => {
            const inserted = { id: 10, data: d('2025-01-01') };
            const res = insertByDateDesc(baseSorted, inserted);
            expect(res.map(x => x.id)).toEqual([10, 3, 2, 1]);
        });

        it('insere no fim quando data é inválida/ausente', () => {
            const res1 = insertByDateDesc(baseSorted, { id: 11, data: null });
            expect(res1.map(x => x.id)).toEqual([3, 2, 1, 11]);

            const res2 = insertByDateDesc(baseSorted, { id: 12, data: 'not-a-date' });
            expect(res2.map(x => x.id)).toEqual([3, 2, 1, 12]);
        });

        it('datas iguais — novo item entra após os já existentes (estável p/ iguais)', () => {
            const eq = { id: 12, data: d('2024-03-05') };
            const res = insertByDateDesc(baseSorted, eq);
            expect(res.map(x => x.id)).toEqual([3, 12, 2, 1]); 
        });
    });

    describe('upsertByIdMaintainDateDesc', () => {
        const baseSorted: Item[] = [
            { id: 3, data: d('2024-03-05') },
            { id: 2, data: d('2024-02-01') },
            { id: 1, data: d('2024-01-15') },
        ];

        it('atualiza item existente e recoloca pela nova data (ex: vai para o topo)', () => {
            const edited = { id: 2, data: d('2024-03-10') }; 
            const res = upsertByIdMaintainDateDesc(baseSorted, edited);
            expect(res.map(x => x.id)).toEqual([2, 3, 1]);
        });

        it('atualiza item existente para data antiga (vai para o fim)', () => {
            const edited = { id: 1, data: d('2023-12-31') };
            const res = upsertByIdMaintainDateDesc(baseSorted, edited);
            expect(res.map(x => x.id)).toEqual([3, 2, 1]);
        });

        it('insere novo id na posição correta (sem reordenar todo o array)', () => {
            const novo = { id: 99, data: d('2024-02-05') }; 
            const res = upsertByIdMaintainDateDesc(baseSorted, novo);
            expect(res.map(x => x.id)).toEqual([3, 99, 2, 1]);
        });

        it('datas iguais — novo id entra após os de mesma data', () => {
            const novo = { id: 88, data: d('2024-03-05') }; 
            const res = upsertByIdMaintainDateDesc(baseSorted, novo);
            expect(res.map(x => x.id)).toEqual([3, 88, 2, 1]);
        });
    });

    it('removeById — remove pelo id (string/number compatíveis)', () => {
        const base: Item[] = [
            { id: 3, data: d('2024-03-05') },
            { id: 2, data: d('2024-02-01') },
            { id: 1, data: d('2024-01-15') },
        ];
        expect(removeById(base, 2).map(x => x.id)).toEqual([3, 1]);
        expect(removeById(base, '1').map(x => x.id)).toEqual([3, 2]); 
    });
});
