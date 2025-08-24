

export interface UsuarioDTO {
    id?: number;
    nome: string;
    dataNascimento: string;
    cpf: string;
    estadoId: number;
    estadoNome?: string;
    email: string;
    senha?: string;
}
