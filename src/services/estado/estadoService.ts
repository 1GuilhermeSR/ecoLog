
// src/services/authService.ts
import api from '../api';
import { EstadoDTO } from '../../dto/EstadoDTO';

class EstadoService {
    
    async getAllEstado(): Promise<EstadoDTO[]> {
        try {
            const response = await api.get('/estado/getAll');
            console.log('Estados recebidos:', response.data);
            return response.data.data;
        } catch {
            return [];
        }
    }

}

export default new EstadoService();