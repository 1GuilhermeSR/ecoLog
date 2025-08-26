import { Dayjs } from 'dayjs';

export interface EmissaoEnergiaDTO {
  id?: number;
  idUsuario?: number;
  data: Dayjs;
  idEnergia?: number;
  idEstado?: number;
  fatorEmissao?: number;
  kwhConsumido: number;
  co2Emitido: number;
}