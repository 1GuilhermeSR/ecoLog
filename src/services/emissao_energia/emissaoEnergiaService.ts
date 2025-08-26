import { ServiceResultDTO } from "../../dto/ServiceResultDTO";
import api from '../api';
import { normalizeDate } from '../../utils/dateUtils';
import { EmissaoEnergiaUpsertDTO } from "../../dto/emissao_energia/EmissaoEnergiaUpsertDTO";
class EmissaoEnergiaService {

    async getEmissaoByUser(): Promise<ServiceResultDTO> {
        try {
            const response = await api.get<ServiceResultDTO>('/emissaoEnergia/getEmissaoByUser');
            if (response.data.success && Array.isArray(response.data.data)) {
                response.data.data = response.data.data.map((item: any) => ({
                    ...item,
                    data: normalizeDate(item.data),
                }));
            }
            return response.data;
        } catch (error) {
            throw { success: false, message: 'Erro ao buscar emissões de energia\n', error };
        }
    }

    async gravarEmissaoEnergia(values: EmissaoEnergiaUpsertDTO): Promise<ServiceResultDTO> {
        try {
            const response = await api.post<ServiceResultDTO>('/emissaoEnergia/criarEmissao', values);
            return response.data;
        } catch (error) {
            throw { success: false, message: 'Erro ao gravar emissão de energia\n', error };
        }
    }

    async editarEmissaoEnergia(values: EmissaoEnergiaUpsertDTO): Promise<ServiceResultDTO> {
        try {
            const response = await api.put<ServiceResultDTO>('/emissaoEnergia/editarEmissao', values);            
            return response.data;
        } catch (error) {
            throw { success: false, message: 'Erro ao editar emissão de energia\n', error };
        }
    }

    async excluirEmissaoEnergia(id: number): Promise<ServiceResultDTO> {
        try {
            const response = await api.delete<ServiceResultDTO>('/emissaoEnergia/excluirEmissao', { params: { id } });
            return response.data;
        } catch (error) {
            throw { success: false, message: 'Erro ao excluir emissão de energia\n', error };
        }
    }

}

export default new EmissaoEnergiaService();
