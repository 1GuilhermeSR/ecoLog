import api from '../api';
import { EstadoDTO } from '../../dto/estado/EstadoDTO';

class EstadoService {
    
    async getAllEstado(): Promise<EstadoDTO[]> {
        try {
            const response = await api.get('/estado/getAll');
            return response.data.data;
        } catch {
            return [];
        }
    }

}

export default new EstadoService();