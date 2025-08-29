/*
rota:minhasEmissoes/{endpoint}
[HttpGet("msgGemini")]
public async Task<ActionResult<ServiceResult<string>>> GetMsgGemini()
[HttpGet("combustivelMaisUtilizado")]
public async Task<ActionResult<ServiceResult<string>>> GetCombustivelMaisUtilizado()
[HttpGet("percentualReducao")]
public async Task<ActionResult<ServiceResult<decimal>>> GetPercentualReducao()
[HttpGet("mediaTrimestre")]
public async Task<ActionResult<ServiceResult<decimal>>> GetMediaTrimestre()
[HttpGet("mediaEstado")]
public async Task<ActionResult<ServiceResult<decimal>>> GetMediaEstado()
[HttpGet("totalizadoresMensais")]
public async Task<ActionResult<ServiceResult<ChartJsFormatDTO>>> GetTotalizadoresMensais([FromQuery] int ano)
[HttpGet("totalPorCategoria")]
public async Task<ActionResult<ServiceResult<ChartJsFormatDTO>>> GetTotalPorCategoria([FromQuery] int ano, [FromQuery] int? mes = 0)
    public class ChartJsFormatDTO
    {

        [Required]
        public string[] Labels { get; set; } = Array.Empty<string>();

        [Required]
        public decimal[] Data { get; set; } = Array.Empty<decimal>();

    }
*/

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

