
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
