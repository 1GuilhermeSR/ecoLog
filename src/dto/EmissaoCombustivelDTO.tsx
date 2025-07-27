import { Dayjs } from 'dayjs';

export interface EmissaoCombustivelDTO {
  id?: number;
  data: Dayjs;          
  kmPercorrido: number;
  IdCombustivel?: number;
  combustivel: string;
  mediaKm: number;   
  co2Emitido: number;   
  fatorEmissao: number;   
}