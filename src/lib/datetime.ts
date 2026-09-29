/**
 * Formatuje Instant z serwera (ISO-8601 UTC) na czytelny ciąg
 * w strefie czasowej przeglądarki. Strefa jest zawsze widoczna w wyniku.
 */
export function formatDateTime(isoUtc: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(isoUtc))
}
