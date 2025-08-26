export interface EmissaoCombustivelUpsertDTO {
    id?: number;
    idEstado?: number;
    data: string;
    kmPercorrido: number;
    idCombustivel: number;
    mediaKm: number;
    co2Emitido: number;
    fatorEmissao: number;
}