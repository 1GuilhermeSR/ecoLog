import { normalizeDate } from './dateUtils';
import { Dayjs } from 'dayjs';

type WithDate = { data?: Dayjs | Date | string | null | undefined };
type WithId = { id?: number | string };

/** Converte a data para timestamp (ms). Inválida -> -Infinity (vai pro fim). */
function timeValue(d: WithDate['data']): number {
    const dj = d ? normalizeDate(d) : null;
    return dj?.isValid?.() ? dj.valueOf() : -Infinity;
}

/** Ordena por data desc (somente para a carga inicial). */
export function sortInitialByDateDesc<T extends WithDate>(arr: T[]): T[] {
    return [...arr].sort((a, b) => timeValue(b.data) - timeValue(a.data));
}

/** Busca binária para achar o índice de inserção (array já DESC por data). */
function binarySearchDesc<T extends WithDate>(arr: T[], t: number): number {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        const mt = timeValue(arr[mid].data);
        // DESC: se o elemento do meio é mais "recente" ou igual, insere após ele
        if (mt >= t) lo = mid + 1; else hi = mid;
    }
    return lo;
}

/** Insere item numa lista já ordenada por data DESC (sem reordenar tudo). */
export function insertByDateDesc<T extends WithDate>(arr: T[], item: T): T[] {
    const t = timeValue(item.data);
    const idx = binarySearchDesc(arr, t);
    const next = arr.slice();
    next.splice(idx, 0, item);
    return next;
}

/** Upsert por id, removendo (se existir) e recolocando no ponto correto pela data. */
export function upsertByIdMaintainDateDesc<T extends WithId & WithDate>(arr: T[], item: T): T[] {
    const next = arr.slice();
    const key = String(item.id ?? '');

    const curIndex = next.findIndex(x => String(x.id ?? '') === key);
    if (curIndex !== -1) next.splice(curIndex, 1);

    const t = timeValue(item.data);
    const idx = binarySearchDesc(next, t);
    next.splice(idx, 0, item);

    return next;
}

/** Remove por id. */
export function removeById<T extends WithId>(arr: T[], id: number | string): T[] {
    return arr.filter(x => String(x.id ?? '') !== String(id));
}
