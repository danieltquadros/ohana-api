/**
 * Converte um texto em SLUG técnico (uppercase, sem acentos,
 * com underscores no lugar de espaços/símbolos).
 *
 * Exemplos:
 *   "Porção"              → "PORCAO"
 *   "Pratos Quentes"      → "PRATOS_QUENTES"
 *   "Promoção 50%"        → "PROMOCAO_50"
 *   "Açaí e Sobremesas"   → "ACAI_E_SOBREMESAS"
 */
export function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
