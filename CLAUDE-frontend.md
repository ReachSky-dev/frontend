# CLAUDE.md — frontend (`lastcall-frontend`)

> Ten plik trafia do repo frontendowego pod nazwą `CLAUDE.md`.
> Skopiuj tam też `PROJECT.md` albo podlinkuj go w README.

Przeczytaj w całości przed każdym zadaniem. Kontekst domenowy: `PROJECT.md`.

---

## 1. Rola frontendu w tym projekcie

Front istnieje po to, żeby **rekruter mógł licytować w trakcie rozmowy**.
To jest jego jedyne zadanie i miara jakości.

Konsekwencje:
- Cztery ekrany zrobione porządnie biją dwanaście zrobionych byle jak.
- Ten projekt nie jest oceniany jako praca frontendowa. Nie inwestujemy w animacje,
  własny design system ani egzotyczne wzorce. Czysto, czytelnie, spójnie.
- Zero stanu biznesowego po stronie klienta. Cena, czas do końca i wynik aukcji
  pochodzą z serwera. Klient nie liczy nic, co ma wpływ na rozstrzygnięcie.

### Ekrany fazy 4
1. Lista aukcji — filtry po typie i terminie, odliczanie
2. Widok aukcji — cena na żywo, historia ofert, formularz licytacji / przycisk akceptacji
3. Portfel — saldo, blokady, historia zapisów księgowych
4. Moje zamówienia — status, termin płatności
5. Panel sprzedawcy — wystawienie oferty i aukcji

---

## 2. Protokół pracy

Identyczny jak w backendzie: zakres → rozpoznanie → plan → implementacja →
weryfikacja (`npm run lint && npm run test && npm run build`).
Raport w tym samym formacie.

---

## 3. Twarde zakazy

- **Nie licz ceny holenderskiej po stronie klienta jako źródła prawdy.**
  Klient może interpolować wyświetlaną wartość dla płynności, ale akceptacja
  wysyła tylko `auctionId` — cenę ustala serwer. Rozbieżność pokazujemy
  użytkownikowi, nie ukrywamy.
- **Nie trzymaj tokenów w `localStorage`.** Pamięć aplikacji + odświeżanie
  przez mechanizm Cognito.
- **Nie zakładaj, że WebSocket działa.** Każdy widok musi działać na samym REST.
  WS to warstwa świeżości, nie warunek działania.
- **Nie ufaj, że po reconnect stan jest aktualny.** Po ponownym połączeniu
  pobierz migawkę aukcji przez REST, dopiero potem nakładaj zdarzenia.
- **Nie dodawaj bibliotek bez uzasadnienia.** Każda zależność w `package.json`
  to decyzja.
- **Nie używaj `any`.** `unknown` + zawężenie typu.
- **Nie formatuj pieniędzy ręcznie.** Jedna funkcja `formatMoney`, `Intl.NumberFormat`,
  waluta zawsze jawna.
- **Nie wyświetlaj czasu bez strefy.** Serwer zwraca `Instant` w ISO-8601 UTC,
  front konwertuje na strefę użytkownika przy wyświetlaniu.
- **Nie refaktoruj poza zakresem zadania.**

---

## 4. Zasady kodu

- TypeScript w trybie `strict`.
- Typy odpowiedzi API generowane z OpenAPI backendu, nie przepisywane ręcznie.
  Rozjazd typów po obu stronach to najczęstsza cicha awaria w dwóch repo.
- TanStack Query do wszystkiego, co pochodzi z serwera. Zero `useEffect` +
  `fetch` do pobierania danych.
- Stan lokalny w `useState`. Globalny magazyn stanu wprowadzamy dopiero, gdy
  realnie zabraknie — nie profilaktycznie.
- Komponenty funkcyjne, jeden komponent na plik.
- Struktura po funkcjonalności, nie po typie pliku:
  `features/auction/`, nie `components/`, `hooks/`, `utils/` na górnym poziomie.
- Stany ładowania, pustki i błędu obsłużone w **każdym** widoku pobierającym dane.
  Brak obsługi błędu to niedokończony ekran.

---

## 5. Testy

- Vitest + Testing Library na logikę komponentów: formatowanie ceny, walidacja
  kwoty oferty, zachowanie przy rozłączeniu WS.
- Playwright na dwa–trzy scenariusze E2E, w tym pełną ścieżkę:
  logowanie → licytacja → potwierdzenie.
- Nie testujemy, że biblioteka działa. Testujemy nasze zachowania.

---

## 6. Konto demo

Ekran startowy ma przycisk wejścia na konto demo — bez rejestracji, z gotowym
saldem i aukcją kończącą się za kilka minut.

To jest najważniejszy element frontu z punktu widzenia celu projektu.
Jeśli rekruter musi się rejestrować, demo nie istnieje.

---

## 7. Kiedy zapytać

- gdy potrzebny endpoint nie istnieje w backendzie — zgłoś, nie stubuj na stałe,
- gdy kontrakt API jest niejasny lub niespójny z `PROJECT.md`,
- gdy zadanie wymaga logiki, która powinna być po stronie serwera.
