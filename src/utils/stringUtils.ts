
/**
 * Recebe uma string contendo dígitos e formata como CPF:
 * 12345678901 → 123.456.789-01
 */
export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  let formatted = digits.replace(/^(\d{3})(\d)/, '$1.$2')
  formatted = formatted.replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2')
  formatted = formatted.replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, '$1-$2')
  return formatted
}

/*
* Valida a senha de acordo com as regras definidas
*/
export function passwordValidationMessage(value?: string): string {
  if (!value) return 'Por favor, preencha sua senha!';
  if (value.length < 6) return 'A senha deve ter no mínimo 6 caracteres!';
  if (!/[a-z]/.test(value)) return 'A senha precisa de pelo menos uma letra minúscula.';
  if (!/[A-Z]/.test(value)) return 'A senha precisa de pelo menos uma letra MAIÚSCULA.';
  if (!/\d/.test(value)) return 'A senha precisa de pelo menos um número.';
  return '';
}

/**
 * Valida CPF (somente dígitos ou formatado).
 * Rejeita CPFs com 11 dígitos iguais e confere os dígitos verificadores.
 */
export function isValidCpf(input?: string): boolean {
  const cpf = String(input || '').replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let d1 = (soma * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  let d2 = (soma * 10) % 11;
  if (d2 === 10) d2 = 0;
  if (d2 !== Number(cpf[10])) return false;

  return true;
}

/**
 * Retorna mensagem de erro de CPF ou string vazia se for válido.
 */
export function cpfValidationMessage(value?: string): string {
  if (!value) return 'Por Favor, preencha seu CPF!';
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) return 'CPF inválido!';
  return isValidCpf(value) ? '' : 'CPF inválido!';
}