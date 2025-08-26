import { Dayjs } from 'dayjs';

export interface EmissaoCombustivelDTO {
  id?: number;
  data: Dayjs;
  idEstado?: number;
  idUsuario?: number;
  kmPercorrido: number;
  idCombustivel?: number;
  nomeCombustivel?: string;
  mediaKm: number;   
  co2Emitido: number;   
  fatorEmissao: number;   
}