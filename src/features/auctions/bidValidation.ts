/**
 * Parsuje wartość z pola kwoty stawki (string → grosze).
 * Zwraca kwotę w najmniejszych jednostkach waluty lub null gdy niepoprawna.
 */
export function parseBidAmount(value: string): number | null {
  if (!value) return null
  const minor = Math.round(parseFloat(value) * 100)
  if (isNaN(minor) || minor <= 0) return null
  return minor
}
