
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
