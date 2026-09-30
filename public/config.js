// Wartości domyślne dla developmentu lokalnego.
// W produkcji ten plik jest nadpisywany przez docker/entrypoint.sh
// na podstawie zmiennych środowiskowych kontenera.
window.__RUNTIME_CONFIG__ = {
  apiUrl: '/api',
  oidcAuthority: 'http://localhost:8081/realms/reachsky',
  oidcClientId: 'reachsky-frontend',
}
