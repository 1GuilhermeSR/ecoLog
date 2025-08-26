
import api from '../api';
import { EnergiaDTO } from '../../dto/energia/EnergiaDTO';

class EnergiaService {

    async getLast(): Promise<EnergiaDTO | null> {
        try {
            const response = await api.get('/energia/getLast'); 
            return response.data.data as EnergiaDTO; 
        } catch (e) {
            return null;
        }
    }

}

export default new EnergiaService();