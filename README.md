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

Typy odpowiedzi API sa **generowane automatycznie z OpenAPI backendu** — nie sa przepisywane recznie.

```bash
# Po uruchomieniu backendu (backend musi byc dostepny na :8080):
npm run generate-api
```

Nigdy nie edytuj recznie plikow w `src/api/generated/`.
Rozjazd recznie utrzymywanych typow miedzy repo to najczestsze ciche awarie w projektach dwu-repo.

Kolejnosc zmian kontraktu:
1. backend: zmiana + test kontraktowy + zaktualizowany plik OpenAPI
2. frontend: `npm run generate-api`, dostosowanie kodu

---

## Stack

- React 18 + TypeScript (tryb `strict`)
- Vite
- TanStack Query — stan serwerowy
- Tailwind CSS
- STOMP/WebSocket — live updates stanu aukcji
- Vitest + Testing Library, Playwright (E2E)
