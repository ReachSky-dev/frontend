/**
 * Formatuje kwotę w najmniejszych jednostkach waluty (grosze, centy itp.)
 * do czytelnego ciągu z symbolem waluty.
 * Waluta jest zawsze jawna — nigdy nie ukrywamy jednostki.
 */
export function formatMoney(amountInMinorUnits: number, currency: string): string {
  const amount = amountInMinorUnits / 100
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
