export interface EmissaoEnergiaUpsertDTO {
    id?: number;          
    data: string;          
    idEnergia: number;
    fatorEmissao: number;
    kwhConsumido: number;
    co2Emitido: number;
    idEstado?: number;     
}
