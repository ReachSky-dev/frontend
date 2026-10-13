# CLAUDE.md — reachsky-frontend

> Reguły szczegółowe dla tego repo. Uzupełniają workspace `../CLAUDE.md`, nie zastępują go.

## Konfiguracja runtime

`public/config.js` jest generowany przez `docker/entrypoint.sh` przy każdym starcie
kontenera i zawiera zmienne środowiskowe (URL backendu, Keycloak, itp.).

**`config.js` musi być serwowany z `Cache-Control: no-store`.**
Cache'owanie go (przez przeglądarkę lub CDN) łamie cały model konfiguracji
niezależnej od obrazu — zmiany konfiguracji wchodzą wtedy z losowym opóźnieniem.

Reguła nginx zapewniająca brak cache jest w `nginx.conf` jako `location = /config.js`.
Jeśli kiedykolwiek zmienisz konfigurację serwowania plików statycznych (np. dodasz
`expires` na `*.js`), upewnij się, że `location = /config.js` nadal ma pierwszeństwo —
`=` (exact match) ma wyższy priorytet niż regexp i prefix, więc nie może być przesłonięty,
**o ile nie dodasz identycznego `location = /config.js` w innym bloku**.

## Stack i konwencje

- React 18 + TypeScript, Vite, Tailwind CSS v4
- TanStack Query — stan serwerowy; nie trzymaj danych API w `useState`
- Typy API generowane z OpenAPI backendu: `src/api/generated/schema.ts`
  Nie edytuj ręcznie — regeneruj przez `npm run generate:api`
- System tokenów kolorów: `src/styles/tokens.css`; zero hardkodowanych hex-ów w komponentach
