# ReachSky — frontend

Frontend aplikacji ReachSky: platforma aukcyjna zasobów nietrwałych w czasie.

Kontekst domenowy: [`../PROJECT.md`](../PROJECT.md).

---

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja startuje na `http://localhost:5173`.

**Wymagania wstepne:** backend musi dzialac na `http://localhost:8080`.
Bez backenduu zadania wymagajace danych z API zwroca blad — to oczekiwane zachowanie.
Aby uruchomic backend lokalnie, przejdz do repo `../backend` i postepuj zgodnie z jego README.

---

## Typy API

Typy odpowiedzi API sa **generowane automatycznie** ze specyfikacji OpenAPI backendu.
Zrodlo prawdy: `../backend/docs/openapi.json`.

```bash
npm run generate:api
```

Nigdy nie edytuj recznie plikow w `src/api/generated/` — sa nadpisywane przy kazdej regeneracji.
Wygenerowane pliki sa commitowane, zeby CI budowal sie bez repozytorium backendu obok.

Kolejnosc zmian kontraktu:
1. backend: zmiana + test kontraktowy + aktualizacja `../backend/docs/openapi.json`
2. frontend: `npm run generate:api`, dostosowanie kodu, commit

---

## Obraz Docker

Obraz publikowany na Docker Hub przy każdym push na `main`.

```
<DOCKERHUB_USERNAME>/reachsky-frontend:<sha>   # konkretna rewizja
<DOCKERHUB_USERNAME>/reachsky-frontend:latest  # ostatni build z main
```

### Uruchomienie konkretnej wersji

```bash
docker run -p 8080:8080 \
  -e API_URL=http://backend:8080 \
  -e OIDC_AUTHORITY=http://keycloak:8180/realms/reachsky \
  -e OIDC_CLIENT_ID=reachsky-frontend \
  <DOCKERHUB_USERNAME>/reachsky-frontend:<sha>
```

### Zmienne środowiskowe

| Zmienna | Opis | Przykład |
|---|---|---|
| `API_URL` | Adres bazowy backendu (bez `/api`) | `http://backend:8080` |
| `OIDC_AUTHORITY` | URL realm Keycloak | `https://auth.example.com/realms/reachsky` |
| `OIDC_CLIENT_ID` | ID klienta OIDC | `reachsky-frontend` |

Zmienne są wstrzykiwane przez entrypoint do `window.__RUNTIME_CONFIG__` —
kontener nie wymaga przebudowy przy zmianie konfiguracji.

---

## Stack

- React 18 + TypeScript (tryb `strict`)
- Vite
- TanStack Query — stan serwerowy
- Tailwind CSS
- STOMP/WebSocket — live updates stanu aukcji
- Vitest + Testing Library, Playwright (E2E)
