
import api from '../api';
import { CombustivelDTO } from '../../dto/combustivel/CombustivelDTO';

class CombustivelService {

    async getAll(): Promise<CombustivelDTO[] | null> {
        try {
            const response = await api.get('/combustivel/getAll'); 
            return response.data.data as CombustivelDTO[]; 
        } catch (e) {
            return null;
        }
    }

}

export default new CombustivelService();