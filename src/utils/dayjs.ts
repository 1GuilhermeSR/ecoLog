import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/pt-br';

dayjs.extend(customParseFormat);
dayjs.locale('pt-br');

export default dayjs;
export type { Dayjs };
