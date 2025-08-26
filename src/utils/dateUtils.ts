import dayjs, { Dayjs } from './dayjs';

/**
 * Normaliza uma data (string DateOnly "YYYY-MM-DD", ISO, Date, Dayjs)
 * para um objeto Dayjs. Retorna null se vazio/indefinido.
 */
export function normalizeDate(d: unknown): Dayjs | null {
    if (!d) return null;
    if ((d as any)?.isDayjs) return d as Dayjs;
    if (d instanceof Date) return dayjs(d);

    if (typeof d === 'string') {
        // DateOnly do .NET => "YYYY-MM-DD"
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
            return dayjs(d, 'YYYY-MM-DD');
        }
        // Tenta parse geral (ISO etc.)
        return dayjs(d);
    }

    // Última tentativa: deixar o dayjs tentar parsear
    return dayjs(d as any);
}

/** Formata data com fallback seguro */
export function formatDate(d: unknown, format = 'DD/MM/YYYY'): string {
    const parsed = normalizeDate(d);
    return parsed && parsed.isValid() ? parsed.format(format) : '';
}
