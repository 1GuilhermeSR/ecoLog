import { ServiceResultDTO } from "../../dto/ServiceResultDTO";
import api from "../api";

export interface ChartJsFormatDTO {
    labels: string[];
    data: number[];
}

class MinhasEmissoesService {

    async getTotalizadoresMensais(ano: number): Promise<ServiceResultDTO> {
        try {
            const response = await api.get<ServiceResultDTO>(
                "/minhasEmissoes/totalizadoresMensais",
                { params: { ano } }
            );

            return response.data;
        } catch (error) {
            throw {
                success: false,
                message: "Erro ao carregar totalizadores mensais\n",
                error,
            };
        }
    }

    async getTotalPorCategoria(ano: number, mes?: number): Promise<ServiceResultDTO> {
        try {
            const response = await api.get<ServiceResultDTO>(
                "/minhasEmissoes/totalPorCategoria",
                { params: { ano, mes: mes ?? 0 } }
            );

            return response.data;
        } catch (error) {
            throw {
                success: false,
                message: "Erro ao carregar totais por categoria\n",
                error,
            };
        }
    }

    async getResumo(): Promise<ServiceResultDTO> {
        try {
            const response = await api.get<ServiceResultDTO>(
                "/minhasEmissoes/resumo"
            );

            return response.data;
        } catch (error) {
            throw {
                success: false,
                message: "Erro ao carregar resumo\n",
                error,
            };
        }
    }
}

export default new MinhasEmissoesService();

