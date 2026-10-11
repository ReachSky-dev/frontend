# ReachSky: prompt do wygenerowania motywu frontendu

Wklej całą sekcję „PROMPT” do nowego czatu (albo do Claude Code w repo `frontend/`). Pliki z folderu `reachsky-brand/` (logo, favicon, hero) skopiuj wcześniej do `frontend/public/brand/`.

---

## PROMPT

Jesteś frontend developerem. Zaimplementuj system kolorów i motywów dla aplikacji **ReachSky** (React, platforma z aukcjami na wycieczki last-minute: licytacja angielska z rosnącą ceną i holenderska z malejącą). Motyw musi być spójny z istniejącym logo.

### Logo i jego znaczenie
Znak to niebieska linia wykresu ofert (rosnąca, z punktami-bidami), która przechodzi w pomarańczowy papierowy samolot startujący w prawo w górę. Niebieski oznacza niebo, zaufanie i dane. Pomarańczowy oznacza akcję: licytuj, wygraj, zachód słońca. Wordmark „Reach” jest w kolorze tekstu, a „Sky” w kolorze primary. Pliki:
- `/brand/reachsky-logo-dark.svg` w dark mode, `/brand/reachsky-logo-light.svg` w light mode
- `/brand/favicon.svg`, `/brand/favicon.ico`, `/brand/apple-touch-icon.png`, `/brand/site.webmanifest`
- `/brand/hero.svg` (dark) i `/brand/hero-light.svg` (light) jako ilustracja na landing

### Zasady motywu
1. **Domyślnie dark mode.** Light mode tylko po ręcznym przełączeniu. Nie podążaj za `prefers-color-scheme` przy pierwszej wizycie.
2. Przełącznik (ikona słońce/księżyc) w nagłówku. Wybór zapisuj w `localStorage` pod kluczem `reachsky-theme` (`"dark"` | `"light"`). Odczyt i zapis owiń w `try/catch`.
3. Motyw ustawiaj atrybutem `data-theme` na `<html>`. Żeby uniknąć mignięcia jasnego motywu, wstaw inline script w `index.html` przed załadowaniem bundla: odczytaj `localStorage`, a gdy brak wartości lub błąd, ustaw `dark`.
4. Wszystkie kolory wyłącznie przez CSS custom properties zdefiniowane poniżej. Zero hardcodowanych hexów w komponentach.
5. Ustaw `color-scheme: dark` / `light` odpowiednio, żeby scrollbary i natywne inputy pasowały.
6. Przejście między motywami: `transition: background-color .2s, color .2s, border-color .2s`. Wyłącz je przy `prefers-reduced-motion: reduce`.
7. Logo i hero podmieniaj zależnie od motywu (dark → wersje `-dark`/`hero.svg`, light → `-light`/`hero-light.svg`).

### Tokeny (użyj dokładnie tych wartości)

```css
:root,
:root[data-theme="dark"] {
  color-scheme: dark;

  /* tła i powierzchnie */
  --bg:            #07152A;  /* tło strony, nocne niebo */
  --surface:       #0B1F3A;  /* karty, navbar */
  --surface-2:     #122B4D;  /* hover kart, inputy, chipy */
  --border:        #1E3A5F;
  --border-strong: #2C4F7C;

  /* tekst */
  --text:          #EAF0F8;  /* kontrast 15.9:1 na --bg */
  --text-muted:    #93A4BD;  /* 6.5:1 na --surface */

  /* marka */
  --primary:            #6AA8F7;  /* linki, akcent tekstowy, "Sky" w logo (7.4:1) */
  --primary-solid:      #2F80ED;  /* tło przycisku primary */
  --primary-solid-text: #07152A;  /* tekst na --primary-solid (4.7:1) */
  --primary-hover:      #4C93F0;
  --accent:             #FF7A3D;  /* CTA "Licytuj", timer, LIVE, wygrana */
  --accent-hover:       #FF8F5A;
  --accent-text:        #07152A;  /* tekst na --accent (7.0:1) */

  /* aukcje */
  --auction-english: #FF7A3D;  /* cena rośnie */
  --auction-dutch:   #6AA8F7;  /* cena spada */

  /* statusy */
  --success: #2ECC8F;  /* wygrana licytacja, serwis UP */
  --warning: #F5B841;  /* kończy się < 60 s, serwis DEGRADED */
  --danger:  #F87171;  /* przebity, błąd, serwis DOWN */
  --info:    #6AA8F7;

  /* efekty */
  --glow-accent:  rgba(255, 122, 61, 0.35);
  --glow-primary: rgba(47, 128, 237, 0.25);
  --shadow:       0 8px 24px rgba(0, 0, 0, 0.35);
  --hero-gradient: linear-gradient(180deg, #07152A 0%, #0B1F3A 60%, #122B4D 100%);
}

:root[data-theme="light"] {
  color-scheme: light;

  --bg:            #F6F4EF;  /* ciepły piaskowy, nie czysta biel */
  --surface:       #FFFFFF;
  --surface-2:     #EFECE4;
  --border:        #DDD8CC;
  --border-strong: #C9C2B2;

  --text:          #0B1F3A;  /* 15.0:1 */
  --text-muted:    #52627A;  /* 5.6:1 */

  --primary:            #1A5FC2;  /* 5.5:1 na --bg */
  --primary-solid:      #1A5FC2;
  --primary-solid-text: #FFFFFF;  /* 6.1:1 */
  --primary-hover:      #154FA3;
  --accent:             #FF7A3D;  /* przyciski CTA bez zmian, spójność z logo */
  --accent-hover:       #F06A2C;
  --accent-text:        #0B1F3A;  /* 6.4:1 */
  --accent-on-light-text: #C2410C; /* gdy pomarańcz jest TEKSTEM na białym (5.2:1) */

  --auction-english: #C2410C;
  --auction-dutch:   #1A5FC2;

  --success: #15803D;
  --warning: #B45309;
  --danger:  #DC2626;
  --info:    #1A5FC2;

  --glow-accent:  rgba(255, 122, 61, 0.25);
  --glow-primary: rgba(26, 95, 194, 0.15);
  --shadow:       0 8px 24px rgba(11, 31, 58, 0.08);
  --hero-gradient: linear-gradient(180deg, #FBFAF7 0%, #F6F4EF 60%, #EDE7DA 100%);
}
```

### Typografia
- Font: **Inter** (Google Fonts), wagi 400, 600, 700. Liczby cen i timery z `font-variant-numeric: tabular-nums`, żeby nie skakały przy odliczaniu.
- Nagłówki 700 z `letter-spacing: -0.02em`. Tekst 400.
- Waluta w formacie `€1,890` (EN) lub `1 890 zł` (PL), zależnie od locale.

### Kształty
- Radius: karty `20px`, przyciski i inputy `14px`, pigułki/chipy `9999px`.
- Karty: `--surface` z `1px solid var(--border)`. Bez cieni w dark mode (głębię dają warstwy tła), w light delikatny `--shadow`.

### Reguły użycia kolorów (ważne)
- **Pomarańcz (`--accent`) tylko dla jednej głównej akcji na ekranie**: „Place bid”, „Claim now”, badge LIVE, timer w końcówce. Nigdy jako tło dużych sekcji.
- Primary (niebieski) dla linków, akcentów nawigacji, aktywnych zakładek, focus ringu i drugorzędnych przycisków.
- Focus ring: `outline: 2px solid var(--primary); outline-offset: 2px` na wszystkich interaktywnych elementach.
- Ceny przekreślone (cena katalogowa) w `--text-muted` z `text-decoration: line-through`.

### Komponenty do zbudowania
1. **ThemeToggle**: przycisk z ikoną, `aria-label` „Switch to light mode” / „Switch to dark mode”.
2. **Button**: warianty `accent` (CTA), `primary`, `secondary` (`--surface-2` + `--border`), `ghost`. Stany hover, active, disabled (opacity .5), loading.
3. **AuctionCard**: miniatura destynacji, badge LIVE (pigułka `--accent`, tekst `--accent-text`, kropka pulsująca), nazwa, typ aukcji (chip w `--auction-english` lub `--auction-dutch`), aktualna cena (duża, 700, tabular-nums), przekreślona cena katalogowa, timer, przycisk CTA.
4. **CountdownTimer**: kolor `--text` powyżej 5 min, `--accent` poniżej 5 min, `--danger` poniżej 60 s i delikatny puls.
5. **BidFeed**: lista ostatnich ofert, każda z kwotą przyrostu (`+€20`) w pigułce `--surface-2`. Nowa oferta wjeżdża z krótkim podświetleniem `--glow-primary`.
6. **PriceChart** (opcjonalnie, Recharts lub SVG): linia w `--auction-english` lub `--auction-dutch`, punkty jako kółka z obrysem w kolorze linii i wypełnieniem `--surface`, siatka w `--border`, pole pod linią gradientem od koloru linii (opacity .28) do przezroczystości.
7. **ServiceStatus** na landing (live status serwisów): kropka i etykieta, UP `--success`, DEGRADED `--warning`, DOWN `--danger`.
8. **Navbar**: `--surface` z `backdrop-filter: blur(12px)` i półprzezroczystością, logo po lewej, ThemeToggle i avatar po prawej.

### Landing (hero)
Tło `--hero-gradient` i ilustracja `hero.svg`/`hero-light.svg`. W dark mode dodaj subtelny pomarańczowy radial glow w prawym dolnym rogu (`radial-gradient(circle at 80% 105%, var(--glow-accent), transparent 60%)`) i niebieski w lewym górnym. Nagłówek: „Live auctions for” w `--text`, „last-minute getaways.” w `--accent` (w light: `--accent-on-light-text`).

### Wymagania końcowe
- Kontrast tekstu min. WCAG AA (4.5:1) w obu motywach. Wartości powyżej to spełniają, nie zmieniaj ich bez sprawdzenia.
- Pokaż mi: plik z tokenami CSS, inline script do `index.html`, hook `useTheme`, komponent `ThemeToggle` i przykładowy `AuctionCard`.
