export interface ResetPasswordRequestDTO {
    email: string;
    token: string;
    novaSenha: string;
    confirmarSenha: string;
}
