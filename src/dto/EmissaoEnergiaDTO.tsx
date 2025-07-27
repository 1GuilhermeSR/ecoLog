import { Dayjs } from 'dayjs';

export interface EmissaoEnergiaDTO {
  id?: number;
  data: Dayjs;          
  kwhConsumido: number; 
  co2Emitido: number;   
}