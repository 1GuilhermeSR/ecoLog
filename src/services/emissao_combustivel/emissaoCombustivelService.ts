import { ServiceResultDTO } from "../../dto/ServiceResultDTO";
import api from '../api';
import { normalizeDate } from '../../utils/dateUtils';
import { EmissaoCombustivelUpsertDTO } from "../../dto/emissao_combustivel/emissaoCombustivelUpsertDTO";

class EmissaoCombustivelService {

    async getEmissaoByUser(): Promise<ServiceResultDTO> {
        try {
            const response = await api.get<ServiceResultDTO>('/emissaoCombustivel/getEmissaoByUser');
            if (response.data.success && Array.isArray(response.data.data)) {
                response.data.data = response.data.data.map((item: any) => ({
                    ...item,
                    data: normalizeDate(item.data),
                }));
            }
            return response.data;
        } catch (error) {
            throw { success: false, message: 'Erro ao buscar emissões de combustíveis\n', error };
        }
    }

    async gravarEmissaoCombustivel(values: EmissaoCombustivelUpsertDTO): Promise<ServiceResultDTO> {
        try {        
            const response = await api.post<ServiceResultDTO>('/emissaoCombustivel/criarEmissao', values);
            return response.data;
        } catch (error) {
            throw { success: false, message: 'Erro ao gravar emissão de combustíveis\n', error };
        }
    }

    async editarEmissaoCombustivel(values: EmissaoCombustivelUpsertDTO): Promise<ServiceResultDTO> {
        try {            
            const response = await api.put<ServiceResultDTO>('/emissaoCombustivel/editarEmissao', values);
            return response.data;
        } catch (error) {
            throw { success: false, message: 'Erro ao editar emissão de combustíveis\n', error };
        }
    }

    async excluirEmissaoCombustivel(id: number): Promise<ServiceResultDTO> {
        try {
            const response = await api.delete<ServiceResultDTO>('/emissaoCombustivel/excluirEmissao', { params: { id } });
            return response.data;
        } catch (error) {
            throw { success: false, message: 'Erro ao excluir emissão de combustíveis\n', error };
        }
    }

}

export default new EmissaoCombustivelService();
