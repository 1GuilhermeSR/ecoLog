export interface AuthResponseDTO {
    success: boolean;
    message: string;
    data?: {
        accessToken: string;
        tokenType: string;
        expiresIn: number;
        usuario: {
            id: number;
            nome: string;
            cpf: string;
            email: string;
            dataNascimento: string;
            estadoId: number;
            estadoNome: string;
        };
    };
}